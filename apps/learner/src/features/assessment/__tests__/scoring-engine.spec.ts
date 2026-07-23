import { describe, expect, it } from 'vitest'
import { assessmentItems } from '../data/assessment-items'
import { scoreAssessmentResponse } from '../engine/scoring-engine'

describe('assessment scoring', () => {
  it('scores a choice only after a final response payload is submitted', () => {
    const item = assessmentItems.find((value) => value.responseMode === 'choice')
    expect(item).toBeDefined()
    if (!item) return
    const answer = Array.isArray(item.answerKey) ? item.answerKey[0] ?? '' : item.answerKey
    const score = scoreAssessmentResponse(item, { kind: 'choice', value: answer, editCount: 2 })
    expect(score).toMatchObject({ isEvaluable: true, isCorrect: true, technicalError: null })
  })

  it('excludes low-confidence speech instead of treating it as an incorrect answer', () => {
    const item = assessmentItems.find((value) => value.responseMode === 'speech')
    expect(item).toBeDefined()
    if (!item) return
    const score = scoreAssessmentResponse(item, { kind: 'speech', transcript: '응답', confidence: 0.1 })
    expect(score.isEvaluable).toBe(false)
    expect(score.isCorrect).toBeNull()
    expect(score.technicalError?.code).toBe('SPEECH_LOW_CONFIDENCE')
  })

  it('keeps handwriting as a technical invalid result until an evaluator is connected', () => {
    const item = assessmentItems[0]
    expect(item).toBeDefined()
    if (!item) return
    const score = scoreAssessmentResponse(item, { kind: 'writing', strokes: [[{ x: 10, y: 10 }]] })
    expect(score.technicalError?.code).toBe('WRITING_EVALUATOR_UNAVAILABLE')
    expect(score.isEvaluable).toBe(false)
  })
})


