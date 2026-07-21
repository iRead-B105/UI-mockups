<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { selectedStudent, students } from '@/features/teacher/mockData'
import type { Student } from '@/features/teacher/types'
import SidebarIcon from '@/components/teacher/SidebarIcon.vue'
import StudentSwitcher from '@/components/teacher/StudentSwitcher.vue'

type SidebarMode = 'teacher' | 'student'

const route = useRoute()
const router = useRouter()
const mode = ref<SidebarMode>('teacher')
const isAccountMenuOpen = ref(false)
const currentStudent = computed(
  () => students.find((student) => student.id === Number(route.params.id)) ?? selectedStudent,
)
const studentRouteNames = new Set([
  'student-overview',
  'student-curriculum',
  'student-training-history',
  'student-test-history',
  'student-report',
  'student-edit',
])

watch(
  () => route.name,
  (routeName) => {
    mode.value = studentRouteNames.has(String(routeName)) ? 'student' : 'teacher'
    isAccountMenuOpen.value = false
  },
  { immediate: true },
)

function selectMode(nextMode: SidebarMode) {
  mode.value = nextMode
  router.push(
    nextMode === 'teacher' ? '/teacher/dashboard' : `/teacher/students/${currentStudent.value.id}`,
  )
}

function selectStudent(student: Student) {
  const routeName = studentRouteNames.has(String(route.name)) ? String(route.name) : 'student-overview'
  router.push({ name: routeName, params: { id: student.id } })
}

function openProfileSettings() {
  isAccountMenuOpen.value = false
  router.push('/teacher/settings')
}

function logout() {
  isAccountMenuOpen.value = false
  router.push('/login')
}

function closeAccountMenuOnOutsideClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return
  if (!event.target.closest('.sidebar-account')) isAccountMenuOpen.value = false
}

onMounted(() => document.addEventListener('click', closeAccountMenuOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', closeAccountMenuOnOutsideClick))
</script>

<template>
  <aside class="teacher-sidebar">
    <RouterLink
      class="sidebar-brand"
      to="/teacher/dashboard"
      aria-label="iRead 학습자 목록"
    >
      <img src="/images/iread-logo.png" alt="iRead" />
    </RouterLink>

    <div class="sidebar-mode-tabs" role="tablist" aria-label="관리 대상 선택">
      <button
        type="button"
        role="tab"
        :aria-selected="mode === 'teacher'"
        :class="{ active: mode === 'teacher' }"
        @click="selectMode('teacher')"
      >
        교수자
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="mode === 'student'"
        :class="{ active: mode === 'student' }"
        @click="selectMode('student')"
      >
        아동
      </button>
    </div>

    <Transition name="sidebar-panel" mode="out-in">
      <div v-if="mode === 'teacher'" key="teacher" class="sidebar-panel">
        <nav class="sidebar-nav" aria-label="교수자 메뉴">
          <RouterLink to="/teacher/dashboard">
            <span class="sidebar-nav__icon"><SidebarIcon name="users" /></span>
            <strong>학습자 목록</strong>
          </RouterLink>
        </nav>
      </div>

      <div v-else key="student" class="sidebar-panel">
        <StudentSwitcher
          :students="students"
          :current-student="currentStudent"
          @select="selectStudent"
          @manage="router.push('/teacher/dashboard')"
        />

        <nav class="sidebar-nav" aria-label="아동 메뉴">
          <RouterLink :to="{ name: 'student-overview', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="home" /></span><strong>메인</strong>
          </RouterLink>
          <RouterLink :to="{ name: 'student-curriculum', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="book" /></span><strong>커리큘럼</strong>
          </RouterLink>
          <RouterLink :to="{ name: 'student-training-history', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="chart" /></span><strong>훈련 이력</strong>
          </RouterLink>
          <RouterLink :to="{ name: 'student-test-history', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="clipboard" /></span><strong>테스트 이력</strong>
          </RouterLink>
          <RouterLink :to="{ name: 'student-report', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="report" /></span><strong>보고서</strong>
          </RouterLink>
          <RouterLink :to="{ name: 'student-edit', params: { id: currentStudent.id } }">
            <span class="sidebar-nav__icon"><SidebarIcon name="edit" /></span><strong>아동 정보 수정</strong>
          </RouterLink>
        </nav>
      </div>
    </Transition>

    <div class="sidebar-footer">
      <span class="sidebar-footer__label">로그인 계정</span>
      <div class="sidebar-account">
        <button
          class="sidebar-account__trigger"
          type="button"
          :aria-expanded="isAccountMenuOpen"
          aria-label="이OO 선생님 계정 메뉴"
          @click="isAccountMenuOpen = !isAccountMenuOpen"
        >
          <img src="/images/teacher-profile.png" alt="" />
          <span>
            <strong>이OO 선생님</strong>
            <small>OO복지센터</small>
          </span>
          <span class="sidebar-account__more" aria-hidden="true">···</span>
        </button>

        <div v-if="isAccountMenuOpen" class="sidebar-account-menu">
          <button type="button" @click="openProfileSettings">프로필 설정</button>
          <button class="sidebar-account-menu__danger" type="button" @click="logout">로그아웃</button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.teacher-sidebar {
  position: sticky;
  z-index: 40;
  top: 0;
  display: flex;
  height: 100vh;
  min-width: 224px;
  align-self: start;
  flex-direction: column;
  margin: 0;
  padding: 16px 16px 14px;
  overflow: visible;
  border-right: 1px solid var(--slate-200);
  background: var(--white);
}

.sidebar-brand {
  display: grid;
  width: 92px;
  height: 48px;
  flex: 0 0 48px;
  margin: 0 0 18px 4px;
  overflow: hidden;
  place-items: center;
}

.sidebar-brand img {
  width: 78px;
  height: 46px;
  max-width: none;
  object-fit: contain;
  transform: scale(1.85);
}

.sidebar-mode-tabs {
  display: flex;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--slate-200);
}

.sidebar-mode-tabs button {
  position: relative;
  flex: 1;
  height: 38px;
  border: 0;
  background: transparent;
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 800;
}

.sidebar-mode-tabs button.active {
  color: var(--primary-700);
}

.sidebar-mode-tabs button.active::after {
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: var(--primary-600);
  content: '';
}

.sidebar-panel {
  display: grid;
  gap: 16px;
}

.sidebar-nav {
  display: grid;
  gap: 2px;
}

.sidebar-nav a {
  display: grid;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 7px 10px 7px 9px;
  border-left: 3px solid transparent;
  border-radius: 0 6px 6px 0;
  color: var(--slate-600);
  grid-template-columns: 26px 1fr;
}

.sidebar-nav a:hover {
  background: var(--slate-50);
  color: var(--slate-950);
}

.sidebar-nav a.router-link-exact-active {
  border-left-color: var(--primary-600);
  background: transparent;
  color: var(--primary-700);
}

.sidebar-nav__icon {
  display: grid;
  width: 24px;
  height: 24px;
  background: transparent;
  color: var(--slate-500);
  place-items: center;
}

.sidebar-nav a.router-link-exact-active .sidebar-nav__icon {
  color: var(--primary-700);
}

.sidebar-nav strong {
  font-size: 12px;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--slate-200);
}

