<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import SoundButton from '../SoundButton.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const sentenceParts = computed(() => (props.question.targetText ?? '').split('___'))
const selectedChoice = computed(() => choices.value.find((choice) => choice.id === progressState.selectedAnswer) ?? null)
const isAnswered = computed(() => progressState.isCurrentCorrect === true)

const stateFor = (choice: TrainingChoice) => {
  if (isAnswered.value) return choice.id === props.question.answer ? 'correct' : 'disabled'
  if (progressState.selectedAnswer === choice.id) return progressState.isCurrentCorrect === false ? 'wrong' : 'selected'
  return 'default'
}
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ question.instruction }}</h1>
    </header>

    <div class="sentence-card" aria-live="polite">
      <span>{{ sentenceParts[0] }}</span>
      <span class="blank" :class="{ filled: selectedChoice, correct: isAnswered }">
        {{ selectedChoice?.text ?? '?' }}
      </span>
      <span>{{ sentenceParts[1] }}</span>
    </div>

    <div class="choices">
      <div v-for="choice in choices" :key="choice.id" class="word-card" :class="`word-card--${stateFor(choice)}`">
        <SoundButton :text="choice.text ?? ''" size="medium" variant="ghost" :disabled="isAnswered" />
        <button class="word-select" type="button" :disabled="isAnswered" :aria-label="`${choice.text} 선택`" @click="session.selectAnswer(choice.id)">
          {{ choice.text }}
        </button>
      </div>
    </div>

    <div class="action-bar">
      <button v-if="!isAnswered" class="action action--primary" type="button" :disabled="!session.canSubmit.value" @click="session.submitAnswer()">확인</button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">다음 문제</button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 30px 20px;border:4px solid rgba(255,255,255,.92);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eef8ff 58%,#e5f4d1 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14)}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900}.sentence-card{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:14px;width:min(100%,900px);min-height:150px;padding:24px 32px;border:4px solid #fff;border-radius:28px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:clamp(30px,3.3vw,48px);font-weight:900;box-shadow:var(--learner-shadow-card)}.blank{display:grid;place-items:center;min-width:150px;min-height:76px;padding:0 20px;border:4px dashed #7896e6;border-radius:20px;color:#8a9ab2;background:#eef4ff}.blank.filled{border-style:solid;color:#3158c6;background:#fff6cd}.blank.correct{border-color:#5fbd69;color:#297a35;background:#efffea}.choices{display:grid;grid-template-columns:repeat(3,minmax(170px,220px));gap:22px;justify-content:center;width:100%}.word-card{display:flex;flex-direction:column;align-items:center;gap:8px;height:170px;padding:14px;border:4px solid #f1e4c5;border-radius:25px;background:#fffdf8;box-shadow:var(--learner-shadow-card)}.word-card :deep(.sound-button){width:62px;min-width:62px;height:52px;padding:0;color:#4f72e1;background:#edf3ff;box-shadow:none}.word-select{flex:1;width:100%;border:0;border-radius:16px;background:transparent;color:#263853;font-family:var(--learner-font-display);font-size:32px;font-weight:900;cursor:pointer}.word-card--selected{border-color:#6288ed;box-shadow:0 0 0 5px rgba(98,136,237,.18),var(--learner-shadow-card)}.word-card--wrong{border-color:#ef8a7f;background:#fff4f1}.word-card--correct{border-color:#5fbd69;background:#f3fff0}.word-card--disabled{opacity:.55}.word-select:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:2px}.action-bar{display:flex;justify-content:flex-end;width:100%}.action{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(49,80,150,.24)}.action--primary{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.42;cursor:default}@media(max-width:700px){.activity{overflow-y:auto}.choices{grid-template-columns:repeat(3,1fr);gap:10px}.sentence-card{font-size:28px}.word-card{height:135px;padding:8px}.word-select{font-size:24px}}@media(max-height:800px){.activity{gap:18px;padding:14px 24px}.activity-heading h1{font-size:26px}.sentence-card{min-height:112px;padding:16px 24px;font-size:34px}.blank{min-height:62px}.word-card{height:140px}.action{min-height:56px}}
</style>
