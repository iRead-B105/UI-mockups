<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { SoundManipulationUnit, TrainingChoice, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const audio = useAudioPlayer()
const selectedUnitIds = ref<string[]>([])
const selectedReplacementId = ref<string | null>(null)

const units = computed<SoundManipulationUnit[]>(() => props.question.manipulationUnits ?? [])
const replacements = computed<TrainingChoice[]>(() => props.question.replacementChoices ?? [])
const isReplace = computed(() => props.question.manipulationMode === 'replace')
const isCorrect = computed(() => session.progressState.isCurrentCorrect === true)
const targetIds = computed(() => props.question.manipulationTargetUnitIds ?? [])
const canSubmit = computed(() =>
  isReplace.value
    ? selectedUnitIds.value.length === 1 && Boolean(selectedReplacementId.value)
    : selectedUnitIds.value.length > 0,
)

const playQuestion = () => {
  if (props.question.audioText) void audio.replay(props.question.audioText, 0.82)
}

const resetJudgement = () => session.selectAnswer('조작 중')

const toggleUnit = (unitId: string) => {
  if (isCorrect.value) return
  if (isReplace.value) {
    selectedUnitIds.value = selectedUnitIds.value[0] === unitId ? [] : [unitId]
  } else if (selectedUnitIds.value.includes(unitId)) {
    selectedUnitIds.value = selectedUnitIds.value.filter((id) => id !== unitId)
  } else {
    selectedUnitIds.value = [...selectedUnitIds.value, unitId]
  }
  resetJudgement()
}

const selectReplacement = (choiceId: string) => {
  if (isCorrect.value) return
  selectedReplacementId.value = choiceId
  resetJudgement()
}

const sameSet = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id) => right.includes(id))

const submit = () => {
  if (!canSubmit.value || isCorrect.value) return

  let correct = false
  let submitted = ''
  if (isReplace.value) {
    submitted = `${selectedUnitIds.value[0]}:${selectedReplacementId.value}`
    correct = sameSet(selectedUnitIds.value, targetIds.value)
      && selectedReplacementId.value === props.question.replacementAnswerId
  } else {
    const answerSets = props.question.manipulationAnswerSets?.length
      ? props.question.manipulationAnswerSets
      : [targetIds.value]
    correct = answerSets.some((answerSet) => sameSet(selectedUnitIds.value, answerSet))
    submitted = [...selectedUnitIds.value].sort().join('|')
  }

  session.selectAnswer(correct ? props.question.answer : submitted)
  const completed = session.submitAnswer()
  if (completed) {
    void audio.speak(props.question.targetResult ?? '', 0.8)
  } else if (session.progressState.attemptCount >= 3 && session.progressState.hintLevel < 2) {
    session.showHint()
    selectedUnitIds.value = []
    selectedReplacementId.value = null
  }
}

const isTargetUnit = (unitId: string) => targetIds.value.includes(unitId)
const showPulse = (unitId: string) => session.progressState.hintLevel >= 1 && isTargetUnit(unitId)
const showDirectHint = (unitId: string) => session.progressState.hintLevel >= 2 && isTargetUnit(unitId)

