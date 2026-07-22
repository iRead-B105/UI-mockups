<script setup lang="ts">
defineProps<{ count: number; current: number }>()
const emit = defineEmits<{ select: [page: number] }>()
</script>

<template>
  <nav class="pagination-dots" aria-label="이야기 페이지 선택">
    <button v-for="page in count" :key="page" class="pagination-dot" :class="{ 'pagination-dot--active': current === page - 1 }" type="button" :aria-label="`${page}번째 이야기 페이지 보기`" :aria-current="current === page - 1 ? 'page' : undefined" @click="emit('select', page - 1)" />
  </nav>
</template>

<style scoped>
.pagination-dots { display:flex;align-items:center;justify-content:center;gap:var(--learner-space-4);min-height:var(--learner-control-height-small);padding:0 var(--learner-space-6);border-radius:var(--learner-radius-pill);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-small); }
.pagination-dot { width:var(--learner-space-4);height:var(--learner-space-4);padding:0;border:0;border-radius:50%;background:var(--learner-border-color-soft);cursor:pointer;transition:transform var(--learner-duration-fast) var(--learner-easing-standard),background var(--learner-duration-fast); }
.pagination-dot:hover { transform:scale(1.16); }
.pagination-dot--active { background:var(--learner-color-primary); }
.pagination-dot:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }
</style>
