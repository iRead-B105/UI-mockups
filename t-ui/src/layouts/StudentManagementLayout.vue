<script setup lang="ts">
import { RouterView } from 'vue-router'
import StudentSummaryHeader from '@/components/teacher/StudentSummaryHeader.vue'
import StudentTabs from '@/components/teacher/StudentTabs.vue'
</script>

<template>
  <div class="student-layout">
    <StudentSummaryHeader />
    <StudentTabs />
    <section class="student-layout__content">
      <RouterView />
    </section>
  </div>
</template>

<style scoped>
.student-layout {
  display: grid;
  gap: 0;
}

.student-layout__content {
  padding-top: 24px;
}
</style>
