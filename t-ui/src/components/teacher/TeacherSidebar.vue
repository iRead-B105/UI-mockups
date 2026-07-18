<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const currentSection = computed(() => String(route.meta.section ?? ''))
</script>

<template>
  <aside class="teacher-sidebar">
    <section class="profile-card">
      <img src="/images/teacher-profile.png" alt="교수자 이OO" />
      <div>
        <strong>이OO</strong>
        <p>OO복지센터<br />읽기 교육 담당자</p>
      </div>
      <div class="profile-card__actions">
        <RouterLink class="profile-chip" to="/teacher/settings">프로필</RouterLink>
        <button class="profile-chip" type="button">로그아웃</button>
      </div>
    </section>

    <nav class="side-nav" aria-label="교수자 메뉴">
      <RouterLink
        to="/teacher/dashboard"
        :class="{ 'side-nav__item--active': currentSection === 'dashboard' }"
        class="side-nav__item"
      >
        <span class="side-nav__icon">⌂</span>
        대시보드
      </RouterLink>
      <RouterLink
        to="/teacher/students/1"
        :class="{ 'side-nav__item--active': currentSection === 'students' }"
        class="side-nav__item"
      >
        <span class="side-nav__icon">♙</span>
        학생 관리
      </RouterLink>
      <RouterLink
        to="/teacher/settings"
        :class="{ 'side-nav__item--active': currentSection === 'settings' }"
        class="side-nav__item"
      >
        <span class="side-nav__icon">⚙</span>
        설정
      </RouterLink>
    </nav>

    <div class="side-help">
      <strong>도움이 필요하신가요?</strong>
      <p>교수자 가이드에서 화면별 사용법을 확인하세요.</p>
      <button type="button">가이드 보기</button>
    </div>
  </aside>
</template>

<style scoped>
.teacher-sidebar {
  position: sticky;
  top: var(--header-height);
  display: flex;
  height: calc(100vh - var(--header-height));
  flex-direction: column;
  gap: 22px;
  padding: 24px 18px;
  border-right: 1px solid var(--slate-200);
  background: var(--white);
}

.profile-card {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 18px 12px;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, #fff 0%, var(--slate-50) 100%);
  text-align: center;
}

.profile-card img {
  width: 92px;
  height: 92px;
  border: 4px solid var(--white);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--slate-200);
}

.profile-card strong {
  display: block;
  font-size: 20px;
}

.profile-card p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.profile-card__actions {
  display: flex;
  gap: 8px;
}

.profile-chip {
  min-height: 30px;
  padding: 5px 12px;
  border: 1px solid var(--slate-300);
  border-radius: 999px;
  background: var(--white);
  color: var(--slate-600);
  font-size: 12px;
}

.side-nav {
  display: grid;
  gap: 8px;
}

.side-nav__item {
  position: relative;
  display: flex;
  height: 52px;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-radius: 10px;
  color: var(--slate-600);
  font-weight: 700;
  transition: 160ms ease;
}

.side-nav__item:hover {
  background: var(--slate-50);
  color: var(--slate-950);
}

.side-nav__item--active {
  background: var(--primary-50);
  color: var(--primary-700);
}

.side-nav__item--active::before {
  position: absolute;
  top: 12px;
  bottom: 12px;
  left: 0;
  width: 4px;
  border-radius: 999px;
  background: var(--primary-600);
  content: '';
}

.side-nav__icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.12);
  font-size: 18px;
}

.side-help {
  margin-top: auto;
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--slate-50);
}

.side-help strong {
  font-size: 13px;
}

.side-help p {
  margin: 6px 0 12px;
  color: var(--slate-500);
  font-size: 12px;
}

.side-help button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--primary-600);
  font-size: 12px;
  font-weight: 700;
}
</style>
