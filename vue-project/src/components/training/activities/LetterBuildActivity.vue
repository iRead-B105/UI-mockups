<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { LetterBuildSlot, TrainingChoice, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const audio = useAudioPlayer()
const placements = reactive<Record<string, string>>({})
const draggedChoiceId = ref<string | null>(null)
const activeSlotId = ref<string | null>(null)
const suppressClickSlotId = ref<string | null>(null)

const slots = computed<LetterBuildSlot[]>(() => props.question.buildSlots ?? [])
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const isCorrect = computed(() => session.progressState.isCurrentCorrect === true)
const allFilled = computed(() => slots.value.every((item) => Boolean(placements[item.id])))
const usedChoiceIds = computed(() => new Set(Object.values(placements)))

const choiceById = (id: string | undefined) => choices.value.find((item) => item.id === id)
const textFor = (id: string | undefined) => choiceById(id)?.text ?? ''
const isAnswerCard = (choiceId: string) => slots.value.some((item) => item.answerChoiceId === choiceId)

const clearPlacements = () => {
  Object.keys(placements).forEach((key) => delete placements[key])
  draggedChoiceId.value = null
  activeSlotId.value = null
}

const playQuestion = () => {
  if (props.question.audioText) void audio.replay(props.question.audioText, 0.78)
}

const startDrag = (event: DragEvent, choiceId: string) => {
  if (isCorrect.value) return
  draggedChoiceId.value = choiceId
  event.dataTransfer?.setData('text/plain', choiceId)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const startPointerDrag = (choiceId: string) => {
  if (!isCorrect.value) draggedChoiceId.value = choiceId
}

const placeChoice = (choiceId: string, slotId: string) => {
  Object.keys(placements).forEach((key) => {
    if (placements[key] === choiceId) delete placements[key]
  })
  placements[slotId] = choiceId
  session.selectAnswer('배치 중')
}

const dropOn = (event: DragEvent, slotId: string) => {
  if (isCorrect.value) return
  const choiceId = event.dataTransfer?.getData('text/plain') || draggedChoiceId.value
  draggedChoiceId.value = null
  activeSlotId.value = null
  if (!choiceId) return
  placeChoice(choiceId, slotId)
}

const dropPointerOn = (slotId: string) => {
  const choiceId = draggedChoiceId.value
  if (!choiceId || isCorrect.value) return
  suppressClickSlotId.value = slotId
  placeChoice(choiceId, slotId)
  draggedChoiceId.value = null
  activeSlotId.value = null
}

const clearSlot = (slotId: string) => {
  if (suppressClickSlotId.value === slotId) {
    suppressClickSlotId.value = null
    return
  }
  if (isCorrect.value || !placements[slotId]) return
  delete placements[slotId]
  session.selectAnswer('배치 중')
}

const releasePointer = () => {
  draggedChoiceId.value = null
  activeSlotId.value = null
}

onMounted(() => window.addEventListener('pointerup', releasePointer))
onUnmounted(() => window.removeEventListener('pointerup', releasePointer))

const submit = () => {
  if (!allFilled.value || isCorrect.value) return
  const correctArrangement = slots.value.every(
    (item) => placements[item.id] === item.answerChoiceId,
  )
  const arrangedValue = slots.value.map((item) => placements[item.id]).join('|')
  session.selectAnswer(correctArrangement ? props.question.answer : arrangedValue)
  const completed = session.submitAnswer()

  if (completed) {
    void audio.speak(props.question.combined ?? props.question.audioText ?? '', 0.78)
  } else if (session.progressState.attemptCount >= 3 && session.progressState.hintLevel < 2) {
    session.showHint()
    clearPlacements()
  }
}

watch(
  () => props.question.id,
  () => {
    clearPlacements()
    void nextTick(playQuestion)
  },
  { immediate: true },
)
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <h1>{{ question.instruction }}</h1>

    <div class="learning-area">
      <button
        class="listen-button"
        type="button"
        :disabled="audio.isPlaying.value"
        aria-label="만들 글자 소리 다시 듣기"
        @click="playQuestion"
      >
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M13 25h12l15-11v36L25 39H13z" fill="currentColor" />
          <path d="M46 23c4 5 4 13 0 18M52 17c8 9 8 21 0 30" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
        </svg>
        <strong>{{ audio.isPlaying.value ? '듣고 있어요' : '다시 듣기' }}</strong>
      </button>

      <div class="build-panel">
        <div class="slot-row" :class="{ 'slot-row--wrong': session.progressState.isCurrentCorrect === false }">
          <template v-for="(buildSlot, index) in slots" :key="buildSlot.id">
            <span v-if="index" class="plus" aria-hidden="true">+</span>
            <button
              class="build-slot"
              :class="{
                'build-slot--filled': placements[buildSlot.id],
                'build-slot--active': activeSlotId === buildSlot.id,
                'build-slot--hint': session.progressState.hintLevel >= 2,
              }"
              type="button"
              :aria-label="`${index + 1}번째 빈칸${placements[buildSlot.id] ? `, ${textFor(placements[buildSlot.id])} 놓임` : ''}`"
              @dragenter.prevent="activeSlotId = buildSlot.id"
              @dragover.prevent
              @drop.prevent="dropOn($event, buildSlot.id)"
              @pointerenter="draggedChoiceId && (activeSlotId = buildSlot.id)"
              @pointerleave="activeSlotId === buildSlot.id && (activeSlotId = null)"
              @pointerup="dropPointerOn(buildSlot.id)"
              @click="clearSlot(buildSlot.id)"
            >
              <strong v-if="placements[buildSlot.id]">{{ textFor(placements[buildSlot.id]) }}</strong>
              <span v-else-if="session.progressState.hintLevel >= 2" class="slot-hint">{{ buildSlot.hintText }}</span>
              <span v-else class="slot-number">{{ index + 1 }}</span>
            </button>
          </template>

          <span class="equals" aria-hidden="true">=</span>
          <div class="result-card" :class="{ 'result-card--complete': isCorrect }" aria-live="polite">
            {{ isCorrect ? question.combined : '?' }}
          </div>
        </div>

        <div class="card-pool" aria-label="끌어 놓을 글자 카드">
          <div
            v-for="choice in choices"
            :key="choice.id"
            class="letter-chip"
            :class="{
              'letter-chip--used': usedChoiceIds.has(choice.id),
              'letter-chip--hint': session.progressState.hintLevel >= 1 && isAnswerCard(choice.id),
            }"
            :draggable="!isCorrect"
            role="button"
            :tabindex="isCorrect ? -1 : 0"
            :aria-label="`${choice.text} 카드`"
            @dragstart="startDrag($event, choice.id)"
            @dragend="activeSlotId = null"
            @pointerdown="startPointerDrag(choice.id)"
          >
            {{ choice.text }}
          </div>
        </div>
      </div>
    </div>

    <div class="action-row">
      <p v-if="session.progressState.isCurrentCorrect === false" role="status">카드를 다시 놓아봐요.</p>
      <span v-else></span>
      <button v-if="!isCorrect" class="action action--check" type="button" :disabled="!allFilled" @click="submit">
        완성하기
      </button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:16px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 26px 20px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#edf7ff 58%,#e6f3ce 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity h1{margin:0;text-align:center;color:#233d79;font-family:var(--learner-font-display);font-size:clamp(29px,2.4vw,38px);font-weight:900}.learning-area{display:grid;grid-template-columns:220px minmax(0,1fr);gap:20px;flex:1;min-height:0}.listen-button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;border:3px solid #fff;border-radius:26px;background:rgba(255,253,244,.93);color:#4f72e1;box-shadow:0 7px 18px rgba(55,87,130,.13);cursor:pointer}.listen-button svg{width:96px;height:96px;padding:19px;border-radius:50%;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;box-shadow:0 10px 22px rgba(62,98,183,.24)}.listen-button strong{font-family:var(--learner-font-display);font-size:23px;font-weight:900}.listen-button:disabled{opacity:.86;cursor:default}.listen-button:focus-visible,.build-slot:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.build-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;padding:24px;border-radius:26px;background:rgba(255,255,255,.48)}.slot-row{display:flex;align-items:center;justify-content:center;gap:12px;width:100%}.build-slot{display:grid;place-items:center;width:130px;height:124px;border:4px dashed #8ba6df;border-radius:25px;background:rgba(255,255,255,.7);color:#8b9bb5;font-family:var(--learner-font-display);cursor:pointer;transition:border-color .15s,transform .15s,background .15s}.build-slot--active{border-color:#4f72e1;background:#eef3ff;transform:scale(1.04)}.build-slot--filled{border-style:solid;border-color:#7191e9;background:#fffdf8;color:#263853;box-shadow:var(--learner-shadow-card)}.build-slot strong{font-size:52px;font-weight:900}.slot-number{font-size:32px;font-weight:900;opacity:.45}.slot-hint{color:#e0ae31;font-size:49px;font-weight:900;opacity:.45}.slot-row--wrong .build-slot--filled{border-color:#ef8a7f;background:#fff3ef}.plus,.equals{color:#5576dd;font-family:var(--learner-font-display);font-size:31px;font-weight:900}.result-card{display:grid;place-items:center;width:132px;height:132px;border:4px solid #f1c85d;border-radius:28px;background:#fff8d7;color:#b9953a;font-family:var(--learner-font-display);font-size:62px;font-weight:900;box-shadow:var(--learner-shadow-card)}.result-card--complete{border-color:#62b96b;background:#f2fff0;color:#263853;animation:result-pop .4s ease-out}.card-pool{display:grid;grid-template-columns:repeat(4,112px);justify-content:center;gap:16px}.letter-chip{display:grid;place-items:center;height:96px;border:4px solid #f1e4c5;border-radius:23px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:42px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:grab;user-select:none;transition:transform .16s,opacity .16s}.letter-chip:hover{transform:translateY(-4px)}.letter-chip:active{cursor:grabbing}.letter-chip--used{opacity:.48}.letter-chip--hint{border-color:#f0be3f;box-shadow:0 0 0 6px rgba(240,190,63,.22),var(--learner-shadow-card);animation:hint-pulse 1.1s ease-in-out infinite}.action-row{display:flex;align-items:center;justify-content:space-between;min-height:60px}.action-row p{margin:0;padding-left:14px;color:#b6534e;font-family:var(--learner-font-display);font-size:20px;font-weight:900}.action{min-width:190px;min-height:58px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;box-shadow:0 7px 16px rgba(49,80,150,.24);cursor:pointer}.action--check{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.4;cursor:default}@keyframes hint-pulse{50%{transform:translateY(-4px) scale(1.06)}}@keyframes result-pop{0%{transform:scale(.65);opacity:.2}100%{transform:scale(1);opacity:1}}@media(max-width:900px){.learning-area{grid-template-columns:180px minmax(0,1fr)}.build-panel{padding:18px}.build-slot{width:108px;height:105px}.build-slot strong,.slot-hint{font-size:43px}.result-card{width:108px;height:112px}.card-pool{grid-template-columns:repeat(4,96px)}.letter-chip{height:84px}}@media(max-width:700px){.activity{overflow-y:auto}.learning-area{grid-template-columns:1fr}.listen-button{min-height:120px;flex-direction:row}.listen-button svg{width:76px;height:76px}.slot-row{flex-wrap:wrap}.card-pool{grid-template-columns:repeat(2,110px)}}@media(max-height:800px){.activity{gap:10px;padding:13px 18px}.activity h1{font-size:27px}.learning-area{grid-template-columns:190px minmax(0,1fr);gap:14px}.listen-button{gap:10px}.listen-button svg{width:76px;height:76px}.listen-button strong{font-size:20px}.build-panel{gap:18px;padding:15px}.build-slot{width:105px;height:91px}.build-slot strong,.slot-hint{font-size:40px}.result-card{width:108px;height:98px;font-size:52px}.card-pool{grid-template-columns:repeat(4,102px);gap:12px}.letter-chip{height:76px;font-size:36px}.action-row{min-height:52px}.action{min-height:52px}}@media(prefers-reduced-motion:reduce){.letter-chip--hint,.result-card--complete{animation:none}.letter-chip{transition:none}}
</style>
