<script setup lang="ts">
// 액티비티: 자음과 모음 합치기 (파닉스)
// 자음/모음 카드를 끌어다 놓거나(드래그 앤 드롭) 눌러서(클릭) 자리에 채우면
// 완성된 글자가 나타나고 자음→모음→완성 글자 소리가 순서대로 재생됩니다.
// 마우스/터치/키보드 모두 지원(클릭이 기본 경로). 다음 레슨 이동은 상위가 처리합니다.

import { computed, ref, watch } from 'vue'
import type { TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import LetterCard from '../LetterCard.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const { playLetterSound, playSequence } = useAudioPlayer()

const consonant = computed(() => props.question.consonant ?? '')
const vowel = computed(() => props.question.vowel ?? '')
const combined = computed(() => props.question.combined ?? '')

const consonantPlaced = ref(false)
const vowelPlaced = ref(false)
const draggedJamo = ref<string | null>(null)

const isAnswered = computed(() => progressState.isCurrentCorrect === true)
const bothPlaced = computed(() => consonantPlaced.value && vowelPlaced.value)

// 문제가 바뀌면 내부 배치 상태 초기화(컴포넌트 key 로도 remount 되지만 안전하게 이중 처리)
watch(
  () => props.question.id,
  () => {
    consonantPlaced.value = false
    vowelPlaced.value = false
    draggedJamo.value = null
  },
)

const place = async (jamo: string) => {
  if (isAnswered.value) return
  if (jamo === consonant.value && !consonantPlaced.value) {
    consonantPlaced.value = true
    await playLetterSound(consonant.value)
  } else if (jamo === vowel.value && !vowelPlaced.value) {
    vowelPlaced.value = true
    await playLetterSound(vowel.value)
  }
  if (bothPlaced.value && !isAnswered.value) {
    // 완성된 글자 공개 + 자음/모음/완성 글자 소리 순차 재생
    session.selectAnswer(combined.value)
    await playSequence([consonant.value, vowel.value, combined.value])
  }
}

const removeFromSlot = (slot: 'consonant' | 'vowel') => {
  if (isAnswered.value) return
  if (slot === 'consonant') consonantPlaced.value = false
  else vowelPlaced.value = false
  progressState.selectedAnswer = null
  progressState.isCurrentCorrect = null
}

// 드래그 앤 드롭(마우스)
const onDragStart = (jamo: string) => {
  draggedJamo.value = jamo
}
const onDrop = (slot: 'consonant' | 'vowel') => {
  const jamo = draggedJamo.value
  draggedJamo.value = null
  if (!jamo) return
  const expected = slot === 'consonant' ? consonant.value : vowel.value
  // 다른 타입 자리에 놓으면 그냥 무시(부드러운 처리)
  if (jamo === expected) void place(jamo)
}

const handleConfirm = () => session.submitAnswer()
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <div class="activity-main">
      <div class="instruction">
        <p class="instruction-main">{{ question.instruction }}</p>
        <p v-if="question.subInstruction" class="instruction-sub">{{ question.subInstruction }}</p>
      </div>

      <!-- 완성 자리: 두 슬롯 + 완성된 글자 -->
      <div class="build-area">
        <div class="slots">
          <div
            class="slot"
            :class="{ filled: consonantPlaced }"
            role="button"
            :tabindex="consonantPlaced && !isAnswered ? 0 : undefined"
            :aria-label="`자음 자리 ${consonantPlaced ? consonant + ' 채움' : '비움'}`"
            @dragover.prevent
            @drop="onDrop('consonant')"
            @keydown.enter.prevent="consonantPlaced && removeFromSlot('consonant')"
            @keydown.space.prevent="consonantPlaced && removeFromSlot('consonant')"
            @click="consonantPlaced && removeFromSlot('consonant')"
          >
            <span v-if="!consonantPlaced" class="slot-label">자음 자리</span>
            <LetterCard v-else :jamo="consonant" type="consonant" size="large" />
          </div>

          <span class="plus" aria-hidden="true">+</span>

          <div
            class="slot"
            :class="{ filled: vowelPlaced }"
            role="button"
            :tabindex="vowelPlaced && !isAnswered ? 0 : undefined"
            :aria-label="`모음 자리 ${vowelPlaced ? vowel + ' 채움' : '비움'}`"
            @dragover.prevent
            @drop="onDrop('vowel')"
            @keydown.enter.prevent="vowelPlaced && removeFromSlot('vowel')"
            @keydown.space.prevent="vowelPlaced && removeFromSlot('vowel')"
            @click="vowelPlaced && removeFromSlot('vowel')"
          >
            <span v-if="!vowelPlaced" class="slot-label">모음 자리</span>
            <LetterCard v-else :jamo="vowel" type="vowel" size="large" />
          </div>

          <span class="equals" aria-hidden="true">=</span>

          <div class="result" :class="{ revealed: bothPlaced }">
            <span v-if="bothPlaced" class="result-syllable">{{ combined }}</span>
            <span v-else class="result-placeholder">?</span>
          </div>
        </div>
      </div>

      <!-- 소스 카드 풀(아직 안 채운 카드만) -->
      <div class="source-pool" aria-label="글자 카드">
        <div
          v-if="!consonantPlaced"
          class="source-chip"
          :draggable="!isAnswered"
          role="button"
          tabindex="0"
          :aria-label="`자음 ${consonant} 자리에 놓기`"
          @click="place(consonant)"
          @keydown.enter.prevent="place(consonant)"
          @keydown.space.prevent="place(consonant)"
          @dragstart="onDragStart(consonant)"
        >
          <LetterCard :jamo="consonant" type="consonant" size="medium" />
        </div>
        <div
          v-if="!vowelPlaced"
          class="source-chip"
          :draggable="!isAnswered"
          role="button"
          tabindex="0"
          :aria-label="`모음 ${vowel} 자리에 놓기`"
          @click="place(vowel)"
          @keydown.enter.prevent="place(vowel)"
          @keydown.space.prevent="place(vowel)"
          @dragstart="onDragStart(vowel)"
        >
          <LetterCard :jamo="vowel" type="vowel" size="medium" />
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button
        v-if="!isAnswered"
        class="action action--primary"
        type="button"
        :disabled="!session.canSubmit.value"
        @click="handleConfirm"
      >
        확인
      </button>
      <button v-else class="action action--primary" type="button" @click="$emit('next')">
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-6);
  width: 100%;
  max-width: var(--learner-reading-width);
  margin: 0 auto;
}
.activity-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-6);
  width: 100%;
}

