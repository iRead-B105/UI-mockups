<script setup lang="ts">
// 2단계 힌트 버튼
// 누를 때마다 level1 → level2 순서로 친절한 힌트를 보여줍니다.
// 모든 힌트를 다 보여주면 비활성화됩니다.

import { computed } from 'vue'
import type { TrainingHint } from '@/types/training'

const props = withDefaults(
  defineProps<{
    hint?: TrainingHint
    level: number // 현재 힌트 단계(0 ~ 2)
    disabled?: boolean
  }>(),
  { disabled: false },
)

const emit = defineEmits<{ show: [] }>()

const maxLevel = 2
const isExhausted = computed(() => props.level >= maxLevel)
const isDisabled = computed(() => props.disabled || isExhausted.value || !props.hint)

const buttonLabel = computed(() => {
  if (!props.hint) return '힌트 없음'
  if (props.level === 0) return '힌트 보기'
  if (props.level === 1) return '힌트 더 보기'
  return '힌트를 다 봤어요'
})

const visibleHints = computed<{ level: number; text: string }[]>(() => {
  const list: { level: number; text: string }[] = []
  if (!props.hint) return list
  if (props.level >= 1 && props.hint.level1) list.push({ level: 1, text: props.hint.level1 })
  if (props.level >= 2 && props.hint.level2) list.push({ level: 2, text: props.hint.level2 })
  return list
})
</script>

<template>
  <div class="hint-wrap">
    <Transition name="hint">
      <div v-if="visibleHints.length > 0" class="hint-bubble" role="status">
        <p v-for="item in visibleHints" :key="item.level" class="hint-line">
          <span class="hint-badge">{{ item.level }}</span>
          <span class="hint-text">{{ item.text }}</span>
        </p>
      </div>
    </Transition>

    <button
      class="hint-button"
      :class="{ 'is-exhausted': isExhausted }"
      type="button"
      :disabled="isDisabled"
      @click="emit('show')"
    >
      <svg class="hint-icon" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 4a8 8 0 00-5 14c1 1 1.5 2 1.5 3v1h7v-1c0-1 .5-2 1.5-3A8 8 0 0016 4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" />
        <path d="M13 25h6M14 28h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
      <span>{{ buttonLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.hint-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-3);
  width: 100%;
  max-width: 620px;
}

.hint-bubble {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-2);
  padding: var(--learner-space-4) var(--learner-space-5);
  border-radius: var(--learner-radius-large);
  background: color-mix(in srgb, var(--learner-color-warning) 18%, var(--learner-color-surface));
  border: var(--learner-border-width) solid var(--learner-color-warning);
  box-shadow: var(--learner-shadow-small);
}

.hint-line {
  display: flex;
  align-items: center;
  gap: var(--learner-space-3);
  margin: 0;
  font-family: var(--learner-font-reading);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
  line-height: 1.4;
}

.hint-badge {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--learner-color-warning);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-heavy);
}

.hint-button {
  display: inline-flex;
  align-items: center;
  gap: var(--learner-space-2);
  min-height: var(--learner-touch-target);
  padding: 0 var(--learner-space-6);
  border: none;
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-warning);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  box-shadow: var(--learner-shadow-small);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast), opacity var(--learner-duration-fast);
}
.hint-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--learner-shadow-card);
}
.hint-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}
.hint-button:disabled {
  opacity: 0.55;
  cursor: default;
}
.hint-button.is-exhausted {
  background: var(--learner-color-surface);
  color: var(--learner-color-text-soft);
}

.hint-icon {
  width: 24px;
  height: 24px;
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity var(--learner-duration-normal) var(--learner-easing-standard),
    transform var(--learner-duration-normal) var(--learner-easing-bounce);
}
.hint-enter-from,
.hint-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