.sidebar-footer__label {
  display: block;
  margin: 0 4px 4px;
  color: var(--slate-400);
  font-size: 9px;
  font-weight: 800;
}

.sidebar-account {
  position: relative;
}

.sidebar-account__trigger {
  display: grid;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--slate-700);
  text-align: left;
  grid-template-columns: 32px minmax(0, 1fr) 18px;
}

.sidebar-account__trigger:hover,
.sidebar-account__trigger[aria-expanded='true'] {
  background: var(--slate-50);
}

.sidebar-account__trigger img {
  width: 32px;
  height: 32px;
  border: 1px solid var(--slate-200);
  border-radius: 50%;
  object-fit: cover;
}

.sidebar-account__trigger > span:not(.sidebar-account__more) {
  display: grid;
  min-width: 0;
  gap: 1px;
}

.sidebar-account__trigger strong {
  overflow: hidden;
  color: var(--slate-800);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-account__trigger small {
  overflow: hidden;
  color: var(--slate-500);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-account__more {
  color: var(--slate-400);
  font-size: 14px;
  letter-spacing: 1px;
}

.sidebar-account-menu {
  position: absolute;
  z-index: 20;
  right: 0;
  bottom: calc(100% + 8px);
  left: 0;
  display: grid;
  gap: 2px;
  padding: 6px;
  border: 1px solid var(--slate-200);
  border-radius: 8px;
  background: var(--white);
  box-shadow: 0 12px 30px rgba(15, 23, 42, .14);
}

.sidebar-account-menu button {
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--slate-700);
  font-size: 11px;
  text-align: left;
}

.sidebar-account-menu button:hover {
  background: var(--slate-50);
}

.sidebar-account-menu .sidebar-account-menu__danger {
  color: var(--danger-600);
}

.sidebar-panel-enter-active,
.sidebar-panel-leave-active {
  transition: 140ms ease;
}

.sidebar-panel-enter-from,
.sidebar-panel-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
