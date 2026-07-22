<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { TracePoint, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { replay, isPlaying } = useAudioPlayer()
const stage = ref<SVGSVGElement | null>(null)
const progress = ref(0)
const cursor = ref({ x: 0, y: 0 })
const cursorVisible = ref(false)
const stalled = ref(false)
const speechState = ref<'waiting' | 'listening' | 'retry' | 'success'>('waiting')
const speechMessage = ref('')
let lastAdvanceAt = 0
let stallTimer: ReturnType<typeof setInterval> | null = null
let recognition: SpeechRecognitionLike | null = null
let fallbackTimer: ReturnType<typeof setTimeout> | null = null

interface SpeechRecognitionResultEventLike extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionErrorEventLike extends Event { error?: string }

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const strokes = computed(() => props.question.traceStrokes ?? [])
const flatPoints = computed(() => strokes.value.flat())
const totalPoints = computed(() => flatPoints.value.length)
const traceCompleted = computed(() => totalPoints.value > 0 && progress.value >= totalPoints.value)
const currentPoint = computed<TracePoint | null>(() => flatPoints.value[progress.value] ?? null)

const pointString = (points: TracePoint[]) => points.map((point) => `${point.x},${point.y}`).join(' ')

const completedStroke = (strokeIndex: number): TracePoint[] => {
  const before = strokes.value.slice(0, strokeIndex).reduce((sum, stroke) => sum + stroke.length, 0)
  const count = Math.min(Math.max(progress.value - before, 0), strokes.value[strokeIndex]?.length ?? 0)
  return strokes.value[strokeIndex]?.slice(0, count) ?? []
}

const normalizeSpeech = (value: string) => value.replace(/[\s.,!?]/g, '').toLowerCase()

const finishSpeech = (isMock: boolean) => {
  if (speechState.value === 'success') return
  speechState.value = 'success'
  speechMessage.value = '목소리를 잘 들었어요!'
  session.markRecordingComplete({ isMock, audioUrl: null })
}

const speechMatches = (transcript: string) => {
  const heard = normalizeSpeech(transcript)
  const accepted = [props.question.traceGlyph ?? '', ...(props.question.speechAliases ?? [])]
    .map(normalizeSpeech)
    .filter(Boolean)
  return accepted.some((answer) => heard === answer || heard.includes(answer))
}

const startSpeech = () => {
  if (!traceCompleted.value || speechState.value === 'listening' || speechState.value === 'success') return
  speechState.value = 'listening'
  speechMessage.value = '말해 보세요!'

  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition

  if (!Recognition) {
    fallbackTimer = setTimeout(() => finishSpeech(true), 1200)
    return
  }

  recognition = new Recognition()
  recognition.lang = 'ko-KR'
  recognition.interimResults = false
  recognition.continuous = false
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript ?? ''
    if (speechMatches(transcript)) finishSpeech(false)
    else {
      speechState.value = 'retry'
      speechMessage.value = `${props.question.traceGlyph} 소리를 다시 말해봐요.`
    }
  }
  recognition.onerror = () => {
    speechState.value = 'retry'
    speechMessage.value = '마이크를 켜고 다시 말해봐요.'
  }
  recognition.onend = () => {
    if (speechState.value === 'listening') {
      speechState.value = 'retry'
      speechMessage.value = '한 번 더 또박또박 말해봐요.'
    }
    recognition = null
  }
  recognition.start()
}

const speakGlyph = () => {
  const glyph = props.question.traceGlyph ?? props.question.targetText
  if (glyph && !isPlaying.value) void replay(glyph, 0.68)
}

const announceRepeat = async () => {
  const glyph = props.question.traceGlyph ?? ''
  await replay(`따라 해봐. ${glyph}`, 0.72)
}

const advanceFromClientPoint = (clientX: number, clientY: number) => {
  const svg = stage.value
  const target = currentPoint.value
  if (!svg || !target || traceCompleted.value) return
  const rect = svg.getBoundingClientRect()
  const x = ((clientX - rect.left) / rect.width) * 640
  const y = ((clientY - rect.top) / rect.height) * 500
  cursor.value = { x, y }
  cursorVisible.value = x >= 0 && x <= 640 && y >= 0 && y <= 500

  const distance = Math.hypot(x - target.x, y - target.y)
  if (distance <= 46) {
    progress.value += 1
    lastAdvanceAt = Date.now()
    stalled.value = false
  }
}

const onPointerMove = (event: PointerEvent) => advanceFromClientPoint(event.clientX, event.clientY)
const onPointerLeave = () => { cursorVisible.value = false }
const onGaze = (event: Event) => {
  const detail = (event as CustomEvent<{ clientX: number; clientY: number }>).detail
  if (detail) advanceFromClientPoint(detail.clientX, detail.clientY)
}

