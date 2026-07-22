<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ReadingSentence, TrainingQuestion } from '@/types/training'
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
type MessageState = 'ready' | 'listening' | 'retry' | 'help' | 'pause' | 'complete' | 'denied'

const session = useTrainingSession()
const { replay, stop: stopAudio } = useAudioPlayer()
const sentenceStage = ref<HTMLElement | null>(null)
const started = ref(false)
const activeIndex = ref(0)
const completedCount = ref(0)
const failureCount = ref(0)
const assistIndex = ref<number | null>(null)
const gazeIndex = ref<number | null>(null)
const gazePoint = ref({ x: 0, y: 0 })
const gazeVisible = ref(false)
const dwellProgress = ref(0)
const messageState = ref<MessageState>('ready')
const betweenSentences = ref(false)

let recognition: SpeechRecognitionLike | null = null
let recognitionRunning = false
let recognitionRestart: ReturnType<typeof setTimeout> | null = null
let stateTimer: ReturnType<typeof setInterval> | null = null
let sentenceAdvanceTimer: ReturnType<typeof setTimeout> | null = null
let lastProgressAt = Date.now()
let dwellStartedAt = 0
let readingHelp = false
let disposed = false

const sentences = computed<ReadingSentence[]>(() => {
  if (props.question.readingSentences?.length) return props.question.readingSentences
  return [{ id: `${props.question.id}-line`, chunks: props.question.phraseChunks ?? [] }]
})
const entries = computed(() => sentences.value.flatMap((sentence, sentenceIndex) =>
  sentence.chunks.map((text, localIndex) => ({ text, sentenceIndex, localIndex })),
))
const chunks = computed(() => entries.value.map((entry) => entry.text))
const sentenceRanges = computed(() => {
  let cursor = 0
  return sentences.value.map((sentence) => {
    const start = cursor
    cursor += sentence.chunks.length
    return { start, end: cursor }
  })
})
const activeSentenceIndex = computed(() =>
  sentenceRanges.value.findIndex((range) => activeIndex.value >= range.start && activeIndex.value < range.end),
)
const allComplete = computed(() => chunks.value.length > 0 && completedCount.value >= chunks.value.length)
const statusMessage = computed(() => {
  switch (messageState.value) {
    case 'listening': return '읽고 있어요'
    case 'retry': return '한 번 더 읽어봐요'
    case 'help': return '빛나는 말을 바라봐요'
    case 'pause': return '다음 문장을 읽어요'
    case 'complete': return '다 읽었어요!'
    case 'denied': return '마이크를 켜고 다시 눌러요'
    default: return '준비되면 시작해요'
  }
})

