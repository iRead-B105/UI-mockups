<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

interface SpeechResultEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}
interface SpeechErrorEvent extends Event { error?: string }
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechResultEvent) => void) | null
  onerror: ((event: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
type SpeechState = 'waiting' | 'listening' | 'retry' | 'success' | 'denied'

const session = useTrainingSession()
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const sentenceParts = computed(() => (props.question.targetText ?? '').split('___'))
const correctChoice = computed(() => choices.value.find((choice) => choice.id === props.question.answer) ?? null)
const completedSentence = computed(() =>
  (props.question.targetText ?? '').replace('___', correctChoice.value?.text ?? ''),
)

const placedChoice = ref<TrainingChoice | null>(null)
const blankElement = ref<HTMLElement | null>(null)
const attempts = ref(0)
const wrongChoiceId = ref<string | null>(null)
const isOverBlank = ref(false)
const draggingChoiceId = ref<string | null>(null)
const dragPoint = ref({ x: 0, y: 0 })
const speechState = ref<SpeechState>('waiting')
const speechMessage = ref('')
let recognition: SpeechRecognitionLike | null = null
let wrongTimer: ReturnType<typeof setTimeout> | null = null

const isFilled = computed(() => placedChoice.value?.id === props.question.answer)
const showHint = computed(() => attempts.value >= 2 && !isFilled.value)
const isComplete = computed(() => speechState.value === 'success')

const normalize = (value: string) => value.replace(/[\s.,!?~'"’“”]/g, '').toLowerCase()

const sentenceMatches = (transcript: string) => {
  const heard = normalize(transcript)
  const answer = normalize(completedSentence.value)
  return Boolean(answer && (heard === answer || heard.includes(answer)))
}

const finishSpeech = () => {
  if (isComplete.value) return
  speechState.value = 'success'
  speechMessage.value = '다 읽었어요!'
  session.markRecordingComplete({ isMock: false, audioUrl: null })
}

const handleTranscript = (transcript: string) => {
  if (!isFilled.value || speechState.value !== 'listening') return
  if (sentenceMatches(transcript)) finishSpeech()
  else {
    speechState.value = 'retry'
    speechMessage.value = '한 번 더 읽어봐요'
  }
}

const startSpeech = () => {
  if (!isFilled.value || speechState.value === 'listening' || isComplete.value) return
  speechState.value = 'listening'
  speechMessage.value = '문장을 읽어봐요'

  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
  if (!Recognition) return

  recognition?.stop()
  recognition = new Recognition()
  recognition.lang = 'ko-KR'
  recognition.interimResults = false
  recognition.continuous = false
  recognition.onresult = (event) => handleTranscript(event.results[0]?.[0]?.transcript ?? '')
  recognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
      speechState.value = 'denied'
      speechMessage.value = '마이크를 켜고 다시 눌러요'
      return
    }
    if (event.error !== 'aborted') {
      speechState.value = 'retry'
      speechMessage.value = '한 번 더 읽어봐요'
    }
  }
  recognition.onend = () => {
    if (speechState.value === 'listening') {
      speechState.value = 'retry'
      speechMessage.value = '한 번 더 읽어봐요'
    }
    recognition = null
  }
  recognition.start()
}

const evaluateChoice = (choiceId: string) => {
  if (isFilled.value) return
  const choice = choices.value.find((item) => item.id === choiceId)
  if (!choice) return

  if (choice.id === props.question.answer) {
    placedChoice.value = choice
    wrongChoiceId.value = null
    speechState.value = 'waiting'
    speechMessage.value = ''
    return
  }

  attempts.value += 1
  wrongChoiceId.value = choice.id
  speechMessage.value = '한 번 더 해봐요'
  if (wrongTimer) clearTimeout(wrongTimer)
  wrongTimer = setTimeout(() => {
    wrongChoiceId.value = null
  }, 650)
}

const pointIsOverBlank = (clientX: number, clientY: number) => {
  const rect = blankElement.value?.getBoundingClientRect()
  return Boolean(rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom)
}
const startPointerDrag = (event: PointerEvent, choice: TrainingChoice) => {
  if (isFilled.value || event.button !== 0) return
  event.preventDefault()
  draggingChoiceId.value = choice.id
  dragPoint.value = { x: event.clientX, y: event.clientY }
  isOverBlank.value = pointIsOverBlank(event.clientX, event.clientY)
}
const onPointerMove = (event: PointerEvent) => {
  if (!draggingChoiceId.value) return
  dragPoint.value = { x: event.clientX, y: event.clientY }
  isOverBlank.value = pointIsOverBlank(event.clientX, event.clientY)
}
const finishPointerDrag = (event: PointerEvent) => {
  const choiceId = draggingChoiceId.value
  if (!choiceId) return
  const shouldDrop = pointIsOverBlank(event.clientX, event.clientY)
  draggingChoiceId.value = null
  isOverBlank.value = false
  if (shouldDrop) evaluateChoice(choiceId)
}
const cancelPointerDrag = () => {
  draggingChoiceId.value = null
  isOverBlank.value = false
}
const onExternalSpeech = (event: Event) => {
  const detail = (event as CustomEvent<{ transcript?: string }>).detail
  if (detail?.transcript) handleTranscript(detail.transcript)
}

onMounted(() => {
  window.addEventListener('iread:speech', onExternalSpeech)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', finishPointerDrag)
  window.addEventListener('pointercancel', cancelPointerDrag)
})
onBeforeUnmount(() => {
  window.removeEventListener('iread:speech', onExternalSpeech)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', finishPointerDrag)
  window.removeEventListener('pointercancel', cancelPointerDrag)
  recognition?.stop()
  if (wrongTimer) clearTimeout(wrongTimer)
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ isFilled ? '완성한 문장을 읽어봐요' : '빈칸에 낱말을 넣어봐요' }}</h1>
      <p v-if="speechMessage" class="status-message" :class="speechState" role="status" aria-live="polite">
        {{ speechMessage }}
      </p>
    </header>

    <div class="sentence-card" aria-live="polite">
      <span>{{ sentenceParts[0] }}</span>
      <span
        ref="blankElement"
        class="blank"
        :class="{ filled: isFilled, over: isOverBlank, hint: showHint }"
      >
        {{ placedChoice?.text ?? '' }}
      </span>
      <span>{{ sentenceParts[1] }}</span>
    </div>

    <div class="choices" :class="{ locked: isFilled }">
      <article
        v-for="choice in choices"
        :key="choice.id"
        class="word-card"
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
      >
        {{ choices.find((choice) => choice.id === draggingChoiceId)?.text }}
      </div>
    </Teleport>

    <footer class="action-bar">
      <button
        v-if="isFilled && !isComplete"
        class="speak-button"
        type="button"
        :disabled="speechState === 'listening'"
        @click="startSpeech"
      >
        <span aria-hidden="true">●</span>
        {{ speechState === 'listening' ? '듣고 있어요' : '문장 읽기' }}
      </button>
      <button v-else-if="isComplete" class="next-button" type="button" @click="$emit('next')">다음</button>
    </footer>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;width:100%;max-width:1120px;height:100%;min-height:0;padding:22px 30px 20px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eff8ff 58%,#e7f4d5 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.18),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity-heading{position:relative;display:flex;align-items:center;justify-content:center;width:100%;min-height:54px}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900}.status-message{position:absolute;right:0;margin:0;padding:11px 17px;border:2px solid #ecd79e;border-radius:999px;background:#fffdf4;color:#88651c;font-family:var(--learner-font-display);font-size:17px;font-weight:900}.status-message.success{border-color:#9bd488;background:#f2ffec;color:#388452}.status-message.denied{border-color:#e5b1a9;color:#a34d42}.sentence-card{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:14px;width:min(100%,920px);min-height:150px;padding:24px 32px;border:5px solid #fff;border-radius:29px;background:#fffdf5;color:#263853;font-family:var(--learner-font-display);font-size:clamp(32px,3.5vw,50px);font-weight:900;box-shadow:inset 0 0 0 2px #eadfbd,0 9px 20px rgba(70,91,112,.13)}.blank{display:grid;place-items:center;min-width:170px;min-height:82px;padding:0 22px;border:5px dashed #7593e4;border-radius:21px;background:#eef4ff;color:#3158c6;transition:border-color .18s,background .18s,transform .18s,box-shadow .18s}.blank.over{border-style:solid;background:#fff5bd;transform:scale(1.04);box-shadow:0 0 0 6px rgba(255,210,52,.22)}.blank.filled{border-style:solid;border-color:#62bd69;background:#efffea;color:#297a35}.blank.hint{animation:blank-pulse .9s ease-in-out infinite}.choices{display:grid;grid-template-columns:repeat(3,minmax(180px,230px));gap:22px;justify-content:center;width:100%;min-height:152px}.word-card{position:relative;display:grid;place-items:center;min-height:145px;padding:18px;border:4px solid #efe1bd;border-radius:25px;background:#fffdf8;color:#263853;box-shadow:0 7px 17px rgba(59,83,111,.13);cursor:grab;user-select:none;transition:transform .18s,opacity .18s,border-color .18s,box-shadow .18s}.word-card:active{cursor:grabbing}.word-card strong{font-family:var(--learner-font-display);font-size:34px;font-weight:900}.grip{position:absolute;top:10px;right:14px;color:#a8b2c1;font-size:24px}.word-card.wrong{border-color:#ed8175;background:#fff2ef;animation:shake .38s ease-in-out}.word-card.hint{border-color:#ffc83d;animation:card-pulse .9s ease-in-out infinite}.word-card.used{opacity:.22}.choices.locked .word-card:not(.used){opacity:.42;cursor:default}.action-bar{display:flex;align-items:center;justify-content:center;width:100%;min-height:62px}.speak-button,.next-button{display:flex;align-items:center;justify-content:center;gap:11px;min-width:210px;min-height:60px;border:0;border-radius:21px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer}.speak-button{background:linear-gradient(180deg,#7194f2,#4f72df);box-shadow:0 8px 18px rgba(50,81,155,.25)}.speak-button span{display:grid;place-items:center;width:34px;height:34px;border:3px solid rgba(255,255,255,.82);border-radius:50%;font-size:14px}.speak-button:disabled{opacity:.62}.next-button{background:linear-gradient(180deg,#ffc75a,#f2a92f);box-shadow:0 8px 18px rgba(150,96,16,.22)}.speak-button:focus-visible,.next-button:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}@keyframes shake{25%{transform:translateX(-9px)}75%{transform:translateX(9px)}}@keyframes card-pulse{50%{box-shadow:0 0 0 7px rgba(255,210,52,.3),0 8px 18px rgba(151,111,20,.18)}}@keyframes blank-pulse{50%{border-color:#ffd044;background:#fff9d5}}@media(max-height:800px){.activity{gap:15px;padding:13px 24px}.activity-heading{min-height:44px}.activity-heading h1{font-size:27px}.sentence-card{min-height:112px;padding:14px 22px;font-size:36px}.blank{min-height:64px}.choices{min-height:118px}.word-card{min-height:112px;padding:10px}.word-card strong{font-size:29px}.action-bar{min-height:52px}.speak-button,.next-button{min-height:52px}}@media(max-width:760px){.activity{padding:14px}.activity-heading{align-items:flex-start;flex-direction:column}.status-message{position:static;align-self:flex-end}.choices{grid-template-columns:repeat(3,1fr);gap:10px}.word-card strong{font-size:25px}}@media(prefers-reduced-motion:reduce){.blank,.word-card,.word-card.wrong,.word-card.hint,.blank.hint{transition:none;animation:none}}
.word-card{touch-action:none}
.drag-ghost{position:fixed;z-index:100;display:grid;place-items:center;min-width:190px;min-height:105px;padding:14px 22px;border:4px solid #6f91e9;border-radius:23px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:32px;font-weight:900;box-shadow:0 16px 28px rgba(45,75,120,.28);transform:translate(-50%,-50%) rotate(-2deg);pointer-events:none}
</style>
