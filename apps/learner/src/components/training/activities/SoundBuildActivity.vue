<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const { isPlaying, playSequence, replay } = useAudioPlayer()

const isSplit = computed(() => Boolean(props.question.targetText))
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const slotCount = computed(() => props.question.soundParts?.length ?? 2)
const slots = ref<(string | null)[]>([])
const draggedChoiceId = ref<string | null>(null)

const resetSlots = () => {
  slots.value = Array.from({ length: slotCount.value }, () => null)
  draggedChoiceId.value = null
}

watch(() => props.question.id, resetSlots, { immediate: true })

const isAnswered = computed(() => progressState.isCurrentCorrect === true)
const isWrong = computed(() => progressState.isCurrentCorrect === false)
const allFilled = computed(() => slots.value.every(Boolean))
const remainingChoices = computed(() =>
  choices.value.filter((choice) => !slots.value.includes(choice.id)),
)
const placedChoices = computed(() =>
  slots.value.map((id) => choices.value.find((choice) => choice.id === id) ?? null),
)
const assembledText = computed(() =>
  placedChoices.value.map((choice) => choice?.text ?? '').join(''),
)

const syncAnswer = () => {
  progressState.isCurrentCorrect = null
  if (allFilled.value) session.selectAnswer(slots.value.join('|'))
  else progressState.selectedAnswer = null
}

const placeChoice = (choiceId: string, targetIndex?: number) => {
  if (isAnswered.value || slots.value.includes(choiceId)) return
  const index = targetIndex ?? slots.value.findIndex((value) => value === null)
  if (index < 0 || slots.value[index] !== null) return
  const next = [...slots.value]
  next[index] = choiceId
  slots.value = next
  syncAnswer()
}

const removeChoice = (index: number) => {
  if (isAnswered.value || !slots.value[index]) return
  const next = [...slots.value]
  next[index] = null
  slots.value = next
  syncAnswer()
}

const onDragStart = (choiceId: string) => {
  draggedChoiceId.value = choiceId
}

const onDrop = (index: number) => {
  if (draggedChoiceId.value) placeChoice(draggedChoiceId.value, index)
  draggedChoiceId.value = null
}

