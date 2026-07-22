<script setup lang="ts">
// 훈련 화면 상단 헤더
// 뒤로가기, 현재 레슨 제목, 진행도를 표시합니다.
// 세션 상태에 직접 의존하지 않고 props 로 주입받아 재사용성을 높였습니다.

import TrainingProgress from './TrainingProgress.vue'

withDefaults(
  defineProps<{
    title: string
    current?: number
    total?: number
    backLabel?: string
    showProgress?: boolean
  }>(),
  {
    current: 0,
    total: 0,
    backLabel: '그만하고 나가기',
    showProgress: true,
  },
)

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <header class="training-header">
    <div class="header-row">
      <button class="back-button" type="button" :aria-label="backLabel" @click="emit('back')">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M30 36L18 24l12-12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="header-title">{{ title }}</h1>
      <div class="header-spacer" aria-hidden="true"></div>
    </div>
    <TrainingProgress v-if="showProgress && total > 0" :current="current" :total="total" />
  </header>
</template>

<style scoped>
.training-header {
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-3);
  padding: var(--learner-space-3) var(--learner-space-2) var(--learner-space-4);
  width: 100%;
  max-width: var(--learner-reading-width);
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
}

.back-button {
  width: var(--learner-control-height-small);
  height: var(--learner-control-height-small);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--learner-radius-medium);
  background: rgb(255 255 255 / 60%);
  color: var(--learner-color-text);
  cursor: pointer;
  transition: background var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.back-button:hover {
  background: rgb(255 255 255 / 85%);
  transform: translateX(-2px);
}
.back-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}
.back-button svg {
  width: 26px;
  height: 26px;
}

.header-title {
  flex: 1;
  margin: 0;
  text-align: center;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.1;
}

.header-spacer {
  width: var(--learner-control-height-small);
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .header-title {
    font-size: var(--learner-font-size-body-large);
  }
}
</style>