.instruction { text-align: center; }
.instruction-main {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.25;
}
.instruction-sub {
  margin: var(--learner-space-2) 0 0;
  font-size: var(--learner-font-size-body-large);
  color: var(--learner-color-text-soft);
}

.build-area { width: 100%; display: flex; justify-content: center; }
.slots {
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
  flex-wrap: wrap;
  justify-content: center;
}
.slot {
  width: 168px;
  height: 138px;
  display: grid;
  place-items: center;
  border: var(--learner-border-width-strong) dashed var(--learner-color-text-soft);
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 35%);
  cursor: default;
}
.slot.filled {
  border-style: solid;
  border-color: transparent;
  background: transparent;
  cursor: pointer;
}
.slot-label {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text-soft);
}
.plus, .equals {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-primary);
}
.result {
  width: 168px;
  height: 168px;
  display: grid;
  place-items: center;
  border-radius: var(--learner-radius-large);
  background: color-mix(in srgb, var(--learner-color-primary) 14%, var(--learner-color-surface));
  border: var(--learner-border-width) solid var(--learner-color-primary);
  box-shadow: var(--learner-shadow-card);
}
.result.revealed { animation: resultPop 0.4s var(--learner-easing-bounce); }
.result-syllable {
  font-family: var(--learner-font-display);
  font-size: 96px;
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-primary);
  line-height: 1;
}
.result-placeholder {
  font-family: var(--learner-font-display);
  font-size: 80px;
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text-soft);
  opacity: 0.6;
}
@keyframes resultPop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.source-pool {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-5);
  flex-wrap: wrap;
  min-height: 120px;
}
.source-chip {
  cursor: grab;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard);
}
.source-chip:hover { transform: translateY(-4px); }
.source-chip:active { cursor: grabbing; }
.source-chip:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); border-radius: var(--learner-radius-medium); }
.pool-hint {
  width: 100%;
  text-align: center;
  margin: 0;
  font-size: var(--learner-font-size-body);
  color: var(--learner-color-text-soft);
}

.action-bar { display: flex; justify-content: center; width: 100%; margin-top: var(--learner-space-2); }
.action {
  min-width: 220px;
  min-height: var(--learner-control-height-large);
  border: none;
  border-radius: var(--learner-radius-large);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast), opacity var(--learner-duration-fast);
}
.action--primary {
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: var(--learner-shadow-card);
}
.action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: var(--learner-shadow-floating); }
.action:disabled { opacity: 0.45; cursor: default; }
.action:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }

@media (prefers-reduced-motion: reduce) {
  .source-chip:hover, .action:hover, .result.revealed { transform: none; animation: none; }
}

.activity {
  gap: 16px;
  max-width: 1180px;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 22px 26px 20px;
  border: 4px solid rgb(255 255 255 / 92%);
  border-radius: 30px;
  background: linear-gradient(180deg, #d9efff 0%, #eef8ff 58%, #e5f4d1 100%);
  box-shadow: inset 0 0 0 2px rgb(89 145 212 / 20%), 0 12px 26px rgb(45 94 145 / 14%);
  overflow: hidden;
}
.activity-main { flex: 1; min-height: 0; justify-content: center; gap: 18px; }
.action-bar { justify-content: flex-end; margin-top: 0; }
.action { min-width: 190px; min-height: 60px; }

@media (max-height: 800px) and (min-width: 701px) {
  .activity { gap: 10px; padding: 14px 20px; }
  .activity-main { gap: 10px; }
  .instruction-main { font-size: 26px; }
  .instruction-sub { margin-top: 2px; font-size: 16px; }
  .slot { width: 130px; height: 104px; }
  .slot :deep(.letter-card) { width: 125px; height: 100px; }
  .result { width: 130px; height: 118px; }
  .result-syllable { font-size: 68px; }
  .result-placeholder { font-size: 60px; }
  .source-pool { min-height: 82px; gap: 14px; }
  .source-chip :deep(.letter-card) { width: 108px; height: 82px; }
  .action { min-height: 56px; }
}
</style>