const playPrompt = async () => {
  if (isPlaying.value) return
  if (isSplit.value && props.question.targetText) {
    await replay(props.question.targetText, 0.75)
    return
  }
  await playSequence(props.question.soundParts ?? [], 0.68)
}
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ question.instruction }}</h1>
      <p v-if="question.subInstruction">{{ question.subInstruction }}</p>
    </header>

    <div class="activity-main">
      <div class="sound-panel">
        <strong v-if="isSplit" class="target-word">{{ question.targetText }}</strong>
        <div v-else class="sound-pieces" aria-hidden="true">
          <template v-for="(_, index) in question.soundParts" :key="index">
            <span class="sound-piece">
              <svg viewBox="0 0 32 32">
                <path d="M7 12h6l8-6v20l-8-6H7z" fill="currentColor" />
                <path d="M24 11c3 3 3 7 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
            </span>
            <span v-if="index < slotCount - 1" class="piece-plus">+</span>
          </template>
        </div>
        <button class="listen-button" type="button" :disabled="isPlaying" @click="playPrompt">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M7 12h6l8-6v20l-8-6H7z" fill="currentColor" />
            <path d="M24 11c3 3 3 7 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <span>{{ isPlaying ? '듣고 있어요…' : '소리 듣기' }}</span>
        </button>
      </div>

      <div class="build-panel">
        <div class="slot-row" :class="{ 'slot-row--wrong': isWrong }">
          <template v-for="(choice, index) in placedChoices" :key="index">
            <button
              class="sound-slot"
              :class="{ filled: choice, correct: isAnswered }"
              type="button"
              :disabled="isAnswered"
              :aria-label="choice ? `${index + 1}번째 소리 ${choice.text}, 빼기` : `${index + 1}번째 소리 빈칸`"
              @click="removeChoice(index)"
              @dragover.prevent
              @drop="onDrop(index)"
            >
              <span v-if="choice">{{ choice.text }}</span>
              <span v-else class="slot-number">{{ index + 1 }}</span>
            </button>
            <span v-if="index < slotCount - 1" class="slot-plus" aria-hidden="true">+</span>
          </template>

          <template v-if="!isSplit">
            <span class="slot-equals" aria-hidden="true">=</span>
            <div class="result-word" :class="{ revealed: allFilled, correct: isAnswered }" aria-live="polite">
              {{ allFilled ? assembledText : '?' }}
            </div>
          </template>
        </div>

        <div class="source-cards" aria-label="소리 카드">
          <button
            v-for="choice in remainingChoices"
            :key="choice.id"
            class="sound-card"
            type="button"
            :draggable="!isAnswered"
            :disabled="isAnswered"
            :aria-label="`${choice.text} 카드 놓기`"
            @click="placeChoice(choice.id)"
            @dragstart="onDragStart(choice.id)"
            @dragend="draggedChoiceId = null"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button
        v-if="!isAnswered"
        class="action action--primary"
        type="button"
        :disabled="!allFilled"
        @click="session.submitAnswer()"
      >
        확인
      </button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 26px 20px;border:4px solid rgba(255,255,255,.92);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eef8ff 58%,#e5f4d1 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity-heading{text-align:center}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900;line-height:1.12}.activity-heading p{margin:5px 0 0;color:#526a83;font-size:18px;font-weight:700}.activity-main{display:grid;grid-template-columns:280px minmax(0,1fr);gap:22px;flex:1;min-height:0}.sound-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:22px;border:3px solid rgba(255,255,255,.94);border-radius:26px;background:rgba(255,253,244,.92);box-shadow:0 6px 16px rgba(62,91,120,.1)}.target-word{display:grid;place-items:center;width:180px;height:145px;border:5px solid #fff;border-radius:30px;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;font-family:var(--learner-font-display);font-size:50px;font-weight:900;box-shadow:0 10px 22px rgba(62,98,183,.24)}.sound-pieces{display:flex;align-items:center;justify-content:center;gap:9px;min-height:145px}.sound-piece{display:grid;place-items:center;width:86px;height:86px;border:5px solid #fff;border-radius:50%;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;box-shadow:0 8px 18px rgba(62,98,183,.22)}.sound-piece svg{width:44px;height:44px}.piece-plus{color:#5576dd;font-family:var(--learner-font-display);font-size:30px;font-weight:900}.listen-button{display:flex;align-items:center;justify-content:center;gap:10px;min-width:178px;height:58px;padding:0 20px;border:2px solid #f1dfae;border-radius:999px;background:#fff;color:#3b64d8;font-family:var(--learner-font-display);font-size:18px;font-weight:900;box-shadow:0 5px 12px rgba(61,86,122,.12);cursor:pointer}.listen-button svg{width:28px;height:28px}.listen-button:disabled{opacity:.72;cursor:default}.listen-button:focus-visible,.sound-card:focus-visible,.sound-slot:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.build-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;padding:26px;border-radius:26px;background:rgba(255,255,255,.42)}.slot-row{display:flex;align-items:center;justify-content:center;gap:14px;min-height:172px}.sound-slot,.result-word{display:grid;place-items:center;width:150px;height:142px;border-radius:24px;font-family:var(--learner-font-display);font-size:52px;font-weight:900}.sound-slot{border:4px dashed #86a3df;background:rgba(255,255,255,.66);color:#8090aa;cursor:pointer}.sound-slot.filled{border-style:solid;border-color:#7191e9;background:#fffdf8;color:#263853;box-shadow:var(--learner-shadow-card)}.sound-slot.correct{border-color:#5fbd69;background:#f3fff0}.slot-number{opacity:.5}.slot-plus,.slot-equals{color:#5576dd;font-family:var(--learner-font-display);font-size:32px;font-weight:900}.result-word{border:4px solid #f1c85d;background:#fff8d7;color:#ad8120;box-shadow:var(--learner-shadow-card)}.result-word.revealed{color:#263853}.result-word.correct{border-color:#5fbd69;background:#f3fff0}.slot-row--wrong .sound-slot.filled{border-color:#ef8a7f;background:#fff4f1}.source-cards{display:flex;align-items:center;justify-content:center;gap:18px;min-height:118px}.sound-card{width:142px;height:112px;border:4px solid #f1e4c5;border-radius:24px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:42px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:grab;transition:transform .16s ease,box-shadow .16s ease}.sound-card:hover:not(:disabled){transform:translateY(-4px);box-shadow:var(--learner-shadow-floating)}.sound-card:active:not(:disabled){cursor:grabbing}.action-bar{display:flex;justify-content:flex-end}.action{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(49,80,150,.24)}.action--primary{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.42;cursor:default}@media(max-width:900px){.activity-main{grid-template-columns:220px 1fr}.sound-slot,.result-word{width:118px;height:120px}.sound-card{width:116px}.build-panel{padding:18px}.target-word{width:150px}}@media(max-width:700px){.activity{overflow-y:auto}.activity-main{grid-template-columns:1fr}.sound-panel{flex-direction:row}.target-word{width:120px;height:100px;font-size:38px}.sound-pieces{min-height:100px}.build-panel{gap:22px}.slot-row{flex-wrap:wrap}.source-cards{flex-wrap:wrap}}@media(max-height:800px){.activity{gap:12px;padding:14px 20px 14px}.activity-heading h1{font-size:26px}.activity-heading p{margin-top:2px;font-size:16px}.activity-main{grid-template-columns:240px minmax(0,1fr);gap:16px}.sound-panel{gap:12px;padding:12px}.target-word{width:150px;height:105px;font-size:42px}.sound-pieces{min-height:105px}.sound-piece{width:68px;height:68px}.sound-piece svg{width:34px;height:34px}.listen-button{height:48px}.build-panel{gap:20px;padding:16px}.slot-row{min-height:128px}.sound-slot,.result-word{width:125px;height:112px;font-size:44px}.source-cards{min-height:90px}.sound-card{width:124px;height:86px;font-size:36px}.action{min-height:56px}}@media(prefers-reduced-motion:reduce){.sound-card{transition:none}}
</style>
