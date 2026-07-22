<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { replay, stop: stopAudio } = useAudioPlayer()
const targetSlot = ref<HTMLElement | null>(null)
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const placedChoice = ref<TrainingChoice | null>(null)
const attempts = ref(0)
const wrongChoiceId = ref<string | null>(null)
const statusMessage = ref('')
const readingCorrect = ref(false)
const isComplete = ref(false)
const draggingChoiceId = ref<string | null>(null)
const dragPoint = ref({ x: 0, y: 0 })
const overTarget = ref(false)
let wrongTimer: ReturnType<typeof setTimeout> | null = null
let disposed = false

const showHint = computed(() => attempts.value >= 2 && !placedChoice.value)

const pointIsOverTarget = (clientX: number, clientY: number) => {
  const rect = targetSlot.value?.getBoundingClientRect()
  return Boolean(rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom)
}

const finishCorrectChoice = async (choice: TrainingChoice) => {
  placedChoice.value = choice
  statusMessage.value = '잘 찾았어요!'
  readingCorrect.value = true
  await Promise.race([
    replay(choice.text ?? props.question.targetText ?? '', 0.78),
    new Promise<void>((resolve) => setTimeout(resolve, 4800)),
  ])
  stopAudio()
  if (disposed) return
  readingCorrect.value = false
  isComplete.value = true
  session.markRecordingComplete({ isMock: false, audioUrl: null })
}

const evaluateChoice = (choiceId: string) => {
  if (placedChoice.value || readingCorrect.value) return
  const choice = choices.value.find((item) => item.id === choiceId)
  if (!choice) return
  if (choice.id === props.question.answer) {
    void finishCorrectChoice(choice)
    return
  }
  attempts.value += 1
  wrongChoiceId.value = choice.id
  statusMessage.value = '한 번 더 해봐요'
  if (wrongTimer) clearTimeout(wrongTimer)
  wrongTimer = setTimeout(() => { wrongChoiceId.value = null }, 650)
}