const normalize = (value: string) => value.replace(/[\s.,!?~'"’“”]/g, '').toLowerCase()

const consecutiveMatches = (transcript: string) => {
  const heard = normalize(transcript)
  let searchFrom = 0
  let count = 0
  const currentRange = sentenceRanges.value[activeSentenceIndex.value]
  const sentenceEnd = currentRange?.end ?? chunks.value.length
  for (let index = activeIndex.value; index < sentenceEnd; index += 1) {
    const target = normalize(chunks.value[index] ?? '')
    const foundAt = target ? heard.indexOf(target, searchFrom) : -1
    if (foundAt < 0) break
    count += 1
    searchFrom = foundAt + target.length
  }
  return count
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
  if (disposed || !started.value || allComplete.value || readingHelp || betweenSentences.value || messageState.value === 'denied') return
  if (recognitionRestart) clearTimeout(recognitionRestart)
  recognitionRestart = setTimeout(startRecognition, 220)
}

const activateAssist = () => {
  if (allComplete.value || betweenSentences.value || assistIndex.value !== null) return
  assistIndex.value = activeIndex.value
  messageState.value = 'help'
  dwellStartedAt = 0
  dwellProgress.value = 0
}

const finishSentence = () => {
  assistIndex.value = null
  messageState.value = 'complete'
  stopRecognition()
  session.markRecordingComplete({ isMock: false, audioUrl: null })
}

const acceptChunks = (count: number) => {
  if (count <= 0 || allComplete.value) return
  const nextCount = Math.min(chunks.value.length, completedCount.value + count)
  completedCount.value = nextCount
  failureCount.value = 0
  assistIndex.value = null
  dwellStartedAt = 0
  dwellProgress.value = 0
  lastProgressAt = Date.now()
  if (nextCount >= chunks.value.length) {
    activeIndex.value = Math.max(0, chunks.value.length - 1)
    finishSentence()
    return
  }

  const currentRange = sentenceRanges.value[activeSentenceIndex.value]
  if (currentRange && nextCount >= currentRange.end) {
    betweenSentences.value = true
    messageState.value = 'pause'
    stopRecognition()
    sentenceAdvanceTimer = setTimeout(() => {
      betweenSentences.value = false
      activeIndex.value = nextCount
      lastProgressAt = Date.now()
      messageState.value = 'listening'
      scheduleRecognition()
    }, 1000)
  } else {
    activeIndex.value = nextCount
    messageState.value = 'listening'
  }
}

const rejectChunk = () => {
  if (allComplete.value) return
  failureCount.value += 1
  messageState.value = 'retry'
  if (failureCount.value >= 2) activateAssist()
}

const handleTranscript = (transcript: string) => {
  if (!started.value || allComplete.value || readingHelp || betweenSentences.value) return
  const matched = consecutiveMatches(transcript)
  if (matched > 0) acceptChunks(matched)
  else rejectChunk()
}

function startRecognition() {
  if (disposed || recognitionRunning || !started.value || allComplete.value || readingHelp || betweenSentences.value) return
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
  recognition.onresult = (event) => handleTranscript(event.results[0]?.[0]?.transcript ?? '')
  recognition.onerror = (event) => {
    recognitionRunning = false
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
      messageState.value = 'denied'
      return
    }
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

const chunkIndexAt = (clientX: number, clientY: number) => {
  const elements = sentenceStage.value?.querySelectorAll<HTMLElement>('.sentence-chunk')
  if (!elements) return null
  for (let index = 0; index < elements.length; index += 1) {
    const rect = elements[index]?.getBoundingClientRect()
    if (rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return index
  }
  return null
}

const globalChunkIndex = (sentenceIndex: number, localIndex: number) =>
  (sentenceRanges.value[sentenceIndex]?.start ?? 0) + localIndex

const isSentenceComplete = (sentenceIndex: number) => {
  const range = sentenceRanges.value[sentenceIndex]
  return Boolean(range && completedCount.value >= range.end)
}

const updateGaze = (clientX: number, clientY: number) => {
  gazePoint.value = { x: clientX, y: clientY }
  gazeVisible.value = true
  gazeIndex.value = chunkIndexAt(clientX, clientY)
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

const readAssistedChunk = async () => {
  const index = assistIndex.value
  const chunk = index === null ? null : chunks.value[index]
  if (!chunk || readingHelp) return
  readingHelp = true
  stopRecognition()
  messageState.value = 'help'
  await Promise.race([
    replay(chunk, 0.74),
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
    if (!started.value || allComplete.value || readingHelp || betweenSentences.value) return
    if (assistIndex.value === null && Date.now() - lastProgressAt >= 8000) activateAssist()
    if (assistIndex.value !== null && gazeIndex.value === assistIndex.value) {
      if (!dwellStartedAt) dwellStartedAt = Date.now()
      dwellProgress.value = Math.min(1, (Date.now() - dwellStartedAt) / 1000)
      if (dwellProgress.value >= 1) void readAssistedChunk()
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
  if (sentenceAdvanceTimer) clearTimeout(sentenceAdvanceTimer)
  stopRecognition()
  stopAudio()
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ allComplete ? '다 읽었어요!' : question.instruction }}</h1>
      <div class="reading-status" :class="messageState" role="status" aria-live="polite">
        <span aria-hidden="true">{{ allComplete ? '★' : '●' }}</span>
        {{ statusMessage }}
      </div>
    </header>

    <div
      ref="sentenceStage"
      class="sentence-stage"
      :class="{ multi: sentences.length > 1 }"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <div class="passage" aria-label="읽을 글">
        <p
          v-for="(sentence, sentenceIndex) in sentences"
          :key="sentence.id"
          class="sentence-row"
          :class="{ 'row-complete': isSentenceComplete(sentenceIndex) }"
        >
          <span
            v-for="(chunk, localIndex) in sentence.chunks"
            :key="`${sentence.id}-${localIndex}`"
            class="sentence-chunk"
            :class="{
              active: started && globalChunkIndex(sentenceIndex, localIndex) === activeIndex && !allComplete && !betweenSentences,
              gazed: gazeIndex === globalChunkIndex(sentenceIndex, localIndex),
              complete: globalChunkIndex(sentenceIndex, localIndex) < completedCount,
              assist: assistIndex === globalChunkIndex(sentenceIndex, localIndex),
            }"
          >
            <span class="chunk-text">{{ chunk }}</span>
            <span v-if="assistIndex === globalChunkIndex(sentenceIndex, localIndex)" class="assist-sweep" aria-hidden="true"></span>
            <span v-if="globalChunkIndex(sentenceIndex, localIndex) < completedCount" class="read-mark" aria-hidden="true">●</span>
          </span>
        </p>
      </div>
    </div>

    <Teleport to="body">
      <span
        v-if="gazeVisible"
        class="gaze-cursor"
        :class="{ dwelling: assistIndex !== null && gazeIndex === assistIndex }"
        :style="{ left: `${gazePoint.x}px`, top: `${gazePoint.y}px`, '--dwell': `${dwellProgress * 360}deg` }"
        aria-hidden="true"
      ></span>
    </Teleport>

    <footer class="action-bar">
      <button v-if="!started" class="start-button" type="button" @click="startReading"><span aria-hidden="true">●</span> 읽기 시작</button>
      <button v-else-if="messageState === 'denied'" class="start-button" type="button" @click="startReading">다시 시작</button>
      <button v-else-if="allComplete" class="next-button" type="button" @click="$emit('next')">다음</button>
    </footer>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1120px;height:100%;min-height:0;padding:22px 30px 20px;border:4px solid rgba(255,255,255,.95);border-radius:32px;background:linear-gradient(180deg,#d9efff 0%,#eff8ff 58%,#e8f6d7 100%);box-shadow:inset 0 0 0 2px rgba(83,138,204,.18),0 12px 28px rgba(47,88,138,.15);overflow:hidden}.activity-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:58px}.activity-heading h1{margin:0;color:#223f7d;font-family:var(--learner-font-display);font-size:clamp(28px,2.3vw,38px);font-weight:900}.reading-status{display:flex;align-items:center;gap:9px;min-height:48px;padding:0 19px;border:2px solid #d7e4ed;border-radius:999px;background:rgba(255,255,255,.9);color:#58708d;font-family:var(--learner-font-display);font-size:18px;font-weight:900;box-shadow:0 5px 12px rgba(59,90,122,.1)}.reading-status span{color:#73a2e8;font-size:14px}.reading-status.retry{border-color:#f1cf91;color:#9a6b1d}.reading-status.help{border-color:#f4c94d;background:#fffbe2;color:#8c6811}.reading-status.complete{border-color:#9bd488;background:#f2ffec;color:#388452}.sentence-stage{display:grid;place-items:center;flex:1;min-height:0;padding:clamp(28px,5vh,64px);border:5px solid #fff;border-radius:31px;background:linear-gradient(145deg,#fffdf5,#fff9e8);box-shadow:inset 0 0 0 2px #e9dfbd,0 10px 24px rgba(70,91,112,.13);touch-action:none}.sentence{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:20px 14px;margin:0;max-width:1000px}.sentence-chunk{position:relative;display:inline-flex;align-items:center;justify-content:center;min-height:110px;padding:12px 22px 16px;overflow:hidden;border:5px solid transparent;border-radius:24px;background:rgba(255,255,255,.34);transition:border-color .18s,background .18s,box-shadow .18s,transform .18s}.chunk-text{position:relative;z-index:2;color:#292d3a;font-family:var(--learner-font-display);font-size:clamp(44px,4.5vw,69px);font-weight:900;letter-spacing:.025em;white-space:nowrap}.sentence-chunk.active{border-color:#6e98ef;background:#fff;box-shadow:0 7px 18px rgba(68,103,178,.18),0 0 0 4px rgba(109,151,238,.18)}.sentence-chunk.gazed{transform:translateY(-2px);box-shadow:0 10px 23px rgba(55,101,162,.22),0 0 0 5px rgba(86,156,230,.22)}.sentence-chunk.complete{background:#edf8e8}.sentence-chunk.complete .chunk-text{color:#51715a}.read-mark{position:absolute;z-index:3;bottom:7px;color:#6ec462;font-size:12px}.sentence-chunk.assist{border-color:#ffc83d;animation:assist-pulse .9s ease-in-out infinite}.assist-sweep{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(255,220,81,.58),rgba(255,244,174,.28),transparent 74%);transform-origin:left center;animation:sweep 1.2s ease-in-out infinite}.gaze-cursor{--dwell:0deg;position:fixed;z-index:50;width:70px;height:70px;border:5px solid rgba(47,126,204,.45);border-radius:50%;background:rgba(106,194,255,.16);box-shadow:0 0 0 4px rgba(255,255,255,.52),0 7px 18px rgba(42,90,139,.18);transform:translate(-50%,-50%);pointer-events:none}.gaze-cursor.dwelling::after{content:"";position:absolute;inset:-9px;border-radius:50%;background:conic-gradient(#ffc72f var(--dwell),transparent 0);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 0);mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 0)}.action-bar{display:flex;align-items:center;justify-content:center;min-height:62px}.start-button,.next-button{display:flex;align-items:center;justify-content:center;gap:11px;min-width:210px;min-height:60px;border:0;border-radius:21px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer}.start-button{background:linear-gradient(180deg,#7194f2,#4f72df);box-shadow:0 8px 18px rgba(50,81,155,.25)}.start-button span{display:grid;place-items:center;width:34px;height:34px;border:3px solid rgba(255,255,255,.82);border-radius:50%;font-size:14px}.next-button{background:linear-gradient(180deg,#ffc75a,#f2a92f);box-shadow:0 8px 18px rgba(150,96,16,.22)}.start-button:focus-visible,.next-button:focus-visible{outline:5px solid #ffd64c;outline-offset:3px}@keyframes assist-pulse{50%{box-shadow:0 8px 23px rgba(217,155,17,.24),0 0 0 7px rgba(255,214,69,.32)}}@keyframes sweep{0%,100%{transform:scaleX(.28);opacity:.55}50%{transform:scaleX(1);opacity:1}}@media(max-height:800px){.activity{gap:10px;padding:13px 22px 11px}.activity-heading{min-height:45px}.activity-heading h1{font-size:28px}.reading-status{min-height:42px;font-size:16px}.sentence-stage{padding:24px}.sentence-chunk{min-height:90px;padding:8px 17px 12px}.chunk-text{font-size:48px}.action-bar{min-height:52px}.start-button,.next-button{min-height:52px}}@media(max-width:780px){.activity{padding:14px}.activity-heading{align-items:flex-start;flex-direction:column;gap:8px}.sentence-stage{padding:20px}.sentence{gap:12px 8px}.sentence-chunk{min-height:78px;padding-inline:13px}.chunk-text{font-size:38px}.reading-status{align-self:flex-end}}@media(prefers-reduced-motion:reduce){.sentence-chunk,.sentence-chunk.assist,.assist-sweep{transition:none;animation:none}}
.reading-status.pause{border-color:#b8d1ee;color:#537ca9}
.passage{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;width:100%;max-width:1000px}
.sentence-row{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:20px 14px;margin:0;transition:opacity .35s}
.sentence-row.row-complete{opacity:.38}
.sentence-stage.multi{padding:22px}
.multi .passage{gap:10px}
.multi .sentence-row{gap:8px}
.multi .sentence-chunk{min-height:82px;padding:7px 14px 11px;border-width:4px;border-radius:19px}
.multi .chunk-text{font-size:clamp(32px,3.3vw,49px)}
@media(max-height:800px){.multi .sentence-chunk{min-height:68px;padding:4px 11px 8px}.multi .chunk-text{font-size:34px}}
@media(max-width:780px){.sentence-row{gap:12px 8px}}
@media(prefers-reduced-motion:reduce){.sentence-row{transition:none}}
</style>
