import { computed, ref } from 'vue'
import { assessmentPolicy } from '../config/assessment-policy'
import {
  advanceAssessment,
  createInitialEngineState,
  selectFirstAssessmentItem,
  selectParallelAssessmentItem,
} from '../engine/adaptive-engine'
import { mapObservedErrors } from '../engine/error-mapper'
import { buildAssessmentResult } from '../engine/recommendation-engine'
import { scoreAssessmentResponse } from '../engine/scoring-engine'
import { assessmentItemById } from '../data/assessment-items'
import { assessmentRepository } from '../repository/assessment-repository'
import type {
  AssessmentDeviceContext,
  AssessmentInputModality,
  AssessmentResponsePayload,
  AssessmentResponseEvent,
  AssessmentSession,
  AssessmentTechnicalError,
  AssessmentType,
} from '../types'

const DEFAULT_LEARNER_ID = '1'
const session = ref<AssessmentSession | null>(null)
const isNeutralFeedbackVisible = ref(false)
const pendingAdvance = ref(false)

const releaseAdvanceLock = () => {
  globalThis.setTimeout(() => {
    pendingAdvance.value = false
  }, 0)
}

const createDeviceContext = (): AssessmentDeviceContext => ({
  gazeAvailable: false,
  microphoneAvailable: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices),
  touchAvailable: typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0,
  pointerType: typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 ? 'touch' : 'mouse',
})

const createSession = (type: AssessmentType, learnerId: string): AssessmentSession => {
  const firstItem = selectFirstAssessmentItem()
  return {
    id: `assessment-${learnerId}-${Date.now()}`,
    learnerId,
    type,
    policyVersion: assessmentPolicy.version,
    status: 'ready',
    currentItemId: firstItem?.id ?? null,
    awaitingNext: false,
    pendingNextItemId: null,
    pendingComplete: false,
    administeredItemIds: [],
    discardedItemIds: [],
    responses: [],
    engineState: createInitialEngineState(),
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    pausedAt: null,
  }
}

// localStorage에 남아 있는 이전 목업 세션에도 다음 문항 대기 상태의 기본값을 보완한다.
const normalizeSession = (value: AssessmentSession): AssessmentSession => ({
  ...value,
  awaitingNext: value.awaitingNext ?? false,
  pendingNextItemId: value.pendingNextItemId ?? null,
  pendingComplete: value.pendingComplete ?? false,
})

