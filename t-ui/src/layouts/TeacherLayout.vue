<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import TeacherHeader from '@/components/teacher/TeacherHeader.vue'
import TeacherSidebar from '@/components/teacher/TeacherSidebar.vue'

const route = useRoute()
const pageTitle = computed(() => String(route.meta.title ?? '교수자 페이지'))
</script>

<template>
  <div class="teacher-shell">
    <TeacherHeader :title="pageTitle" />
    <div class="teacher-main">
      <TeacherSidebar />
      <main class="teacher-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.teacher-shell {
  min-height: 100vh;
  background: var(--slate-50);
}

.teacher-main {
  display: grid;
  min-height: calc(100vh - var(--header-height));
  grid-template-columns: var(--sidebar-width) minmax(940px, 1fr);
}

.teacher-content {
  min-width: 0;
  padding: 28px 32px 40px;
  overflow: hidden;
}
</style>
