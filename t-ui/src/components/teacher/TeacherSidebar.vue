<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { selectedStudent } from '@/features/teacher/mockData'

type SidebarMode = 'teacher' | 'student'

const route = useRoute()
const router = useRouter()
const mode = ref<SidebarMode>('teacher')
const studentRouteNames = new Set([
  'student-overview',
  'student-curriculum',
  'student-training-history',
  'student-test-history',
  'student-report',
])

watch(
  () => route.name,
  (routeName) => {
    mode.value = studentRouteNames.has(String(routeName)) ? 'student' : 'teacher'
  },
  { immediate: true },
)

function selectMode(nextMode: SidebarMode) {
  mode.value = nextMode
  router.push(nextMode === 'teacher' ? '/teacher/dashboard' : '/teacher/students/1')
}
</script>

<template>
  <aside class="teacher-sidebar">
    <RouterLink class="sidebar-logo" to="/teacher/dashboard" aria-label="iRead 학습자 목록">
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
        <section class="sidebar-profile">
          <img src="/images/teacher-profile.png" alt="이OO 교수자" />
          <div>
            <span>교수자</span>
            <h2>이OO 선생님</h2>
            <p>OO복지센터<br />읽기 교육 담당자</p>
          </div>
        </section>

        <nav class="sidebar-nav" aria-label="교수자 메뉴">
          <RouterLink to="/teacher/dashboard">
            <span class="sidebar-nav__icon">☷</span>
            <span><strong>학습자 목록</strong><small>담당 아동 관리</small></span>
          </RouterLink>
          <RouterLink to="/teacher/settings">
            <span class="sidebar-nav__icon">⚙</span>
            <span><strong>프로필 설정</strong><small>교수자 정보 관리</small></span>
          </RouterLink>
        </nav>
      </div>

      <div v-else key="student" class="sidebar-panel">
        <section class="sidebar-profile sidebar-profile--student">
          <img src="/images/student-profile.png" :alt="selectedStudent.name" />
          <div>
            <span>선택 아동</span>
            <h2>{{ selectedStudent.name }}</h2>
            <p>{{ selectedStudent.school }} · {{ selectedStudent.age }}세<br />보호자 {{ selectedStudent.guardianName }}</p>
          </div>
        </section>

        <nav class="sidebar-nav" aria-label="아동 메뉴">
          <RouterLink :to="{ name: 'student-overview', params: { id: 1 } }">
            <span class="sidebar-nav__icon">⌂</span><span><strong>메인</strong><small>학습 현황</small></span>
          </RouterLink>
          <RouterLink :to="{ name: 'student-curriculum', params: { id: 1 } }">
            <span class="sidebar-nav__icon">▤</span><span><strong>커리큘럼</strong><small>훈련 구성 관리</small></span>
          </RouterLink>
          <RouterLink :to="{ name: 'student-training-history', params: { id: 1 } }">
            <span class="sidebar-nav__icon">↗</span><span><strong>훈련 이력</strong><small>학습 활동 기록</small></span>
          </RouterLink>
          <RouterLink :to="{ name: 'student-test-history', params: { id: 1 } }">
            <span class="sidebar-nav__icon">▥</span><span><strong>테스트 이력</strong><small>검사 결과 비교</small></span>
          </RouterLink>
          <RouterLink :to="{ name: 'student-report', params: { id: 1 } }">
            <span class="sidebar-nav__icon">▧</span><span><strong>보고서</strong><small>학습 보고서 생성</small></span>
          </RouterLink>
        </nav>
      </div>
    </Transition>

    <button class="sidebar-logout" type="button" @click="router.push('/login')">로그아웃</button>
  </aside>
</template>

<style scoped>
.teacher-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  height: 100vh;
  min-width: 250px;
  align-self: start;
  flex-direction: column;
  margin: 0;
  padding: 0 20px 20px;
  overflow-y: auto;
  border-right: 1px solid var(--slate-200);
  background: var(--white);
}

.sidebar-logo {
  display: grid;
  width: 126px;
  height: 72px;
  margin: 0 auto 10px;
  overflow: hidden;
  place-items: center;
}

.sidebar-logo img {
  width: 102px;
  height: 58px;
  max-width: none;
  object-fit: contain;
  transform: scale(1.85);
}

.sidebar-mode-tabs {
  display: grid;
  gap: 5px;
  margin-bottom: 16px;
  padding: 5px;
  border-radius: 11px;
  background: var(--slate-100);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sidebar-mode-tabs button {
  height: 40px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--slate-500);
  font-weight: 800;
}

.sidebar-mode-tabs button.active {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  background: var(--white);
  color: var(--primary-700);
}

.sidebar-panel {
  display: grid;
  gap: 20px;
}

.sidebar-profile {
  display: grid;
  justify-items: center;
  gap: 11px;
  padding: 20px 14px;
  border: 1px solid var(--slate-200);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--white), var(--slate-50));
  text-align: center;
}

.sidebar-profile img {
  width: 86px;
  height: 86px;
  border: 5px solid var(--white);
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--slate-200);
  object-fit: cover;
}

.sidebar-profile span {
  color: var(--primary-600);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.sidebar-profile h2 {
  margin: 3px 0 4px;
  font-size: 18px;
}

.sidebar-profile p {
  margin: 0;
  color: var(--slate-500);
  font-size: 11px;
}

.sidebar-profile--student img {
  border-color: var(--primary-50);
}

.sidebar-nav {
  display: grid;
  gap: 7px;
}

.sidebar-nav a {
  display: grid;
  min-height: 58px;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  color: var(--slate-600);
  grid-template-columns: 36px 1fr;
}

.sidebar-nav a:hover {
  background: var(--slate-50);
  color: var(--slate-950);
}

.sidebar-nav a.router-link-exact-active {
  background: var(--primary-50);
  color: var(--primary-700);
}

.sidebar-nav__icon {
  display: grid;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(148, 163, 184, 0.12);
  font-size: 17px;
  place-items: center;
}

.sidebar-nav a > span:last-child {
  display: grid;
}

.sidebar-nav strong {
  font-size: 13px;
}

.sidebar-nav small {
  color: var(--slate-400);
  font-size: 10px;
}

.sidebar-logout {
  min-height: 40px;
  margin-top: auto;
  border: 1px solid var(--slate-200);
  border-radius: 9px;
  background: var(--white);
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
}

.sidebar-logout:hover {
  border-color: #fecaca;
  background: #fff1f2;
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
