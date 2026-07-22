<script setup lang="ts">
// 한글 자모 카드 컴포넌트
// 기존 한글 카드 에셋(src/assets/cards/hangul)을 사용합니다.
// 해당 자모의 카드가 없으면 리소스 추가 필요 자리로 표시합니다.

import { computed } from 'vue'
import { getHangulCardUrl } from '@/data/hangulCards'
import ResourceRequired from './ResourceRequired.vue'

const props = withDefaults(
  defineProps<{
    jamo: string
    type?: 'consonant' | 'vowel'
    state?: 'default' | 'selected' | 'correct' | 'wrong' | 'hint' | 'disabled'
    selectable?: boolean
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    type: 'consonant',
    state: 'default',
    selectable: false,
    size: 'medium',
  },
)

const emit = defineEmits<{ select: [jamo: string] }>()

const cardUrl = computed(() => getHangulCardUrl(props.jamo))
const hasAsset = computed(() => cardUrl.value !== null)

const handleClick = () => {
  if (!props.selectable || props.state === 'disabled' || props.state === 'correct') return
  emit('select', props.jamo)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.selectable) return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <div
    class="letter-card"
    :class="[`letter-card--${size}`, `letter-card--${state}`, { 'is-selectable': selectable }]"
    :role="selectable ? 'button' : 'img'"
    :tabindex="selectable && state !== 'disabled' ? 0 : undefined"
    :aria-label="`${type === 'consonant' ? '자음' : '모음'} ${jamo}`"
    :aria-pressed="selectable && state === 'selected' ? true : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <ResourceRequired v-if="!hasAsset" :label="`${jamo} ${type === 'consonant' ? '자음' : '모음'} 카드 PNG`" size="small" />
    <img v-else class="letter-image" :src="cardUrl ?? ''" :alt="`${type === 'consonant' ? '자음' : '모음'} ${jamo}`" draggable="false" />
  </div>
</template>

<style scoped>
.letter-card {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-surface);
  box-shadow: var(--learner-shadow-card);
  border: var(--learner-border-width) solid transparent;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast), border-color var(--learner-duration-fast);
  user-select: none;
}

.letter-card--small {
  width: 96px;
  height: 80px;
  padding: var(--learner-space-1);
}
.letter-card--medium {
  width: 132px;
  height: 110px;
  padding: var(--learner-space-2);
}
.letter-card--large {
  width: 168px;
  height: 138px;
  padding: var(--learner-space-3);
}

.letter-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.letter-card.is-selectable {
  cursor: pointer;
}
.letter-card.is-selectable:hover:not(.letter-card--disabled):not(.letter-card--correct) {
  transform: translateY(-4px);
  box-shadow: var(--learner-shadow-floating);
}

.letter-card--selected {
  border-color: var(--learner-color-primary);
  background: color-mix(in srgb, var(--learner-color-primary) 12%, var(--learner-color-surface));
  transform: translateY(-4px);
}
.letter-card--correct {
  border-color: var(--learner-color-success);
  background: color-mix(in srgb, var(--learner-color-success) 16%, var(--learner-color-surface));
}
.letter-card--wrong {
  border-color: var(--learner-color-error);
  animation: letterShake 0.4s ease-out;
}
.letter-card--hint {
  border-color: var(--learner-color-warning);
  box-shadow: var(--learner-shadow-card), 0 0 0 4px rgb(244 189 69 / 35%);
}
.letter-card--disabled {
  opacity: 0.55;
  cursor: default;
}

.letter-card:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus);
}

@keyframes letterShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .letter-card.is-selectable:hover {
    transform: none;
  }
}
</style>
