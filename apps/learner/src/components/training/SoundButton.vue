<script setup lang="ts">
// 소리 듣기 버튼
// useAudioPlayer(목업 TTS)로 텍스트를 재생합니다.
// 중복 재생 방지: 같은 문장이 이미 재생 중이면 다시 시작하지 않습니다.

import { computed } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const props = withDefaults(
  defineProps<{
    text: string // 재생할 문장/단어
    label?: string // 버튼 아래 안내 문구
    rate?: number
    size?: 'medium' | 'large'
    variant?: 'primary' | 'ghost'
    disabled?: boolean
  }>(),
  {
    label: '',
    rate: 0.9,
    size: 'large',
    variant: 'primary',
    disabled: false,
  },
)

const emit = defineEmits<{ played: [] }>()

const { isPlaying, currentText, replay } = useAudioPlayer()

const isThisPlaying = computed(
  () => isPlaying.value && currentText.value === props.text,
)

const handlePlay = async () => {
  if (props.disabled || isThisPlaying.value) return
  await replay(props.text, props.rate)
  emit('played')
}
</script>

<template>
  <button
    class="sound-button"
    :class="[`sound-button--${size}`, `sound-button--${variant}`, { playing: isThisPlaying }]"
    type="button"
    :disabled="disabled || isThisPlaying"
    :aria-label="label ? `소리 듣기: ${label}` : '소리 듣기'"
    @click="handlePlay"
  >
    <span class="sound-pulse" aria-hidden="true"></span>
    <svg class="sound-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M11 12v8M7 12v8M15 9l6-2v18l-6-2M23 11a6 6 0 010 10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span v-if="label" class="sound-label">{{ isThisPlaying ? '듣고 있어요…' : label }}</span>
  </button>
</template>

<style scoped>
.sound-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-3);
  border: none;
  border-radius: var(--learner-radius-pill);
  cursor: pointer;
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-weight: var(--learner-font-weight-heavy);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast);
}

.sound-button--primary {
  background: var(--learner-color-primary);
  box-shadow: var(--learner-shadow-card);
}
.sound-button--ghost {
  background: rgb(255 255 255 / 60%);
  color: var(--learner-color-text);
  box-shadow: var(--learner-shadow-small);
}

.sound-button--medium {
  min-width: 64px;
  height: 64px;
  padding: 0 var(--learner-space-4);
  font-size: var(--learner-font-size-body);
}
.sound-button--medium .sound-icon {
  width: 28px;
  height: 28px;
}
.sound-button--large {
  min-width: 132px;
  height: 96px;
  padding: 0 var(--learner-space-6);
  font-size: var(--learner-font-size-body-large);
}
.sound-button--large .sound-icon {
  width: 40px;
  height: 40px;
}

.sound-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--learner-shadow-floating);
}
.sound-button:active:not(:disabled) {
  transform: translateY(-1px);
}
.sound-button:disabled {
  cursor: default;
  opacity: 0.85;
}
.sound-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}

.sound-button.playing .sound-pulse {
  opacity: 1;
}
.sound-pulse {
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  border: 3px solid rgb(255 255 255 / 70%);
  opacity: 0;
  animation: soundPulse 1.2s ease-out infinite;
  pointer-events: none;
}
@keyframes soundPulse {
  0% { transform: scale(0.96); opacity: 0.7; }
  100% { transform: scale(1.12); opacity: 0; }
}

.sound-label {
  line-height: 1.1;
}

@media (prefers-reduced-motion: reduce) {
  .sound-pulse { animation: none; opacity: 0; }
  .sound-button:hover { transform: none; }
}
</style>
