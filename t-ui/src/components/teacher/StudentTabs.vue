<script setup lang="ts">
// RouterLink는 페이지 전체를 새로고침하지 않고 Vue 내부에서 빠르게 화면을 전환합니다.
import { RouterLink } from 'vue-router'

// 메뉴 이름과 라우터의 고유 name을 한 배열로 관리해 template 중복을 줄입니다.
const tabs = [
  { label: '학습 현황', name: 'student-overview' },
  { label: '커리큘럼', name: 'student-curriculum' },
  { label: '훈련 이력', name: 'student-training-history' },
  { label: '테스트 이력', name: 'student-test-history' },
  { label: '보고서', name: 'student-report' },
]
</script>

<template>
  <!-- v-for는 tabs 항목 수만큼 링크를 반복 생성하고, key는 각 항목을 구별합니다. -->
  <nav class="student-tabs" aria-label="아동 관리 메뉴">
    <!-- 문자열 URL 대신 라우트 name과 아동 id를 주면 라우터가 최종 주소를 조립합니다. -->
    <RouterLink v-for="tab in tabs" :key="tab.name" :to="{ name: tab.name, params: { id: 1 } }">
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.student-tabs {
  /* 탭들을 가로로 나열하고 공통 흰 배경과 테두리로 하나의 메뉴처럼 묶습니다. */
  display: flex;
  gap: 4px;
  margin-top: 12px;
  padding: 6px;
  border: 1px solid var(--slate-200);
  border-radius: 10px;
  background: var(--white);
}

.student-tabs a {
  min-width: 112px;
  padding: 10px 14px;
  border-radius: 7px;
  color: var(--slate-500);
  font-weight: 700;
  text-align: center;
}

.student-tabs a:hover {
  background: var(--slate-50);
  color: var(--slate-950);
}

.student-tabs a.router-link-exact-active {
  /* Vue Router가 현재 주소와 정확히 일치하는 링크에 자동으로 붙이는 클래스입니다. */
  background: var(--primary-50);
  color: var(--primary-700);
}
</style>
