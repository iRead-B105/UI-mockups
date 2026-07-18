import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/teacher/dashboard' },
    {
      path: '/teacher',
      component: () => import('@/layouts/TeacherLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'teacher-dashboard',
          component: () => import('@/views/teacher/TeacherDashboardView.vue'),
          meta: { title: '대시보드', section: 'dashboard' },
        },
        {
          path: 'students/new',
          name: 'student-create',
          component: () => import('@/views/teacher/StudentCreateView.vue'),
          meta: { title: '학생 관리', section: 'students' },
        },
        {
          path: 'students/:id/edit',
          name: 'student-edit',
          component: () => import('@/views/teacher/StudentEditView.vue'),
          meta: { title: '학생 관리', section: 'students' },
        },
        {
          path: 'students/:id',
          component: () => import('@/layouts/StudentManagementLayout.vue'),
          meta: { title: '학생 관리', section: 'students' },
          children: [
            {
              path: '',
              name: 'student-overview',
              component: () => import('@/views/teacher/StudentOverviewView.vue'),
            },
            {
              path: 'curriculum',
              name: 'student-curriculum',
              component: () => import('@/views/teacher/StudentCurriculumView.vue'),
            },
            {
              path: 'training-history',
              name: 'student-training-history',
              component: () => import('@/views/teacher/StudentTrainingHistoryView.vue'),
            },
            {
              path: 'test-history',
              name: 'student-test-history',
              component: () => import('@/views/teacher/StudentTestHistoryView.vue'),
            },
            {
              path: 'report',
              name: 'student-report',
              component: () => import('@/views/teacher/StudentReportView.vue'),
            },
          ],
        },
        {
          path: 'settings',
          name: 'teacher-settings',
          component: () => import('@/views/teacher/TeacherSettingsView.vue'),
          meta: { title: '프로필 관리', section: 'settings' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/teacher/dashboard' },
  ],
})

export default router
