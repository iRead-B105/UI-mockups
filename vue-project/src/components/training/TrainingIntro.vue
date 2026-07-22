<script setup lang="ts">
// 훈련 도입(인트로) 화면
// 메인 섬 화면처럼 요소를 최소로: 레슨 제목, 짧은 설명, 한 줄 메타(시간·문제 수), 시작 버튼.
// 뒤로가기는 부모(TrainingLessonView)가 통합 관리하므로 여기서는 '시작' 이벤트만 보냅니다.
// 토끼의 응원(인사) 말풍선 역시 부모가 함께 띄워 줍니다.

import { computed } from 'vue'
import type { TrainingLesson } from '@/types/training'

const props = defineProps<{
  lesson: TrainingLesson
}>()

defineEmits<{ start: [] }>()

const questionCount = computed(() => props.lesson.questions.length)
</script>

<template>
  <div class="intro-screen">
    <div class="intro-cloud cloud-1" aria-hidden="true"></div>
    <div class="intro-cloud cloud-2" aria-hidden="true"></div>

    <div class="intro-content">
      <h1 class="intro-title">{{ lesson.title }}</h1>
      <p class="intro-desc">{{ lesson.description }}</p>
      <p class="intro-meta">약 {{ lesson.estimatedMinutes }}분 · {{ questionCount }}문제</p>

      <button class="start-button" type="button" @click="$emit('start')">
        <span>시작할까요?</span>
        <svg class="start-arrow" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M12 8l10 8-10 8" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.intro-screen {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  padding: var(--learner-page-padding);
  overflow: hidden;
}

.intro-cloud {
  position: absolute;
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 65%);
  pointer-events: none;
}
.cloud-1 { left: 6%; top: 14%; width: 150px; height: 50px; }
.cloud-2 { right: 10%; top: 22%; width: 110px; height: 40px; }

.intro-content {
  position: relative;
  z-index: 2;
  margin: auto;
  width: min(92%, 620px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--learner-space-4);
}

.intro-eyebrow {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-learning);
}

.intro-title {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-page-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.15;
}

.intro-desc {
  margin: 0;
  font-size: var(--learner-font-size-body-large);
  color: var(--learner-color-text-soft);
  line-height: 1.4;
}

.intro-meta {
  margin: var(--learner-space-2) 0 0;
  padding: var(--learner-space-2) var(--learner-space-5);
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 55%);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text-soft);
}

.start-button {
  width: min(92%, 460px);
  min-height: var(--learner-control-height-large);
  margin-top: var(--learner-space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-4);
  border: none;
  border-radius: var(--learner-radius-large);
  background: var(--learner-color-learning);
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  box-shadow: var(--learner-shadow-card);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast);
}
.start-button:hover {
  transform: translateY(-4px);
  box-shadow: var(--learner-shadow-floating);
}
.start-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}
.start-arrow { width: 28px; height: 28px; }

@media (prefers-reduced-motion: reduce) {
  .start-button:hover { transform: none; }
}
</style>
