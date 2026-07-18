<script setup lang="ts">
import { RouterLink } from 'vue-router'

const tabs = [
  { label: '메인 홈', name: 'student-overview' },
  { label: '커리큘럼', name: 'student-curriculum' },
  { label: '훈련 이력', name: 'student-training-history' },
  { label: '테스트 이력', name: 'student-test-history' },
  { label: '보고서', name: 'student-report' },
]
</script>

<template>
  <nav class="student-tabs" aria-label="학생 관리 메뉴">
    <RouterLink v-for="tab in tabs" :key="tab.name" :to="{ name: tab.name, params: { id: 1 } }">
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.student-tabs {
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
  background: var(--primary-50);
  color: var(--primary-700);
}
</style>
