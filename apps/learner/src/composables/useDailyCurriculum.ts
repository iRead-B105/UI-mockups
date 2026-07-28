import { computed, reactive, ref } from 'vue'
import { findLessonSummary } from '@/mocks/trainingLookup'
import { fetchCurrentCurriculum } from '@/services/learnerDataRepository'
import type { TrainingLessonSummary } from '@/types/training'

export interface DailyCurriculumItem {
  categoryId: string
  lesson: TrainingLessonSummary
}

export type CurriculumRoundStatus = 'preparing' | 'ready' | 'rest' | 'completed'

const curriculumItems = reactive<DailyCurriculumItem[]>([])
const currentIndex = ref(0)
const curriculumStatus = ref<CurriculumRoundStatus>('preparing')
const curriculumId = ref('')
const studyDate = ref<string | null>(null)
let loadPromise: Promise<void> | null = null

const loadCurrentCurriculum = () => {
  if (loadPromise) return loadPromise

  loadPromise = fetchCurrentCurriculum().then((response) => {
    curriculumId.value = response.curriculumId
    studyDate.value = response.studyDate
    curriculumStatus.value = response.status.toLowerCase() as CurriculumRoundStatus
    currentIndex.value = Math.max(response.currentOrder - 1, 0)

    curriculumItems.splice(
      0,
      curriculumItems.length,
      ...response.trainings.flatMap((training) => {
        const lesson = findLessonSummary(training.categoryId, training.lessonId)
        return lesson ? [{ categoryId: training.categoryId, lesson }] : []
      }),
    )
  }).catch(() => {
    curriculumStatus.value = 'preparing'
    loadPromise = null
  })

  return loadPromise
}

void loadCurrentCurriculum()

export function useDailyCurriculum() {
  const isTodayComplete = computed(() => (
    curriculumStatus.value === 'completed'
    || (curriculumStatus.value === 'ready' && currentIndex.value >= curriculumItems.length)
  ))

  const markLessonComplete = (lessonId: string) => {
    const lessonIndex = curriculumItems.findIndex((item) => item.lesson.id === lessonId)
    if (lessonIndex === currentIndex.value) {
      currentIndex.value += 1
      if (currentIndex.value >= curriculumItems.length) curriculumStatus.value = 'completed'
    }
    return lessonIndex >= 0 ? curriculumItems[lessonIndex + 1] ?? null : null
  }

  return {
    curriculumItems,
    curriculumId,
    studyDate,
    curriculumStatus,
    currentIndex,
    isTodayComplete,
    markLessonComplete,
    loadCurrentCurriculum,
  }
}
