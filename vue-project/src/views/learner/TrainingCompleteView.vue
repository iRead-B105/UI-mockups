<script setup lang="ts">
// 훈련 완료 화면
// 세션에 기록된 목업 완료 타임스탬프와 축하 메시지를 보여줍니다.
// 점수/진단 결과는 표시하지 않습니다.

import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLessonById } from '@/mocks/trainingLessons'
import { useTrainingSession } from '@/composables/useTrainingSession'
import TrainingComplete from '@/components/training/TrainingComplete.vue'

const route = useRoute()
const router = useRouter()
const session = useTrainingSession()

const lessonId = computed(() => String(route.params.lessonId ?? ''))
const categoryId = computed(() => String(route.params.categoryId ?? ''))

const lesson = computed(() => getLessonById(lessonId.value))

// 마지막 문제의 완료 피드백 문구(없으면 기본 문구)
const completionMessage = computed(() => {
  const questions = lesson.value?.questions
  if (questions && questions.length > 0) {
    const last = questions[questions.length - 1]
    return last?.feedback?.completed ?? '훈련을 무사히 마쳤어요!'
  }
  return '훈련을 무사히 마쳤어요!'
})

// 직접 진입(완료되지 않은 상태) 시 인트로로 보냄
onMounted(() => {
  const valid =
    session.progressState.isCompleted &&
    session.progressState.lessonId === lessonId.value &&
    session.progressState.categoryId === categoryId.value
  if (!valid) {
    void router.replace({
      name: 'training-lesson',
      params: { categoryId: categoryId.value, lessonId: lessonId.value },
    })
  }
})

const handleRetry = () => {
  // 다시 하기 → 레슨 화면(인트로)으로 이동. startLesson 은 레슨 진입 시 재실행됨
  void router.push({
    name: 'training-lesson',
    params: { categoryId: categoryId.value, lessonId: lessonId.value },
  })
}

const handleHome = () => {
  void router.push({ name: 'training-home' })
}
</script>

<template>
  <TrainingComplete
    v-if="lesson"
    :lesson-title="lesson.title"
    :completed-at="session.progressState.completedAt"
    :completion-message="completionMessage"
    @retry="handleRetry"
    @home="handleHome"
  />
</template>