const resetQuestion = () => {
  progress.value = 0
  cursorVisible.value = false
  stalled.value = false
  speechState.value = 'waiting'
  speechMessage.value = ''
  lastAdvanceAt = 0
  recognition?.stop()
  recognition = null
  if (fallbackTimer) clearTimeout(fallbackTimer)
  fallbackTimer = null
  void nextTick(speakGlyph)
}

watch(() => props.question.id, resetQuestion, { immediate: true })
watch(traceCompleted, (completed, wasCompleted) => {
  if (completed && !wasCompleted) void announceRepeat()
})

onMounted(() => {
  window.addEventListener('iread:gaze', onGaze)
  stallTimer = setInterval(() => {
    if (progress.value > 0 && !traceCompleted.value && lastAdvanceAt && Date.now() - lastAdvanceAt >= 3000) {
      stalled.value = true
    }
  }, 250)
})

onBeforeUnmount(() => {
  window.removeEventListener('iread:gaze', onGaze)
  if (stallTimer) clearInterval(stallTimer)
  if (fallbackTimer) clearTimeout(fallbackTimer)
  recognition?.stop()
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading">
      <h1>{{ traceCompleted ? `${question.traceGlyph} 완성!` : question.instruction }}</h1>
      <button class="sound-button" type="button" :disabled="isPlaying" :aria-label="`${question.traceGlyph} 소리 듣기`" @click="speakGlyph">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 12h6l8-6v20l-8-6H7z" fill="currentColor"/><path d="M24 11c3 3 3 7 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        {{ question.traceGlyph }} 소리
      </button>
    </header>

    <div class="trace-layout">
      <div class="trace-stage" :class="{ complete: traceCompleted }">
        <svg
          ref="stage"
          class="trace-svg"
          viewBox="0 0 640 500"
          role="img"
          :aria-label="`${question.traceGlyph} 획순 따라 보기`"
          @pointermove="onPointerMove"
          @pointerleave="onPointerLeave"
        >
          <g v-for="(stroke, strokeIndex) in strokes" :key="`base-${strokeIndex}`">
            <polyline class="stroke-outline" :points="pointString(stroke)" />
            <polyline class="stroke-guide" :points="pointString(stroke)" />
            <polyline v-if="completedStroke(strokeIndex).length > 1" class="stroke-filled" :points="pointString(completedStroke(strokeIndex))" />
          </g>
          <circle v-if="currentPoint" class="resume-point" :class="{ stalled }" :cx="currentPoint.x" :cy="currentPoint.y" r="21" />
          <circle v-if="traceCompleted" class="complete-ring" cx="320" cy="250" r="205" />
        </svg>
        <span
          v-if="cursorVisible"
          class="gaze-cursor"
          :style="{ left: `${(cursor.x / 640) * 100}%`, top: `${(cursor.y / 500) * 100}%` }"
          aria-hidden="true"
        />
        <p v-if="stalled" class="resume-message" role="status">반짝이는 곳부터 다시 봐요!</p>
      </div>

      <aside class="speech-panel" :class="{ active: traceCompleted }">
        <template v-if="!traceCompleted">
          <span class="eye-icon" aria-hidden="true">◉</span>
          <strong>점선을 따라 봐요</strong>
        </template>
        <template v-else>
          <span class="speech-glyph" aria-hidden="true">{{ question.traceGlyph }}</span>
          <strong>따라 말해봐요</strong>
          <button v-if="speechState !== 'success'" class="mic-button" type="button" :disabled="speechState === 'listening'" @click="startSpeech">
            <span aria-hidden="true">●</span>
            {{ speechState === 'listening' ? '듣고 있어요' : '말하기' }}
          </button>
          <p v-if="speechMessage" class="speech-message" role="status">{{ speechMessage }}</p>
        </template>
      </aside>
    </div>

    <div class="action-bar">
      <button v-if="speechState === 'success'" class="next-button" type="button" @click="$emit('next')">다음 문제</button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:14px;width:100%;max-width:1180px;height:100%;min-height:0;padding:18px 22px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff,#eff8ff 60%,#e7f4d5);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity-heading{display:flex;align-items:center;justify-content:center;gap:20px}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(27px,2.3vw,37px);font-weight:900}.sound-button{display:flex;align-items:center;gap:8px;min-height:50px;padding:0 18px;border:2px solid #ead99e;border-radius:999px;background:#fffdf6;color:#456dd7;font-family:var(--learner-font-display);font-size:18px;font-weight:900;box-shadow:0 5px 12px rgba(61,86,122,.12);cursor:pointer}.sound-button svg{width:27px;height:27px}.sound-button:disabled{opacity:.65}.trace-layout{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:20px;flex:1;min-height:0}.trace-stage{position:relative;display:grid;place-items:center;min-height:0;overflow:hidden;border:4px solid rgba(255,255,255,.95);border-radius:28px;background:linear-gradient(155deg,#87bdf2,#6897e5);box-shadow:inset 0 6px 18px rgba(45,81,143,.16);touch-action:none}.trace-stage.complete{background:linear-gradient(155deg,#9bd5ec,#8fd29a)}.trace-svg{width:100%;height:100%;min-height:350px}.stroke-outline,.stroke-guide,.stroke-filled{fill:none;stroke-linecap:round;stroke-linejoin:round}.stroke-outline{stroke:#fff;stroke-width:42}.stroke-guide{stroke:#9db2d0;stroke-width:11;stroke-dasharray:2 22}.stroke-filled{stroke:#ffd84f;stroke-width:18;filter:drop-shadow(0 4px 3px rgba(80,95,130,.2))}.resume-point{fill:#fff6ac;stroke:#ffcc32;stroke-width:7}.resume-point.stalled{animation:resume-pulse .8s ease-in-out infinite}.complete-ring{fill:none;stroke:rgba(255,255,255,.48);stroke-width:7;stroke-dasharray:8 18;animation:spin 10s linear infinite}.gaze-cursor{position:absolute;width:62px;height:62px;border:5px solid rgba(255,255,255,.62);border-radius:50%;background:rgba(91,191,255,.28);box-shadow:0 0 0 4px rgba(29,108,185,.24),0 6px 18px rgba(29,91,145,.22);transform:translate(-50%,-50%);pointer-events:none;transition:left .045s linear,top .045s linear}.resume-message{position:absolute;bottom:14px;margin:0;padding:10px 18px;border-radius:999px;background:rgba(31,62,110,.88);color:#fff;font-family:var(--learner-font-display);font-size:17px;font-weight:900}.speech-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:22px;border:3px solid rgba(255,255,255,.94);border-radius:27px;background:rgba(255,253,244,.9);color:#6d7f98;text-align:center;box-shadow:0 6px 16px rgba(62,91,120,.1)}.speech-panel.active{color:#263853}.eye-icon{display:grid;place-items:center;width:90px;height:90px;border:8px solid #8fb0eb;border-radius:50%;background:#d8efff;color:#426fc4;font-size:58px;line-height:1}.speech-panel strong{font-family:var(--learner-font-display);font-size:23px;font-weight:900}.speech-glyph{display:grid;place-items:center;width:125px;height:125px;border:5px solid #fff;border-radius:30px;background:linear-gradient(145deg,#ffda65,#f4ae38);color:#fff;font-family:var(--learner-font-display);font-size:64px;font-weight:900;box-shadow:0 10px 22px rgba(174,121,29,.24)}.mic-button{display:flex;align-items:center;justify-content:center;gap:10px;min-width:175px;min-height:60px;border:0;border-radius:999px;background:linear-gradient(180deg,#7797f5,#4f72e1);color:#fff;font-family:var(--learner-font-display);font-size:20px;font-weight:900;box-shadow:0 7px 16px rgba(49,80,150,.24);cursor:pointer}.mic-button span{display:grid;place-items:center;width:33px;height:33px;border:3px solid rgba(255,255,255,.8);border-radius:50%;color:#fff;font-size:15px}.mic-button:disabled{opacity:.65}.speech-message{margin:0;color:#42617d;font-weight:800;line-height:1.35}.action-bar{display:flex;justify-content:flex-end;min-height:56px}.next-button{min-width:190px;min-height:56px;border:0;border-radius:20px;background:linear-gradient(180deg,#ffc657,#f2a92e);color:#fff;font-family:var(--learner-font-display);font-size:21px;font-weight:900;box-shadow:0 7px 16px rgba(145,93,17,.24);cursor:pointer}.sound-button:focus-visible,.mic-button:focus-visible,.next-button:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}@keyframes resume-pulse{50%{r:31;fill:#fff;stroke:#ffec7b;filter:drop-shadow(0 0 12px #fff27a)}}@keyframes spin{to{transform:rotate(360deg);transform-origin:320px 250px}}@media(max-width:820px){.trace-layout{grid-template-columns:1fr 220px}.speech-panel{padding:14px}.speech-glyph{width:95px;height:95px;font-size:52px}}@media(max-height:800px){.activity{gap:9px;padding:12px 18px}.activity-heading h1{font-size:27px}.trace-layout{grid-template-columns:minmax(0,1fr) 245px;gap:14px}.trace-svg{min-height:300px}.speech-panel{gap:10px;padding:13px}.speech-glyph{width:92px;height:92px;font-size:50px}.eye-icon{width:72px;height:72px;font-size:46px}.mic-button{min-height:52px}.action-bar{min-height:48px}.next-button{min-height:48px}}@media(prefers-reduced-motion:reduce){.resume-point.stalled,.complete-ring{animation:none}.gaze-cursor{transition:none}}
</style>
