<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import SoundButton from '../SoundButton.vue'
import LetterCard from '../LetterCard.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const isAnswered = computed(() => progressState.isCurrentCorrect === true)

const stateFor = (choice: TrainingChoice): 'default' | 'selected' | 'correct' | 'wrong' | 'disabled' => {
  if (isAnswered.value) return choice.id === props.question.answer ? 'correct' : 'disabled'
  if (progressState.selectedAnswer === choice.id) {
    return progressState.isCurrentCorrect === false ? 'wrong' : 'selected'
  }
  return 'default'
}

const select = (choice: TrainingChoice) => {
  if (!isAnswered.value) session.selectAnswer(choice.id)
}
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ question.instruction }}</h1>
      <p v-if="question.subInstruction">{{ question.subInstruction }}</p>
    </header>

    <div class="activity-main">
      <div class="listen-panel">
        <div class="sound-orb" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path d="M13 25h12l15-11v36L25 39H13z" fill="currentColor" />
            <path d="M46 23c4 5 4 13 0 18M52 17c8 9 8 21 0 30" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
          </svg>
        </div>
        <SoundButton :text="question.audioText ?? ''" label="소리 듣기" size="medium" variant="primary" />
      </div>

      <div class="choice-panel">
        <div class="choices">
          <template v-for="choice in choices" :key="choice.id">
            <LetterCard
              v-if="choice.letter"
              :jamo="choice.letter.jamo"
              :type="choice.letter.type"
              :state="stateFor(choice)"
              :selectable="!isAnswered"
              size="large"
              @select="select(choice)"
            />
            <button
              v-else
              class="text-choice"
              :class="`text-choice--${stateFor(choice)}`"
              type="button"
              :disabled="isAnswered"
              @click="select(choice)"
            >
              {{ choice.text }}
            </button>
          </template>
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
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 26px 20px;border:4px solid rgba(255,255,255,.92);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eef8ff 58%,#e5f4d1 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity-heading{text-align:center}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900}.activity-heading p{margin:5px 0 0;color:#526a83;font-size:18px;font-weight:700}.activity-main{display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px;flex:1;min-height:0}.listen-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:20px;border:3px solid rgba(255,255,255,.94);border-radius:26px;background:rgba(255,253,244,.92);box-shadow:0 6px 16px rgba(62,91,120,.1)}.sound-orb{display:grid;place-items:center;width:158px;height:158px;border:5px solid #fff;border-radius:50%;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;box-shadow:0 10px 22px rgba(62,98,183,.24)}.sound-orb svg{width:76px;height:76px}.listen-panel :deep(.sound-button){height:58px;min-width:174px;background:#fff;color:#3b64d8;border:2px solid #f1dfae;box-shadow:0 5px 12px rgba(61,86,122,.12)}.choice-panel{display:flex;align-items:center;justify-content:center;padding:26px;border-radius:26px;background:rgba(255,255,255,.42)}.choices{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));gap:22px;width:100%;justify-items:center}.choices :deep(.letter-card){width:min(100%,190px);height:176px;border:4px solid #f4ead2;border-radius:24px;background:#fffdf8}.choices :deep(.letter-card--selected){border-color:#6288ed;box-shadow:0 0 0 5px rgba(98,136,237,.18),var(--learner-shadow-card)}.choices :deep(.letter-card--correct){border-color:#5fbd69}.text-choice{width:min(100%,200px);height:170px;border:4px solid #f4ead2;border-radius:24px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:48px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:pointer}.text-choice--selected{border-color:#6288ed;box-shadow:0 0 0 5px rgba(98,136,237,.18),var(--learner-shadow-card)}.text-choice--wrong{border-color:#ef8a7f;background:#fff4f1}.text-choice--correct{border-color:#5fbd69;background:#f3fff0}.text-choice--disabled{opacity:.55}.action-bar{display:flex;justify-content:flex-end}.action{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(49,80,150,.24)}.action--primary{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.42;cursor:default}.action:focus-visible,.text-choice:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}@media(max-width:760px){.activity{overflow-y:auto}.activity-main{grid-template-columns:1fr}.listen-panel{flex-direction:row}.sound-orb{width:100px;height:100px}.sound-orb svg{width:52px}.choices{gap:12px}.text-choice{height:120px}}@media(max-height:800px){.activity{gap:12px;padding:14px 20px}.activity-heading h1{font-size:26px}.activity-heading p{font-size:16px}.activity-main{grid-template-columns:250px minmax(0,1fr);gap:16px}.listen-panel{gap:12px;padding:12px}.sound-orb{width:112px;height:112px}.sound-orb svg{width:54px}.listen-panel :deep(.sound-button){height:48px}.choice-panel{padding:18px}.choices{gap:14px}.choices :deep(.letter-card){height:140px}.text-choice{height:140px}.action{min-height:56px}}
</style>
