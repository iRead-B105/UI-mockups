import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { isValidCategoryId, isPlayableLesson } from '../../mocks/trainingLookup'
import { useTrainingSession } from '../../composables/useTrainingSession'

// 훈련 라우트 ID 검증 가드. 무효한 카테고리/레슨은 /learner/training 으로 돌려보냅니다.
const redirectTrainingHome = `/learner/training`

const validateCategory: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  if (!isValidCategoryId(categoryId)) return redirectTrainingHome
  return true
}

const validateLesson: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  const lessonId = String(to.params.lessonId ?? '')
  if (!isValidCategoryId(categoryId) || !isPlayableLesson(categoryId, lessonId)) {
    return redirectTrainingHome
  }
  return true
}

const validateComplete: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  const lessonId = String(to.params.lessonId ?? '')
  if (!isValidCategoryId(categoryId) || !isPlayableLesson(categoryId, lessonId)) {
    return redirectTrainingHome
  }
  // 완료된 세션이 아니면 인트로(레슨)로 보냄
  const { progressState } = useTrainingSession()
  const completed =
    progressState.isCompleted &&
    progressState.lessonId === lessonId &&
    progressState.categoryId === categoryId
  if (!completed) {
    return { name: 'training-lesson', params: { categoryId, lessonId } }
  }
  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../../views/LoginView.vue'),
    },
    {
      path: '/',
      redirect: '/learner',
    },
    {
      path: '/learner',
      component: () => import('../../layouts/LearnerLayout.vue'),
      children: [
        {
          path: '',
          name: 'learner-home',
          component: () => import('../../views/learner/LearnerHomeView.vue'),
        },
        {
          path: 'stories',
          name: 'story-selection',
          component: () => import('../../views/learner/StorySelectionView.vue'),
        },
        {
          // 스토리 읽기 전 시선 보정(4점 앵커). 하드웨어가 없으면 건너뛰기 가능.
          path: 'stories/:storyId/calibration',
          name: 'story-gaze-calibration',
          component: () => import('../../views/learner/StoryGazeCalibrationView.vue'),
        },
        {
          path: 'stories/:storyId',
          name: 'story-reading',
          component: () => import('../../views/learner/StoryReaderView.vue'),
        },
        {
          // 훈련 선택 홈: 4개 대분류
          path: 'training',
          name: 'training-home',
          component: () => import('../../views/learner/TrainingHomeView.vue'),
        },
        {
          // 대분류 서브메뉴 모달(라우트 파라미터로 모달 제어)
          path: 'training/:categoryId',
          name: 'training-category',
          component: () => import('../../views/learner/TrainingHomeView.vue'),
          beforeEnter: validateCategory,
        },
        {
          // 레슨 화면(인트로 → 문제 → 저장)
          path: 'training/:categoryId/:lessonId',
          name: 'training-lesson',
          component: () => import('../../views/learner/TrainingLessonView.vue'),
          beforeEnter: validateLesson,
        },
        {
          // 완료 화면
          path: 'training/:categoryId/:lessonId/complete',
          name: 'training-complete',
          component: () => import('../../views/learner/TrainingCompleteView.vue'),
          beforeEnter: validateComplete,
          meta: { hideLearnerHeader: true },
        },
        {
          path: 'training/today/complete',
          name: 'training-today-complete',
          component: () => import('../../views/learner/TodayTrainingCompleteView.vue'),
          meta: { hideLearnerHeader: true },
        },
        {
          path: 'growth',
          name: 'growth',
          component: () => import('../../views/learner/GrowthView.vue'),
        },
        {
          path: 'challenge',
          name: 'skill-challenge',
          component: () => import('../../views/learner/SkillChallengeView.vue'),
        },
        {
          path: 'challenge/complete',
          name: 'skill-challenge-complete',
          component: () => import('../../views/learner/SkillChallengeCompleteView.vue'),
          meta: { hideLearnerHeader: true },
        },
      ],
    },
    {
      path: '/educator',
      component: () => import('../../layouts/EducatorLayout.vue'),
      children: [
        {
          path: '',
          name: 'educator-home',
          component: () => import('../../views/educator/EducatorHomeView.vue'),
        },
      ],
    },
    {
      // 그 외 모든 경로는 학습자 홈으로
      path: '/:pathMatch(.*)*',
      redirect: '/learner',
    },
  ],
})

export default router
