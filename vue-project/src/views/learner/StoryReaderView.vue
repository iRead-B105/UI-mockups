<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const titleById:Record<string,string> = { 'ant-and-grasshopper':'개미와 배짱이','old-man-and-sea':'노인과 바다','alice':'이상한 나라의 엘리스' }
const storyTitle = computed(() => titleById[String(route.params.storyId)] ?? '새로운 이야기')
</script>

<template><main class="reader-placeholder"><section><h1>{{ storyTitle }}</h1><p>이야기를 준비하고 있어요!</p><RouterLink :to="{ name:'story-selection' }">다른 이야기 고르기</RouterLink></section></main></template>

<style scoped>
.reader-placeholder { display:grid;place-items:center;width:100%;height:100%;padding:var(--learner-page-padding);background:var(--learner-background);color:var(--learner-color-text);font-family:var(--learner-font-reading); }.reader-placeholder section { width:min(88vw,var(--learner-reading-width));padding:var(--learner-space-16);border-radius:var(--learner-radius-card);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-floating);text-align:center; }h1 { margin:0 0 var(--learner-space-5);font-family:var(--learner-font-display);font-size:var(--learner-font-size-page-title-fluid);font-weight:var(--learner-font-weight-heavy); }p { margin:0 0 var(--learner-space-8);color:var(--learner-color-text-soft);font-size:var(--learner-font-size-body-large);font-weight:var(--learner-font-weight-bold); }a { display:inline-flex;min-height:var(--learner-control-height-large);align-items:center;padding:0 var(--learner-space-8);border-radius:var(--learner-radius-pill);background:var(--learner-color-primary);color:var(--learner-color-text-inverse);font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy);text-decoration:none;box-shadow:var(--learner-shadow-small); }a:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }
</style>