watch(
  () => props.question.id,
  () => {
    selectedUnitIds.value = []
    selectedReplacementId.value = null
    void nextTick(playQuestion)
  },
  { immediate: true },
)
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <h1>{{ question.instruction }}</h1>

    <div class="task-row">
      <button class="listen-button" type="button" :disabled="audio.isPlaying.value" aria-label="문제 다시 듣기" @click="playQuestion">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M13 25h12l15-11v36L25 39H13z" fill="currentColor" />
          <path d="M46 23c4 5 4 13 0 18M52 17c8 9 8 21 0 30" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
        </svg>
        <strong>{{ audio.isPlaying.value ? '듣고 있어요' : '다시 듣기' }}</strong>
      </button>

      <div class="manipulation-panel">
        <div class="word-flow">
          <div class="source-group" :aria-label="`${question.targetText} 소리 조각`">
            <button
              v-for="soundUnit in units"
              :key="soundUnit.id"
              class="sound-unit"
              :class="{
                'sound-unit--selected': selectedUnitIds.includes(soundUnit.id),
                'sound-unit--pulse': showPulse(soundUnit.id),
                'sound-unit--direct': showDirectHint(soundUnit.id),
              }"
              type="button"
              :aria-pressed="selectedUnitIds.includes(soundUnit.id)"
              :aria-label="`${soundUnit.text} 소리${selectedUnitIds.includes(soundUnit.id) ? ' 빼기 선택됨' : ''}`"
              @click="toggleUnit(soundUnit.id)"
            >
              {{ soundUnit.text }}
              <span v-if="showDirectHint(soundUnit.id)" class="scissors" aria-hidden="true">✂</span>
            </button>
          </div>

          <span class="arrow" aria-hidden="true">→</span>
          <div class="target-card" :class="{ 'target-card--complete': isCorrect }">
            {{ question.targetResult }}
          </div>
        </div>

        <div v-if="isReplace" class="replacement-area" aria-label="바꿀 소리 카드">
          <button
            v-for="replacement in replacements"
            :key="replacement.id"
            class="replacement-card"
            :class="{
              'replacement-card--selected': selectedReplacementId === replacement.id,
              'replacement-card--hint': session.progressState.hintLevel >= 2 && replacement.id === question.replacementAnswerId,
            }"
            type="button"
            :aria-pressed="selectedReplacementId === replacement.id"
            @click="selectReplacement(replacement.id)"
          >
            {{ replacement.text }}
          </button>
        </div>
      </div>
    </div>

    <div class="action-row">
      <p v-if="session.progressState.isCurrentCorrect === false" role="status">소리를 다시 눌러봐요.</p>
      <span v-else></span>
      <button v-if="!isCorrect" class="action action--check" type="button" :disabled="!canSubmit" @click="submit">
        완성하기
      </button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 26px 20px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#edf7ff 58%,#e6f3ce 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity h1{margin:0;text-align:center;color:#233d79;font-family:var(--learner-font-display);font-size:clamp(29px,2.4vw,38px);font-weight:900}.task-row{display:grid;grid-template-columns:220px minmax(0,1fr);gap:20px;flex:1;min-height:0}.listen-button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border:3px solid #fff;border-radius:26px;background:rgba(255,253,244,.93);color:#4f72e1;box-shadow:0 7px 18px rgba(55,87,130,.13);cursor:pointer}.listen-button svg{width:94px;height:94px;padding:18px;border-radius:50%;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;box-shadow:0 10px 22px rgba(62,98,183,.24)}.listen-button strong{font-family:var(--learner-font-display);font-size:23px;font-weight:900}.listen-button:disabled{opacity:.86;cursor:default}.listen-button:focus-visible,.sound-unit:focus-visible,.replacement-card:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.manipulation-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;padding:26px;border-radius:26px;background:rgba(255,255,255,.48)}.word-flow{display:flex;align-items:center;justify-content:center;gap:30px;width:100%}.source-group{display:flex;align-items:center;justify-content:center;gap:14px;min-width:390px}.sound-unit{position:relative;display:grid;place-items:center;min-width:112px;height:128px;padding:0 20px;border:4px solid #f1e4c5;border-radius:26px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:48px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:pointer;transition:opacity .16s,transform .16s,border-color .16s}.sound-unit:hover{transform:translateY(-4px)}.sound-unit--selected{border-color:#a7b0bd;background:#e8ebee;color:#7d8794;opacity:.48;text-decoration:line-through;text-decoration-thickness:5px}.sound-unit--pulse{border-color:#f0be3f;box-shadow:0 0 0 6px rgba(240,190,63,.22),var(--learner-shadow-card);animation:hint-pulse 1.1s ease-in-out infinite}.sound-unit--direct{border-style:dashed;border-color:#e77768}.scissors{position:absolute;right:-9px;top:-17px;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:#fff2df;font-size:23px;text-decoration:none;box-shadow:0 3px 8px rgba(86,64,36,.15)}.arrow{color:#5576dd;font-family:var(--learner-font-display);font-size:44px;font-weight:900}.target-card{display:grid;place-items:center;min-width:160px;height:150px;padding:0 24px;border:4px solid #f1c85d;border-radius:29px;background:#fff8d7;color:#9d7c2d;font-family:var(--learner-font-display);font-size:58px;font-weight:900;box-shadow:var(--learner-shadow-card)}.target-card--complete{border-color:#62b96b;background:#f2fff0;color:#263853;animation:result-pop .4s ease-out}.replacement-area{display:flex;align-items:center;justify-content:center;gap:18px}.replacement-card{min-width:126px;height:92px;border:4px solid #f1e4c5;border-radius:23px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:38px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:pointer}.replacement-card--selected{border-color:#6288ed;background:#edf3ff}.replacement-card--hint{border-color:#e77768;box-shadow:0 0 0 6px rgba(231,119,104,.2),var(--learner-shadow-card);animation:hint-pulse 1.1s ease-in-out infinite}.action-row{display:flex;align-items:center;justify-content:space-between;min-height:60px}.action-row p{margin:0;padding-left:14px;color:#b6534e;font-family:var(--learner-font-display);font-size:20px;font-weight:900}.action{min-width:190px;min-height:58px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;box-shadow:0 7px 16px rgba(49,80,150,.24);cursor:pointer}.action--check{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.4;cursor:default}@keyframes hint-pulse{50%{transform:translateY(-4px) scale(1.05)}}@keyframes result-pop{0%{transform:scale(.65);opacity:.2}100%{transform:scale(1);opacity:1}}@media(max-width:900px){.task-row{grid-template-columns:180px minmax(0,1fr)}.manipulation-panel{padding:18px}.source-group{min-width:0}.sound-unit{min-width:92px;height:108px;font-size:42px}.target-card{min-width:130px;height:125px;font-size:49px}}@media(max-width:700px){.activity{overflow-y:auto}.task-row{grid-template-columns:1fr}.listen-button{min-height:120px;flex-direction:row}.listen-button svg{width:76px;height:76px}.word-flow{flex-wrap:wrap}.source-group{flex-wrap:wrap}.replacement-area{flex-wrap:wrap}}@media(max-height:800px){.activity{gap:10px;padding:13px 18px}.activity h1{font-size:27px}.task-row{grid-template-columns:190px minmax(0,1fr);gap:14px}.listen-button{gap:10px}.listen-button svg{width:76px;height:76px}.listen-button strong{font-size:20px}.manipulation-panel{gap:18px;padding:15px}.word-flow{gap:20px}.source-group{gap:10px}.sound-unit{min-width:91px;height:91px;font-size:39px}.target-card{min-width:126px;height:103px;font-size:46px}.replacement-card{min-width:108px;height:70px;font-size:32px}.action-row{min-height:52px}.action{min-height:52px}}@media(prefers-reduced-motion:reduce){.sound-unit--pulse,.replacement-card--hint,.target-card--complete{animation:none}.sound-unit{transition:none}}
</style>
