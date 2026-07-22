<script setup lang="ts">
// 훈련 완료 화면
// 목업 완료 타임스탬프와 축하 메시지를 보여줍니다.
// 점수/진단 결과/통계는 표시하지 않습니다.

import { computed } from 'vue'
import sproutImage from '@/assets/map/sprout-no-bg.png'

const props = withDefaults(
  defineProps<{
    lessonTitle: string
    completedAt: string | null // 목업 타임스탬프(ISO)
    completionMessage?: string
  }>(),
  { completionMessage: '훈련을 무사히 마쳤어요!' },
)

defineEmits<{ retry: []; home: [] }>()

// 목업 타임스탬프를 보기 좋게 포맷(실제 평가 기록이 아님)
const formattedTime = computed(() => {
  if (!props.completedAt) return ''
  const date = new Date(props.completedAt)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hour}시 ${minute}분에 완료했어요.`
})
</script>

<template>
  <main class="complete-screen">
    <div class="cloud cloud-a" aria-hidden="true"></div>
    <div class="cloud cloud-b" aria-hidden="true"></div>

    <section class="complete-card">
      <div class="complete-emblem">
        <img :src="sproutImage" alt="" aria-hidden="true" />
      </div>

      <p class="complete-eyebrow">훈련 완료</p>
      <h1 class="complete-title">{{ lessonTitle }}</h1>
      <p class="complete-message">{{ completionMessage }}</p>

      <p class="complete-meta" role="status">{{ formattedTime }}</p>

      <div class="complete-actions">
        <button class="action action--secondary" type="button" @click="$emit('retry')">
          다시 할래요
        </button>
        <button class="action action--primary" type="button" @click="$emit('home')">
          훈련 선택으로 가기
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.complete-screen {
  position: relative;
  height: 100%;
  display: grid;
  place-items: center;
  padding: var(--learner-page-padding);
  overflow: hidden;
}

.cloud {
  position: absolute;
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 70%);
  pointer-events: none;
}
.cloud-a { left: 8%; top: 14%; width: 160px; height: 54px; }
.cloud-b { right: 10%; bottom: 18%; width: 200px; height: 66px; }

.complete-card {
  position: relative;
  z-index: 2;
  width: min(92%, 640px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-3);
  padding: var(--learner-space-12) var(--learner-space-10);
  text-align: center;
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background: color-mix(in srgb, var(--learner-color-learning) 12%, var(--learner-color-surface));
  box-shadow: var(--learner-shadow-floating);
}

.complete-emblem {
  width: 168px;
  height: 168px;
  display: grid;
  place-items: center;
  margin-bottom: var(--learner-space-2);
  border-radius: 50%;
  background: color-mix(in srgb, var(--learner-color-learning) 22%, var(--learner-color-surface));
  box-shadow: var(--learner-shadow-card);
  animation: emblemPop 0.5s var(--learner-easing-bounce);
}
.complete-emblem img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
@keyframes emblemPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.complete-eyebrow {
  margin: 0;
  padding: var(--learner-space-1) var(--learner-space-4);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-learning);
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-heavy);
}

.complete-title {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-page-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.15;
}

.complete-message {
  margin: 0;
  max-width: 460px;
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text-soft);
  line-height: 1.5;
}

.complete-meta {
  margin: var(--learner-space-2) 0 var(--learner-space-4);
  font-size: var(--learner-font-size-body);
  color: var(--learner-color-text-soft);
}

.complete-actions {
  display: flex;
  gap: var(--learner-space-4);
  width: 100%;
  max-width: 480px;
  margin-top: var(--learner-space-2);
}

.action {
  flex: 1;
  min-height: var(--learner-control-height-large);
  border: none;
  border-radius: var(--learner-radius-large);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast);
}
.action--secondary {
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  box-shadow: var(--learner-shadow-small);
}
.action--primary {
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: var(--learner-shadow-card);
}
.action:hover {
  transform: translateY(-3px);
  box-shadow: var(--learner-shadow-floating);
}
.action:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}

@media (max-width: 560px) {
  .complete-actions { flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .complete-emblem { animation: none; }
  .action:hover { transform: none; }
}
</style>
