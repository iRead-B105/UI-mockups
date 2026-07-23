import { describe, expect, it } from 'vitest'
import { assessmentItems } from '../data/assessment-items'
import { detailedTrainingLessons } from '../../training/data/detailed-training'

describe('assessment item conversion', () => {
  it('excludes unsupported training activities and lessons', () => {
    const sourceLessonIds = new Set(detailedTrainingLessons.map((lesson) => lesson.id))
    expect(assessmentItems.length).toBeGreaterThan(0)
    expect(assessmentItems.every((item) => sourceLessonIds.has(item.sourceLessonId))).toBe(true)
    expect(assessmentItems.some((item) => item.sourceLessonId === 'hangul-battle')).toBe(false)
  })

  it('limits every converted item to the approved age range and seven item types', () => {
    const allowedTypes = ['gaze-trace', 'sound-choice', 'letter-build', 'sound-omit', 'sound-replace', 'reading', 'short-text']
    expect(assessmentItems.every((item) => item.targetAgeMin === 6 && item.targetAgeMax === 9)).toBe(true)
    expect(assessmentItems.every((item) => allowedTypes.includes(item.itemType))).toBe(true)
  })

  it('does not carry training feedback or hints into assessment prompts', () => {
    expect(assessmentItems.every((item) => !('feedback' in item.prompt) && !('hint' in item.prompt))).toBe(true)
  })

  it('keeps card, writing, and speaking responses as separate assessment items', () => {
    const sourceItems = assessmentItems.filter((item) => item.sourceLessonId === 'listen-and-respond')
    expect(sourceItems.map((item) => item.responseMode)).toEqual(['choice', 'writing', 'speech'])
  })
})