export const useAssessmentSession = () => {
  const currentItem = computed(() => session.value?.currentItemId ? assessmentItemById.get(session.value.currentItemId) ?? null : null)
  const completedCount = computed(() => session.value?.responses.length ?? 0)
  const progressPercent = computed(() => Math.min(100, Math.round((completedCount.value / assessmentPolicy.commonScreeningTargetItems) * 100)))
  const canResume = computed(() => Boolean(session.value && ['paused', 'stopped_by_learner', 'technical_interruption', 'unexpected_interruption'].includes(session.value.status)))

  const load = (learnerId = DEFAULT_LEARNER_ID) => {
    const saved = assessmentRepository.getSession(learnerId)
    session.value = saved ? normalizeSession(saved) : null
    isNeutralFeedbackVisible.value = Boolean(session.value?.awaitingNext)
    return session.value
  }

  const prepare = (type: AssessmentType = 'initial', learnerId = DEFAULT_LEARNER_ID) => {
    const saved = assessmentRepository.getSession(learnerId)
    session.value = saved?.status === 'completed'
      ? createSession(type, learnerId)
      : saved
        ? normalizeSession(saved)
        : createSession(type, learnerId)
    isNeutralFeedbackVisible.value = session.value.awaitingNext
    assessmentRepository.saveSession(session.value)
  }

  const start = () => {
    if (!session.value) prepare()
    if (!session.value) return
    if (session.value.status === 'ready' || session.value.status === 'created') {
      session.value.status = 'in_progress'
      session.value.startedAt = new Date().toISOString()
      assessmentRepository.saveSession(session.value)
    }
  }

  const resume = () => {
    if (!session.value) load()
    const active = session.value
    if (!active) return
    const previousItem = active.currentItemId ? assessmentItemById.get(active.currentItemId) : null
    if (previousItem && !active.administeredItemIds.includes(previousItem.id)) {
      active.discardedItemIds.push(previousItem.id)
      const parallel = selectParallelAssessmentItem(previousItem, active.administeredItemIds, active.discardedItemIds)
      active.currentItemId = parallel?.id ?? previousItem.id
    }
    active.status = 'in_progress'
    active.pausedAt = null
    assessmentRepository.saveSession(active)
  }

  const pause = () => {
    if (!session.value || session.value.status !== 'in_progress') return
    session.value.status = 'paused'
    session.value.pausedAt = new Date().toISOString()
    assessmentRepository.saveSession(session.value)
  }

  const stopByLearner = () => {
    if (!session.value) return
    session.value.status = 'stopped_by_learner'
    session.value.pausedAt = new Date().toISOString()
    assessmentRepository.saveSession(session.value)
  }

  const complete = () => {
    if (!session.value) return
    session.value.status = 'completed'
    session.value.currentItemId = null
    session.value.awaitingNext = false
    session.value.pendingNextItemId = null
    session.value.pendingComplete = false
    session.value.completedAt = new Date().toISOString()
    isNeutralFeedbackVisible.value = false
    const result = buildAssessmentResult(session.value)
    assessmentRepository.saveSession(session.value)
    assessmentRepository.saveResult(result)
  }

  const submit = (
    payload: AssessmentResponsePayload | null,
    modality: AssessmentInputModality,
    options: {
      replayCount?: number
      instructionRepeatCount?: number
      responseDurationMs?: number
      technicalError?: AssessmentTechnicalError | null
    } = {},
  ) => {
    const active = session.value
    const item = currentItem.value
    if (
      !active
      || !item
      || active.status !== 'in_progress'
      || active.awaitingNext
      || pendingAdvance.value
    ) return false

    let score
    if (options.technicalError) {
      score = {
        isEvaluable: false,
        isCorrect: null,
        inputConfidence: null,
        technicalError: options.technicalError,
      }
    } else {
      if (!payload) return false
      score = scoreAssessmentResponse(item, payload)
    }
    const editCount = payload && 'editCount' in payload ? payload.editCount : 0
    const response: AssessmentResponseEvent = {
      sessionId: active.id,
      itemId: item.id,
      itemVersion: item.version,
      learnerId: active.learnerId,
      modality,
      responseState: score.isEvaluable ? 'submitted' as const : 'technical_invalid' as const,
      responsePayload: payload,
      isEvaluable: score.isEvaluable,
      isCorrect: score.isCorrect,
      observedErrorCodes: score.isEvaluable && payload
        ? mapObservedErrors(item, payload, score.isCorrect)
        : [],
      targetReplayCount: options.replayCount ?? 0,
      instructionRepeatCount: options.instructionRepeatCount ?? 0,
      editCount,
      selfCorrectionCount: editCount,
      responseDurationMs: options.responseDurationMs ?? null,
      inputConfidence: score.inputConfidence,
      technicalError: score.technicalError,
      deviceContext: createDeviceContext(),
      submittedAt: new Date().toISOString(),
    }
    active.responses.push(response)
    if (!active.administeredItemIds.includes(item.id)) active.administeredItemIds.push(item.id)
    const step = advanceAssessment(active.engineState, item, response, active.administeredItemIds, active.discardedItemIds)
    active.engineState = step.state
    active.awaitingNext = true
    active.pendingNextItemId = step.nextItem?.id ?? null
    active.pendingComplete = step.shouldComplete
    isNeutralFeedbackVisible.value = true
    assessmentRepository.saveSession(active)
    return true
  }

  const nextItem = () => {
    const active = session.value
    if (!active || !active.awaitingNext || pendingAdvance.value) return false

    pendingAdvance.value = true
    const nextItemId = active.pendingNextItemId
    const shouldComplete = active.pendingComplete || !nextItemId
    active.awaitingNext = false
    active.pendingNextItemId = null
    active.pendingComplete = false
    isNeutralFeedbackVisible.value = false

    if (shouldComplete) {
      complete()
      releaseAdvanceLock()
      return true
    }

    active.currentItemId = nextItemId
    assessmentRepository.saveSession(active)
    releaseAdvanceLock()
    return true
  }

  const skipCurrentItemForMock = () => {
    const item = currentItem.value
    if (!assessmentPolicy.mockNavigationEnabled || !item) return false

    const modality: AssessmentInputModality =
      item.responseMode === 'gaze-speech'
        ? 'gaze'
        : item.responseMode === 'speech'
          ? 'voice'
          : item.responseMode === 'writing'
            ? 'writing'
            : typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
              ? 'touch'
              : 'mouse'
    const recorded = submit(null, modality, {
      technicalError: {
        code: 'MOCK_INPUT_UNAVAILABLE',
        message: '목업에서 입력 기능을 사용하지 않고 다음 문항으로 이동했습니다.',
      },
    })
    return recorded ? nextItem() : false
  }

  const reset = (type: AssessmentType = 'initial', learnerId = DEFAULT_LEARNER_ID) => {
    session.value = createSession(type, learnerId)
    isNeutralFeedbackVisible.value = false
    pendingAdvance.value = false
    assessmentRepository.saveSession(session.value)
  }

  return {
    session,
    currentItem,
    completedCount,
    progressPercent,
    canResume,
    isNeutralFeedbackVisible,
    pendingAdvance,
    load,
    prepare,
    start,
    resume,
    pause,
    stopByLearner,
    complete,
    submit,
    nextItem,
    skipCurrentItemForMock,
    reset,
  }
}

