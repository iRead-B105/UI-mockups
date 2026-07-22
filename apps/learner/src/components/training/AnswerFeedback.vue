<script setup lang="ts">
// 정답/다시시도 피드백 인라인 배너
// "틀렸어요/실패/오답" 같은 부정형 표현 대신 친절한 문구만 사용합니다.
// 모달이 아닌 인라인 배너로, 문제 풀이 흐름을 끊지 않습니다.

withDefaults(
  defineProps<{
    show: boolean
    type?: 'correct' | 'retry'
    message?: string
  }>(),
  { type: 'correct', message: '' },
)
</script>

<template>
  <Transition name="feedback">
    <div v-if="show" class="feedback-banner" :class="`feedback-banner--${type}`" role="status" aria-live="polite">
      <span class="feedback-icon" aria-hidden="true">
        <svg v-if="type === 'correct'" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="currentColor" />
          <path d="M15 24l6 6 12-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="currentColor" />
          <path d="M24 15v11M24 32v.5" stroke="#fff" stroke-width="4" stroke-linecap="round" />
        </svg>
      </span>
      <span class="feedback-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.feedback-banner {
  display: inline-flex;
  align-items: center;
  gap: var(--learner-space-3);
  width: 100%;
  max-width: 640px;
  padding: var(--learner-space-3) var(--learner-space-5);
  border-radius: var(--learner-radius-large);
  box-shadow: var(--learner-shadow-card);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  line-height: 1.3;
}

.feedback-banner--correct {
  background: color-mix(in srgb, var(--learner-color-success) 20%, var(--learner-color-surface));
  border: var(--learner-border-width) solid var(--learner-color-success);
  color: var(--learner-color-text);
}
.feedback-banner--correct .feedback-icon {
  color: var(--learner-color-success);
}

.feedback-banner--retry {
  background: color-mix(in srgb, var(--learner-color-warning) 22%, var(--learner-color-surface));
  border: var(--learner-border-width) solid var(--learner-color-warning);
  color: var(--learner-color-text);
}
.feedback-banner--retry .feedback-icon {
  color: var(--learner-color-warning);
}

.feedback-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
}
.feedback-icon svg {
  width: 100%;
  height: 100%;
}

.feedback-text {
  flex: 1;
}

.feedback-enter-active,
.feedback-leave-active {
  transition: opacity var(--learner-duration-normal) var(--learner-easing-standard),
    transform var(--learner-duration-normal) var(--learner-easing-bounce);
}
.feedback-enter-from,
.feedback-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
