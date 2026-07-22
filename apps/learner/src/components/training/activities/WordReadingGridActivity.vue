<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
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
type MessageState = 'ready' | 'listening' | 'retry' | 'help' | 'complete' | 'denied'

const session = useTrainingSession()
const { replay, stop: stopAudio } = useAudioPlayer()
const grid = ref<HTMLElement | null>(null)
const started = ref(false)
const activeIndex = ref(0)
const completedIds = ref<string[]>([])
const failureCount = ref(0)
const assistIndex = ref<number | null>(null)
const gazeIndex = ref<number | null>(null)
const gazePoint = ref({ x: 0, y: 0 })
const gazeVisible = ref(false)
const dwellProgress = ref(0)
const messageState = ref<MessageState>('ready')

let recognition: SpeechRecognitionLike | null = null
let recognitionRunning = false
let recognitionRestart: ReturnType<typeof setTimeout> | null = null
let stateTimer: ReturnType<typeof setInterval> | null = null
let lastProgressAt = Date.now()
let dwellStartedAt = 0
let readingHelp = false
let disposed = false

const items = computed(() => props.question.readingWords ?? [])
const allComplete = computed(() => items.value.length > 0 && completedIds.value.length === items.value.length)
const activeWord = computed(() => items.value[activeIndex.value] ?? null)
const statusMessage = computed(() => {
  switch (messageState.value) {
    case 'listening': return '읽고 있어요'
    case 'retry': return '한 번 더 읽어봐요'
    case 'help': return '빛나는 낱말을 바라봐요'
    case 'complete': return '다 읽었어요!'
    case 'denied': return '마이크를 켜고 다시 눌러요'
    default: return '준비되면 시작해요'
  }
})

const normalize = (value: string) => value.replace(/[\s.,!?~'"’“”]/g, '').toLowerCase()

const matchesActiveWord = (transcript: string) => {
  const word = activeWord.value
  if (!word) return false
  const heard = normalize(transcript)
  return [word.text, ...(word.speechAliases ?? [])]
    .map(normalize)
    .some((answer) => heard === answer || heard.includes(answer))
}

const stopRecognition = () => {
  if (recognitionRestart) clearTimeout(recognitionRestart)
  recognitionRestart = null
  if (recognition && recognitionRunning) {
    recognitionRunning = false
    recognition.stop()
  }
  recognition = null
}

const scheduleRecognition = () => {
  if (disposed || !started.value || allComplete.value || readingHelp || messageState.value === 'denied') return
  if (recognitionRestart) clearTimeout(recognitionRestart)
  recognitionRestart = setTimeout(startRecognition, 220)
}

const activateAssist = () => {
  if (allComplete.value || assistIndex.value !== null) return
  assistIndex.value = activeIndex.value
  messageState.value = 'help'
  dwellStartedAt = 0
  dwellProgress.value = 0
}

const finishAllWords = () => {
  assistIndex.value = null
  messageState.value = 'complete'
  stopRecognition()
  session.markRecordingComplete({ isMock: false, audioUrl: null })
}

const acceptCurrentWord = () => {
  const word = activeWord.value
  if (!word || completedIds.value.includes(word.id)) return
  completedIds.value = [...completedIds.value, word.id]
  failureCount.value = 0
  assistIndex.value = null
  dwellStartedAt = 0
  dwellProgress.value = 0
  lastProgressAt = Date.now()
  if (completedIds.value.length === items.value.length) {
    finishAllWords()
    return
  }
  activeIndex.value += 1
  messageState.value = 'listening'
}

const rejectCurrentWord = () => {
  if (allComplete.value) return
  failureCount.value += 1
  messageState.value = 'retry'
  if (failureCount.value >= 2) activateAssist()
}

const handleTranscript = (transcript: string) => {
  if (!started.value || allComplete.value || readingHelp) return
  if (matchesActiveWord(transcript)) acceptCurrentWord()
  else rejectCurrentWord()
}

function startRecognition() {
  if (disposed || recognitionRunning || !started.value || allComplete.value || readingHelp) return
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
  if (!Recognition) return

  recognition = new Recognition()
  recognition.lang = 'ko-KR'
  recognition.interimResults = false
  recognition.continuous = false
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? ''
    handleTranscript(transcript)
  }
  recognition.onerror = (event) => {
    recognitionRunning = false
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
      messageState.value = 'denied'
      return
    }
    // 장치·네트워크 오류는 발음 실패로 세지 않는다. 실제 발화가 들어왔지만
    // 현재 낱말과 다를 때만 handleTranscript에서 실패 횟수를 올린다.
    if (event.error !== 'aborted') messageState.value = 'retry'
  }
  recognition.onend = () => {
    recognitionRunning = false
    recognition = null
    scheduleRecognition()
  }
  try {
    recognitionRunning = true
    recognition.start()
  } catch {
    recognitionRunning = false
    scheduleRecognition()
  }
}

