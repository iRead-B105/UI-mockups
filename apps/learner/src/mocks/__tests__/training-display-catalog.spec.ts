import { describe, expect, it } from 'vitest'
import { isPlayableLesson } from '../trainingLookup'
import {
  isLearnerVisibleLesson,
  trainingDisplayCategories,
} from '../trainingDisplayCatalog'

const visibleLessons = trainingDisplayCategories
  .flatMap((category) => category.sections)
  .flatMap((section) => section.lessons)

describe('training display catalog', () => {
  it('exposes the three documented display categories', () => {
    expect(trainingDisplayCategories.map((category) => category.id)).toEqual([
      'sound-phonics',
      'decoding-comprehension',
      'fluency',
    ])
  })

  it('exposes 28 lessons without duplicate lesson ids', () => {
    const lessonIds = visibleLessons.map((lesson) => lesson.id)

    expect(lessonIds).toHaveLength(28)
    expect(new Set(lessonIds).size).toBe(28)
  })

  it('does not expose battle or duplicate lessons', () => {
    const lessonIds = new Set(visibleLessons.map((lesson) => lesson.id))
    const hiddenLessonIds = [
      'battle-rabbit',
      'battle-turtle',
      'battle-ant',
      'word-first-sound-choice',
      'batchim-sound',
      'repeat-sentence',
    ]

    hiddenLessonIds.forEach((lessonId) => expect(lessonIds.has(lessonId)).toBe(false))
  })

  it('keeps every display lesson connected to its playable legacy route ids', () => {
    visibleLessons.forEach((lesson) => {
      expect(isPlayableLesson(lesson.categoryId, lesson.id)).toBe(true)
      expect(isLearnerVisibleLesson(lesson.categoryId, lesson.id)).toBe(true)
    })
  })
})
