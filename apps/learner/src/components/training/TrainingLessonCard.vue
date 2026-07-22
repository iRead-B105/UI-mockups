<script setup lang="ts">
// 서브메뉴 레슨 카드
// 준비된 레슨은 선택(select) 이벤트를, 준비 중 레슨은 not-ready 이벤트를 발생시킵니다.
// 준비 중인 레슨은 클릭 가능하지만 "이 훈련은 준비하고 있어요." 안내만 보여줍니다.

import { computed } from 'vue'
import type { TrainingLessonSummary } from '@/types/training'

const props = defineProps<{
  lesson: TrainingLessonSummary
}>()

const emit = defineEmits<{
  select: [lessonId: string]
  'not-ready': [lessonId: string]
}>()

const isReady = computed(() => props.lesson.isReady)

const handleClick = () => {
  if (isReady.value) {
    emit('select', props.lesson.id)
  } else {
    emit('not-ready', props.lesson.id)
  }
}
</script>

<template>
  <button
    class="lesson-card"
    :class="{ 'is-not-ready': !isReady }"
    type="button"
    :aria-label="isReady ? `${lesson.title} 시작하기` : `${lesson.title}, 이 훈련은 준비하고 있어요.`"
    @click="handleClick"
  >
    <span class="lesson-icon" aria-hidden="true">
      <svg v-if="isReady" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3" />
        <path d="M18 24l6 6 10-14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="4 3" />
      </svg>
    </span>
    <span class="lesson-content">
      <span class="lesson-title">{{ lesson.title }}</span>
      <span class="lesson-description">{{ lesson.description }}</span>
      <span v-if="!isReady" class="lesson-status">이 훈련은 준비하고 있어요.</span>
      <span v-else class="lesson-duration">약 {{ lesson.estimatedMinutes }}분</span>
    </span>
    <span v-if="isReady" class="lesson-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M9 6l8 6-8 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.lesson-card {
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
  width: 100%;
  padding: var(--learner-space-5);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background: var(--learner-color-surface);
  cursor: pointer;
  text-align: left;
  font-family: var(--learner-font-reading);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast), background var(--learner-duration-fast);
}

.lesson-card:not(.is-not-ready):hover {
  transform: translateY(-4px);
  box-shadow: var(--learner-shadow-floating);
  background: color-mix(in srgb, var(--learner-color-primary) 8%, var(--learner-color-surface));
}
.lesson-card.is-not-ready:hover {
  transform: translateY(-2px);
  box-shadow: var(--learner-shadow-card);
}
.lesson-card:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}

.lesson-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  color: var(--learner-color-learning);
}
.lesson-card.is-not-ready .lesson-icon {
  color: var(--learner-color-text-soft);
}
.lesson-icon svg { width: 100%; height: 100%; }

.lesson-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-1);
}
.lesson-title {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
}
.lesson-description {
  font-size: var(--learner-font-size-body);
  color: var(--learner-color-text-soft);
  line-height: 1.4;
}
.lesson-status {
  margin-top: var(--learner-space-1);
  align-self: flex-start;
  padding: var(--learner-space-1) var(--learner-space-3);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-warning);
  color: var(--learner-color-text);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-bold);
}
.lesson-duration {
  align-self: flex-start;
  font-size: var(--learner-font-size-caption);
  color: var(--learner-color-text-soft);
  font-weight: var(--learner-font-weight-bold);
}

.lesson-arrow {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--learner-color-primary);
}
.lesson-arrow svg { width: 100%; height: 100%; }

@media (prefers-reduced-motion: reduce) {
  .lesson-card:hover { transform: none; }
}
</style>
