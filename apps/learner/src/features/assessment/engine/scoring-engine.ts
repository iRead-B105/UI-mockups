import type { AssessmentItem, AssessmentResponsePayload, AssessmentTechnicalError } from '../types'
import { assessmentPolicy } from '../config/assessment-policy'

export interface AssessmentScore {
  isEvaluable: boolean
  isCorrect: boolean | null
  technicalError: AssessmentTechnicalError | null
  inputConfidence: number | null
}

const normalize = (value: string): string =>
  value.normalize('NFC').replace(/[\s.,!?·'"“”‘’]/g, '').toLowerCase()

const stringArrayEquals = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const speechMatches = (item: AssessmentItem, transcript: string): boolean => {
  const candidates = [item.answerKey, ...item.speechAliases]
    .flat()
    .map(normalize)
    .filter(Boolean)
  return candidates.includes(normalize(transcript))
}

const unavailableWritingScore = (): AssessmentScore => ({
  isEvaluable: false,
  isCorrect: null,
  inputConfidence: null,
  technicalError: {
    code: 'WRITING_EVALUATOR_UNAVAILABLE',
    message: '필기 응답은 저장되었지만 현재 목업에서는 채점하지 않습니다.',
  },
})

export const scoreAssessmentResponse = (
  item: AssessmentItem,
  payload: AssessmentResponsePayload,
): AssessmentScore => {
  if (payload.kind === 'writing') return unavailableWritingScore()

  if (payload.kind === 'speech' || payload.kind === 'gaze-speech') {
    const confidence = payload.confidence
    if (confidence !== null && confidence < assessmentPolicy.speechInputQualityThreshold) {
      return {
        isEvaluable: false,
        isCorrect: null,
        inputConfidence: confidence,
        technicalError: {
          code: 'SPEECH_LOW_CONFIDENCE',
          message: '음성 인식 품질이 낮아 결과에서 제외합니다.',
        },
      }
    }
    if (payload.kind === 'gaze-speech' && !payload.traceCompleted) {
      return {
        isEvaluable: false,
        isCorrect: null,
        inputConfidence: confidence,
        technicalError: {
          code: 'GAZE_LOW_QUALITY',
          message: '시선 따라가기 기록이 충분하지 않아 결과에서 제외합니다.',
        },
      }
    }
    return {
      isEvaluable: true,
      isCorrect: speechMatches(item, payload.transcript),
      inputConfidence: confidence,
      technicalError: null,
    }
  }

  const expected = Array.isArray(item.answerKey) ? item.answerKey : [item.answerKey]
  let actual: string[]
  if (payload.kind === 'choice') actual = [payload.value]
  else if (payload.kind === 'sequence') actual = payload.value
  else if (payload.kind === 'omit') actual = payload.selectedUnitIds
  else actual = [...payload.targetUnitIds, payload.replacementChoiceId]

  return {
    isEvaluable: true,
    isCorrect: stringArrayEquals(actual, expected),
    inputConfidence: null,
    technicalError: null,
  }
}