const startReading = () => {
  if (allComplete.value) return
  stopAudio()
  started.value = true
  messageState.value = 'listening'
  lastProgressAt = Date.now()
  startRecognition()
}

const cardIndexAt = (clientX: number, clientY: number) => {
  const cards = grid.value?.querySelectorAll<HTMLElement>('.word-card')
  if (!cards) return null
  for (let index = 0; index < cards.length; index += 1) {
    const rect = cards[index]?.getBoundingClientRect()
    if (rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return index
  }
  return null
}

const updateGaze = (clientX: number, clientY: number) => {
  gazePoint.value = { x: clientX, y: clientY }
  gazeVisible.value = true
  gazeIndex.value = cardIndexAt(clientX, clientY)
}

const onPointerMove = (event: PointerEvent) => updateGaze(event.clientX, event.clientY)
const onPointerLeave = () => {
  gazeVisible.value = false
  gazeIndex.value = null
  dwellStartedAt = 0
  dwellProgress.value = 0
}
const onGaze = (event: Event) => {
  const detail = (event as CustomEvent<{ clientX: number; clientY: number }>).detail
  if (detail) updateGaze(detail.clientX, detail.clientY)
}
const onExternalSpeech = (event: Event) => {
  const detail = (event as CustomEvent<{ transcript?: string }>).detail
  if (detail?.transcript) handleTranscript(detail.transcript)
}

const readAssistedWord = async () => {
  const index = assistIndex.value
  const word = index === null ? null : items.value[index]
  if (!word || readingHelp) return
  readingHelp = true
  stopRecognition()
  messageState.value = 'help'
  await Promise.race([
    replay(word.text, 0.72),
    new Promise<void>((resolve) => setTimeout(resolve, 3200)),
  ])
  stopAudio()
  readingHelp = false
  assistIndex.value = null
  failureCount.value = 0
  dwellStartedAt = 0
  dwellProgress.value = 0
  lastProgressAt = Date.now()
  messageState.value = 'listening'
  scheduleRecognition()
}

onMounted(() => {
  window.addEventListener('iread:gaze', onGaze)
  window.addEventListener('iread:speech', onExternalSpeech)
  stateTimer = setInterval(() => {
    if (!started.value || allComplete.value || readingHelp) return
    if (assistIndex.value === null && Date.now() - lastProgressAt >= 8000) activateAssist()

    if (assistIndex.value !== null && gazeIndex.value === assistIndex.value) {
      if (!dwellStartedAt) dwellStartedAt = Date.now()
      dwellProgress.value = Math.min(1, (Date.now() - dwellStartedAt) / 1000)
      if (dwellProgress.value >= 1) void readAssistedWord()
    } else {
      dwellStartedAt = 0
      dwellProgress.value = 0
    }
  }, 50)
})

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('iread:gaze', onGaze)
  window.removeEventListener('iread:speech', onExternalSpeech)
  if (stateTimer) clearInterval(stateTimer)
  stopRecognition()
  stopAudio()
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ allComplete ? '다 읽었어요!' : question.instruction }}</h1>
      <div class="reading-status" :class="messageState" role="status" aria-live="polite">
        <span class="status-icon" aria-hidden="true">{{ allComplete ? '★' : '●' }}</span>
        {{ statusMessage }}
      </div>
    </header>

    <div ref="grid" class="word-grid" @pointermove="onPointerMove" @pointerleave="onPointerLeave">
      <article
        v-for="(word, index) in items"
        :key="word.id"
        class="word-card"
        :class="{
          active: started && index === activeIndex && !allComplete,
          gazed: gazeIndex === index,
          complete: completedIds.includes(word.id),
          assist: assistIndex === index,
        }"
      >
        <span v-if="completedIds.includes(word.id)" class="complete-mark" aria-label="읽기 완료">✓</span>
        <strong>{{ word.text }}</strong>
        <span v-if="assistIndex === index" class="assist-sweep" aria-hidden="true"></span>
      </article>
    </div>

    <Teleport to="body">
      <span
        v-if="gazeVisible"
        class="gaze-cursor"
        :class="{ dwelling: assistIndex !== null && gazeIndex === assistIndex }"
        :style="{
          left: `${gazePoint.x}px`,
          top: `${gazePoint.y}px`,
          '--dwell': `${dwellProgress * 360}deg`,
        }"
        aria-hidden="true"
      ></span>
    </Teleport>

    <footer class="action-bar">
      <button v-if="!started" class="start-button" type="button" @click="startReading">
        <span aria-hidden="true">●</span> 읽기 시작
      </button>
      <button v-else-if="messageState === 'denied'" class="start-button" type="button" @click="startReading">다시 시작</button>
      <button v-else-if="allComplete" class="next-button" type="button" @click="$emit('next')">다음</button>
    </footer>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:14px;width:100%;max-width:1060px;height:100%;min-height:0;padding:20px 28px 18px;border:4px solid rgba(255,255,255,.95);border-radius:32px;background:linear-gradient(180deg,#d9efff 0%,#f1f9ff 58%,#e8f6d7 100%);box-shadow:inset 0 0 0 2px rgba(83,138,204,.18),0 12px 28px rgba(47,88,138,.15);overflow:hidden}.activity-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:58px}.activity-heading h1{margin:0;color:#223f7d;font-family:var(--learner-font-display);font-size:clamp(28px,2.3vw,38px);font-weight:900}.reading-status{display:flex;align-items:center;gap:9px;min-height:48px;padding:0 19px;border:2px solid #d7e4ed;border-radius:999px;background:rgba(255,255,255,.9);color:#58708d;font-family:var(--learner-font-display);font-size:18px;font-weight:900;box-shadow:0 5px 12px rgba(59,90,122,.1)}.status-icon{color:#73a2e8;font-size:14px}.reading-status.retry{border-color:#f1cf91;color:#9a6b1d}.reading-status.help{border-color:#f4c94d;background:#fffbe2;color:#8c6811}.reading-status.complete{border-color:#9bd488;background:#f2ffec;color:#388452}.word-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:18px;flex:1;min-height:0;padding:8px;touch-action:none}.word-card{position:relative;display:grid;place-items:center;min-height:150px;overflow:hidden;border:5px solid #fff;border-radius:29px;background:#fffdf8;box-shadow:0 8px 18px rgba(67,92,119,.14),inset 0 0 0 2px #e7e2d2;transition:border-color .18s,transform .18s,box-shadow .18s,background .18s}.word-card strong{position:relative;z-index:2;color:#292d3a;font-family:var(--learner-font-display);font-size:clamp(48px,5vw,76px);font-weight:900;letter-spacing:.08em}.word-card.active{border-color:#6e98ef;box-shadow:0 8px 20px rgba(68,103,178,.2),0 0 0 4px rgba(109,151,238,.2)}.word-card.gazed{transform:translateY(-2px);box-shadow:0 11px 25px rgba(55,101,162,.23),0 0 0 5px rgba(86,156,230,.24)}.word-card.complete{border-color:#9ad58a;background:#f0fae9;box-shadow:0 7px 16px rgba(61,128,72,.14)}.word-card.complete strong{color:#52705a}.complete-mark{position:absolute;right:19px;top:15px;z-index:3;display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#70c363;color:#fff;font-family:var(--learner-font-display);font-size:27px;font-weight:900}.word-card.assist{border-color:#ffc83d;animation:assist-pulse .9s ease-in-out infinite}.assist-sweep{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(255,220,81,.55),rgba(255,244,174,.25),transparent 72%);transform-origin:left center;animation:sweep 1.2s ease-in-out infinite}.gaze-cursor{--dwell:0deg;position:fixed;z-index:50;width:70px;height:70px;border:5px solid rgba(47,126,204,.45);border-radius:50%;background:rgba(106,194,255,.16);box-shadow:0 0 0 4px rgba(255,255,255,.52),0 7px 18px rgba(42,90,139,.18);transform:translate(-50%,-50%);pointer-events:none}.gaze-cursor.dwelling::after{content:"";position:absolute;inset:-9px;border-radius:50%;background:conic-gradient(#ffc72f var(--dwell),transparent 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 0);mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 0)}.action-bar{display:flex;align-items:center;justify-content:center;min-height:62px}.start-button,.next-button{display:flex;align-items:center;justify-content:center;gap:11px;min-width:210px;min-height:60px;border:0;border-radius:21px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer}.start-button{background:linear-gradient(180deg,#7194f2,#4f72df);box-shadow:0 8px 18px rgba(50,81,155,.25)}.start-button span{display:grid;place-items:center;width:34px;height:34px;border:3px solid rgba(255,255,255,.82);border-radius:50%;font-size:14px}.next-button{background:linear-gradient(180deg,#ffc75a,#f2a92f);box-shadow:0 8px 18px rgba(150,96,16,.22)}.start-button:focus-visible,.next-button:focus-visible{outline:5px solid #ffd64c;outline-offset:3px}@keyframes assist-pulse{50%{box-shadow:0 8px 23px rgba(217,155,17,.24),0 0 0 7px rgba(255,214,69,.32)}}@keyframes sweep{0%,100%{transform:scaleX(.28);opacity:.55}50%{transform:scaleX(1);opacity:1}}@media(max-height:800px){.activity{padding:12px 22px 10px}.activity-heading{min-height:45px}.activity-heading h1{font-size:28px}.reading-status{min-height:42px;font-size:16px}.word-grid{gap:12px;padding:3px}.word-card{min-height:120px}.word-card strong{font-size:50px}.action-bar{min-height:52px}.start-button,.next-button{min-height:52px}}@media(max-width:760px){.activity{padding:14px}.activity-heading{align-items:flex-start;flex-direction:column;gap:8px}.word-grid{gap:10px}.word-card strong{font-size:42px}.reading-status{align-self:flex-end}}@media(prefers-reduced-motion:reduce){.word-card,.word-card.assist,.assist-sweep{transition:none;animation:none}}
</style>
