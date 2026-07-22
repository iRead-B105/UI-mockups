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
const isAnswered = computed(() => progressState.isCurrentCorrect === true)

const stateFor = (choice: TrainingChoice) => {
  if (isAnswered.value) return choice.id === props.question.answer ? 'correct' : 'disabled'
  if (progressState.selectedAnswer === choice.id) return progressState.isCurrentCorrect === false ? 'wrong' : 'selected'
  return 'default'
}
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading"><h1>{{ question.instruction }}</h1></header>

    <div class="activity-main">
      <div class="picture-card">
        <img v-if="question.targetImage" class="picture" :src="question.targetImage" alt="문제 그림" />
        <span v-else class="picture-symbol" role="img" :aria-label="question.targetImageLabel || '문제 그림'">{{ question.targetSymbol ?? '🖼️' }}</span>
      </div>

      <div class="choices">
        <div v-for="choice in choices" :key="choice.id" class="sentence-card" :class="`sentence-card--${stateFor(choice)}`">
          <SoundButton :text="choice.text ?? ''" size="medium" variant="ghost" :disabled="isAnswered" />
          <button class="sentence-select" type="button" :disabled="isAnswered" :aria-label="`${choice.text} 선택`" @click="session.selectAnswer(choice.id)">
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button v-if="!isAnswered" class="action action--primary" type="button" :disabled="!session.canSubmit.value" @click="session.submitAnswer()">확인</button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">다음 문제</button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 26px 20px;border:4px solid rgb(255 255 255 / 92%);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eef8ff 58%,#e5f4d1 100%);box-shadow:inset 0 0 0 2px rgb(89 145 212 / 20%),0 12px 26px rgb(45 94 145 / 14%);overflow:hidden}.activity-heading{text-align:center}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900}.activity-main{display:grid;grid-template-columns:310px minmax(0,1fr);gap:22px;flex:1;min-height:0}.picture-card{display:grid;place-items:center;border:4px solid #fff;border-radius:28px;background:#fffdf8;box-shadow:var(--learner-shadow-card)}.picture{width:90%;height:90%;object-fit:contain}.picture-symbol{font-size:86px;line-height:1.2;filter:drop-shadow(0 8px 8px rgb(64 82 110 / 16%))}.choices{display:flex;flex-direction:column;justify-content:center;gap:14px;padding:18px;border-radius:26px;background:rgb(255 255 255 / 42%)}.sentence-card{display:flex;align-items:center;gap:14px;min-height:92px;padding:10px 16px;border:4px solid #f1e4c5;border-radius:22px;background:#fffdf8;box-shadow:var(--learner-shadow-small)}.sentence-card :deep(.sound-button){flex:0 0 auto;width:58px;min-width:58px;height:52px;padding:0;color:#4f72e1;background:#edf3ff;box-shadow:none}.sentence-select{flex:1;align-self:stretch;border:0;border-radius:16px;background:transparent;color:#263853;font-family:var(--learner-font-display);font-size:23px;font-weight:900;text-align:left;cursor:pointer}.sentence-card--selected{border-color:#6288ed;box-shadow:0 0 0 5px rgb(98 136 237 / 18%),var(--learner-shadow-card)}.sentence-card--wrong{border-color:#ef8a7f;background:#fff4f1}.sentence-card--correct{border-color:#5fbd69;background:#f3fff0}.sentence-card--disabled{opacity:.55}.sentence-select:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:2px}.action-bar{display:flex;justify-content:flex-end}.action{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgb(49 80 150 / 24%)}.action--primary{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.42;cursor:default}@media(max-width:720px){.activity{overflow-y:auto}.activity-main{grid-template-columns:1fr}.picture-card{min-height:180px}.picture-symbol{font-size:64px}}@media(max-height:800px){.activity{gap:12px;padding:14px 20px}.activity-heading h1{font-size:26px}.activity-main{grid-template-columns:260px minmax(0,1fr);gap:16px}.choices{gap:10px;padding:12px}.sentence-card{min-height:82px;padding:8px 12px}.sentence-select{font-size:20px}.action{min-height:56px}}
</style>
