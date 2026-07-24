import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { isValidCategoryId, isPlayableLesson } from '../../mocks/trainingLookup'
import {
  isLearnerVisibleLesson,
  isValidTrainingDisplayCategoryId,
} from '../../mocks/trainingDisplayCatalog'
import { useTrainingSession } from '../../composables/useTrainingSession'
import { useAssessmentSession } from '../../features/assessment/composables/useAssessmentSession'
import { useLearnerAccessSession } from '../../composables/useLearnerAccessSession'

const learnerAccess = useLearnerAccessSession()

const resolveEntryRoute = () => {
  learnerAccess.load()
  if (!learnerAccess.educatorAuthenticated.value) return { name: 'login' }
  if (learnerAccess.learnerSessionReady.value) return { name: 'learner-home' }
  if (learnerAccess.selectedStudent.value) {
    return {
      name: 'session-calibration',
      params: { studentId: learnerAccess.selectedStudent.value.id },
    }
  }
  return { name: 'student-selector' }
}

const redirectAuthenticatedEducator: RouteRecordRaw['beforeEnter'] = () => {
  learnerAccess.load()
  return learnerAccess.educatorAuthenticated.value ? resolveEntryRoute() : true
}

const requireEducatorSession: RouteRecordRaw['beforeEnter'] = () => {
  learnerAccess.load()
  return learnerAccess.educatorAuthenticated.value ? true : { name: 'login' }
}

const requireSelectedStudent: RouteRecordRaw['beforeEnter'] = (to) => {
  learnerAccess.load()
  if (!learnerAccess.educatorAuthenticated.value) return { name: 'login' }

  const student = learnerAccess.selectedStudent.value
  if (!student) return { name: 'student-selector' }
  if (String(to.params.studentId ?? '') !== student.id) {
    return {
      name: 'session-calibration',
      params: { studentId: student.id },
    }
  }
  if (learnerAccess.learnerSessionReady.value) return { name: 'learner-home' }
  return true
}

const requireReadyLearnerSession: RouteRecordRaw['beforeEnter'] = () => {
  learnerAccess.load()
  return learnerAccess.learnerSessionReady.value ? true : resolveEntryRoute()
}

// 훈련 라우트 ID 검증 가드. 무효한 카테고리/레슨은 /learner/training 으로 돌려보냅니다.
const redirectTrainingHome = `/learner/training`

const validateCategory: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  if (!isValidTrainingDisplayCategoryId(categoryId)) return redirectTrainingHome
  return true
}

const validateLesson: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  const lessonId = String(to.params.lessonId ?? '')
  if (
    !isValidCategoryId(categoryId)
    || !isPlayableLesson(categoryId, lessonId)
    || !isLearnerVisibleLesson(categoryId, lessonId)
  ) {
    return redirectTrainingHome
  }
  return true
}

const validateComplete: RouteRecordRaw['beforeEnter'] = (to) => {
  const categoryId = String(to.params.categoryId ?? '')
  const lessonId = String(to.params.lessonId ?? '')
  if (
    !isValidCategoryId(categoryId)
    || !isPlayableLesson(categoryId, lessonId)
    || !isLearnerVisibleLesson(categoryId, lessonId)
  ) {
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

const validateAssessmentSession: RouteRecordRaw['beforeEnter'] = () => {
  const { load } = useAssessmentSession()
  const assessmentSession = load()
  if (!assessmentSession) return { name: 'assessment-intro' }
  if (assessmentSession.status === 'completed') return { name: 'assessment-complete' }
  return true
}

const validateAssessmentComplete: RouteRecordRaw['beforeEnter'] = () => {
  const { load } = useAssessmentSession()
  const assessmentSession = load()
  if (assessmentSession?.status !== 'completed') return { name: 'assessment-intro' }
  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../../views/LoginView.vue'),
      beforeEnter: redirectAuthenticatedEducator,
    },
    {
      path: '/session/students',
      name: 'student-selector',
      component: () => import('../../views/session/StudentSelectorView.vue'),
      beforeEnter: requireEducatorSession,
    },
    {
      path: '/session/calibration/:studentId',
      name: 'session-calibration',
      component: () => import('../../views/session/CalibrationView.vue'),
      beforeEnter: requireSelectedStudent,
    },
    {
      path: '/',
      redirect: resolveEntryRoute,
    },
    {
      path: '/learner',
      component: () => import('../../layouts/LearnerLayout.vue'),
      beforeEnter: requireReadyLearnerSession,
      children: [
        {
          path: '',
          name: 'learner-home',
          component: () => import('../../views/learner/LearnerHomeView.vue'),
          meta: { learnerEmotion: 'playful' },
        },
        {
          path: 'assessment',
          name: 'assessment-intro',
          component: () => import('../../views/learner/AssessmentIntroView.vue'),
          meta: { learnerEmotion: 'calm', showLearnerHelp: true },
        },
        {
          path: 'assessment/session',
          name: 'assessment-session',
          component: () => import('../../views/learner/AssessmentSessionView.vue'),
          beforeEnter: validateAssessmentSession,
          meta: { hideLearnerHeader: true, learnerEmotion: 'calm', showLearnerHelp: true },
        },
        {
          path: 'assessment/complete',
          name: 'assessment-complete',
          component: () => import('../../views/learner/AssessmentCompleteView.vue'),
          beforeEnter: validateAssessmentComplete,
          meta: { hideLearnerHeader: true, learnerEmotion: 'balanced' },
        },
        {
          path: 'stories',
          name: 'story-selection',
          component: () => import('../../views/learner/StorySelectionView.vue'),
          meta: { learnerEmotion: 'playful' },
        },
        {
          path: 'stories/:storyId',
          name: 'story-reading',
          component: () => import('../../views/learner/StoryReaderView.vue'),
          meta: { learnerEmotion: 'playful' },
        },
        {
          // 훈련 선택 홈: 3개 대분류
          path: 'training',
          name: 'training-home',
          component: () => import('../../views/learner/TrainingHomeView.vue'),
          meta: { learnerEmotion: 'calm', showLearnerHelp: true },
        },
        {
          // 대분류 서브메뉴 모달(라우트 파라미터로 모달 제어)
          path: 'training/:categoryId',
          name: 'training-category',
          component: () => import('../../views/learner/TrainingHomeView.vue'),
          beforeEnter: validateCategory,
          meta: { learnerEmotion: 'calm', showLearnerHelp: true },
        },
        {
          // 레슨 화면(인트로 → 문제 → 저장)
          path: 'training/:categoryId/:lessonId',
          name: 'training-lesson',
          component: () => import('../../views/learner/TrainingLessonView.vue'),
          beforeEnter: validateLesson,
          meta: { learnerEmotion: 'calm', showLearnerHelp: true },
        },
        {
          // 완료 화면
          path: 'training/:categoryId/:lessonId/complete',
          name: 'training-complete',
          component: () => import('../../views/learner/TrainingCompleteView.vue'),
          beforeEnter: validateComplete,
          meta: { hideLearnerHeader: true, learnerEmotion: 'balanced' },
        },
        {
          path: 'growth',
          name: 'growth',
          component: () => import('../../views/learner/ChildVillageDashboardView.vue'),
          meta: { learnerEmotion: 'playful' },
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
      redirect: resolveEntryRoute,
    },
  ],
})

export default router