const startPointerDrag = (event: PointerEvent, choice: TrainingChoice) => {
  if (placedChoice.value || readingCorrect.value || event.button !== 0) return
  event.preventDefault()
  draggingChoiceId.value = choice.id
  dragPoint.value = { x: event.clientX, y: event.clientY }
  overTarget.value = pointIsOverTarget(event.clientX, event.clientY)
}
const onPointerMove = (event: PointerEvent) => {
  if (!draggingChoiceId.value) return
  dragPoint.value = { x: event.clientX, y: event.clientY }
  overTarget.value = pointIsOverTarget(event.clientX, event.clientY)
}
const finishPointerDrag = (event: PointerEvent) => {
  const choiceId = draggingChoiceId.value
  if (!choiceId) return
  const shouldConnect = pointIsOverTarget(event.clientX, event.clientY)
  draggingChoiceId.value = null
  overTarget.value = false
  if (shouldConnect) evaluateChoice(choiceId)
}
const cancelPointerDrag = () => {
  draggingChoiceId.value = null
  overTarget.value = false
}

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', finishPointerDrag)
  window.addEventListener('pointercancel', cancelPointerDrag)
})
onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', finishPointerDrag)
  window.removeEventListener('pointercancel', cancelPointerDrag)
  if (wrongTimer) clearTimeout(wrongTimer)
  stopAudio()
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ placedChoice ? '그림과 문장이 연결됐어요!' : '그림에 맞는 문장을 연결해봐요' }}</h1>
      <p v-if="statusMessage" class="status-message" :class="{ success: placedChoice }" role="status" aria-live="polite">{{ statusMessage }}</p>
    </header>

    <div class="picture-panel">
      <img class="picture" :src="question.targetImage" :alt="question.targetImageLabel || '문제 그림'" />
      <div
        ref="targetSlot"
        class="sentence-target"
        :class="{ over: overTarget, filled: placedChoice, hint: showHint }"
      >
        <span v-if="placedChoice">{{ placedChoice.text }}</span>
      </div>
    </div>

    <div class="choices" :class="{ locked: placedChoice }" aria-label="문장 카드">
      <article
        v-for="choice in choices"
        :key="choice.id"
        class="sentence-card"
        :class="{
          wrong: wrongChoiceId === choice.id,
          hint: showHint && choice.id === question.answer,
          used: placedChoice?.id === choice.id,
        }"
        @pointerdown="startPointerDrag($event, choice)"
      >
        <span class="grip" aria-hidden="true">⠿</span>
        <strong>{{ choice.text }}</strong>
      </article>
    </div>

    <Teleport to="body">
      <div
        v-if="draggingChoiceId"
        class="drag-ghost"
        :style="{ left: `${dragPoint.x}px`, top: `${dragPoint.y}px` }"
        aria-hidden="true"
      >{{ choices.find((choice) => choice.id === draggingChoiceId)?.text }}</div>
    </Teleport>

    <footer class="action-bar">
      <p v-if="readingCorrect" class="reading-state" role="status"><span aria-hidden="true">●</span> 문장을 읽고 있어요</p>
      <button v-else-if="isComplete" class="next-button" type="button" @click="$emit('next')">다음</button>
    </footer>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;max-width:1120px;height:100%;min-height:0;padding:16px 26px 14px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eff8ff 58%,#e7f4d5 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.18),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity-heading{position:relative;display:flex;align-items:center;justify-content:center;width:100%;min-height:46px}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(26px,2.2vw,35px);font-weight:900}.status-message{position:absolute;right:0;margin:0;padding:9px 15px;border:2px solid #ecd79e;border-radius:999px;background:#fffdf4;color:#88651c;font-family:var(--learner-font-display);font-size:16px;font-weight:900}.status-message.success{border-color:#9bd488;background:#f2ffec;color:#388452}.picture-panel{display:flex;flex-direction:column;align-items:center;gap:9px;flex:1;min-height:0;width:min(100%,500px);padding:8px 10px 10px;border:4px solid #fff;border-radius:27px;background:#fffdf8;box-shadow:0 8px 19px rgba(64,86,111,.14)}.picture{width:100%;min-height:0;flex:1;object-fit:cover;border-radius:18px}.sentence-target{display:grid;place-items:center;width:100%;min-height:64px;padding:8px 16px;border:4px dashed #7e9be2;border-radius:18px;background:#eef4ff;color:#2e4d8c;font-family:var(--learner-font-display);font-size:22px;font-weight:900;text-align:center;transition:border-color .18s,background .18s,box-shadow .18s}.sentence-target.over{border-style:solid;border-color:#ffc83d;background:#fff8cd;box-shadow:0 0 0 5px rgba(255,208,48,.22)}.sentence-target.filled{border-style:solid;border-color:#65bd6d;background:#effbea;color:#297a35}.sentence-target.hint{animation:target-pulse .9s ease-in-out infinite}.choices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:min(100%,1020px);min-height:100px}.sentence-card{position:relative;display:grid;place-items:center;min-height:96px;padding:12px 22px;border:4px solid #efe1bd;border-radius:21px;background:#fffdf8;color:#263853;box-shadow:0 6px 15px rgba(59,83,111,.13);cursor:grab;touch-action:none;user-select:none;transition:border-color .18s,opacity .18s,box-shadow .18s}.sentence-card strong{font-family:var(--learner-font-display);font-size:clamp(18px,1.7vw,25px);font-weight:900;text-align:center;line-height:1.35}.grip{position:absolute;right:10px;top:6px;color:#a8b2c1;font-size:20px}.sentence-card.wrong{border-color:#ed8175;background:#fff1ee;animation:shake .38s ease-in-out}.sentence-card.hint{border-color:#ffc83d;animation:card-pulse .9s ease-in-out infinite}.sentence-card.used{opacity:.2}.choices.locked .sentence-card:not(.used){opacity:.4;cursor:default}.action-bar{display:flex;align-items:center;justify-content:center;width:100%;min-height:52px}.reading-state{display:flex;align-items:center;gap:9px;margin:0;padding:12px 20px;border-radius:999px;background:#fff8d8;color:#7f641a;font-family:var(--learner-font-display);font-size:18px;font-weight:900}.reading-state span{color:#f0b72e}.next-button{min-width:190px;min-height:52px;border:0;border-radius:20px;background:linear-gradient(180deg,#ffc75a,#f2a92f);color:#fff;font-family:var(--learner-font-display);font-size:21px;font-weight:900;box-shadow:0 7px 16px rgba(150,96,16,.22);cursor:pointer}.next-button:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.drag-ghost{position:fixed;z-index:100;display:grid;place-items:center;width:min(310px,80vw);min-height:82px;padding:12px 20px;border:4px solid #6f91e9;border-radius:20px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:23px;font-weight:900;text-align:center;box-shadow:0 16px 28px rgba(45,75,120,.28);transform:translate(-50%,-50%) rotate(-2deg);pointer-events:none}@keyframes shake{25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}@keyframes target-pulse{50%{border-color:#ffb823;background:#fff8cf}}@keyframes card-pulse{50%{box-shadow:0 0 0 7px rgba(255,210,52,.3),0 8px 18px rgba(151,111,20,.18)}}@media(max-height:800px){.activity{gap:9px;padding:10px 22px 9px}.activity-heading{min-height:40px}.activity-heading h1{font-size:27px}.picture-panel{width:min(100%,410px)}.sentence-target{min-height:54px}.choices{min-height:82px}.sentence-card{min-height:78px;padding-block:8px}.sentence-card strong{font-size:19px}.action-bar{min-height:45px}.next-button{min-height:46px}}@media(max-width:760px){.activity{overflow-y:auto}.activity-heading{align-items:flex-start;flex-direction:column}.status-message{position:static;align-self:flex-end}.choices{grid-template-columns:1fr}.picture-panel{min-height:280px}.sentence-card{min-height:70px}}@media(prefers-reduced-motion:reduce){.sentence-target,.sentence-card,.sentence-card.wrong,.sentence-card.hint,.sentence-target.hint{transition:none;animation:none}}
</style>
