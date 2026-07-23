import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAssessmentSession } from '../composables/useAssessmentSession'

const storage = new Map<string, string>()
const localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => { storage.set(key, value) },
  removeItem: (key: string) => { storage.delete(key) },
  clear: () => { storage.clear() },
}

describe('assessment session navigation', () => {
  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('window', { localStorage })
    vi.stubGlobal('navigator', { mediaDevices: undefined, maxTouchPoints: 0 })
  })

  it('keeps the submitted item visible until the learner chooses next', () => {
    const assessment = useAssessmentSession()
    assessment.reset()
    assessment.start()
    const item = assessment.currentItem.value
    expect(item?.responseMode).toBe('choice')
    if (!item) return

    const answer = Array.isArray(item.answerKey) ? item.answerKey[0] ?? '' : item.answerKey
    const accepted = assessment.submit(
      { kind: 'choice', value: answer, editCount: 0 },
      'mouse',
    )

    expect(accepted).toBe(true)
    expect(assessment.session.value?.currentItemId).toBe(item.id)
    expect(assessment.session.value?.awaitingNext).toBe(true)
    expect(assessment.isNeutralFeedbackVisible.value).toBe(true)

    expect(assessment.nextItem()).toBe(true)
    expect(assessment.session.value?.currentItemId).not.toBe(item.id)
    expect(assessment.session.value?.awaitingNext).toBe(false)
  })

  it('moves past unavailable mock input without treating it as an incorrect answer', () => {
    const assessment = useAssessmentSession()
    assessment.reset()
    assessment.start()
    const itemId = assessment.currentItem.value?.id

    expect(assessment.skipCurrentItemForMock()).toBe(true)
    expect(assessment.skipCurrentItemForMock()).toBe(false)

    const response = assessment.session.value?.responses.at(-1)
    expect(response).toMatchObject({
      itemId,
      responseState: 'technical_invalid',
      responsePayload: null,
      isEvaluable: false,
      isCorrect: null,
      observedErrorCodes: [],
      technicalError: { code: 'MOCK_INPUT_UNAVAILABLE' },
    })
    expect(assessment.session.value?.currentItemId).not.toBe(itemId)
  })

  it('can reach the completion state using only mock navigation', async () => {
    const assessment = useAssessmentSession()
    assessment.reset()
    assessment.start()
    let safetyCount = 0

    while (assessment.session.value?.status !== 'completed' && safetyCount < 30) {
      expect(assessment.skipCurrentItemForMock()).toBe(true)
      safetyCount += 1
      await new Promise((resolve) => globalThis.setTimeout(resolve, 0))
    }

    expect(assessment.session.value?.status).toBe('completed')
    expect(safetyCount).toBeLessThan(30)
    expect(assessment.session.value?.responses.every((response) => !response.isEvaluable)).toBe(true)
  })
})

