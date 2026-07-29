<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import storyChoiceScene from '../../assets/story/story-choice-turtle-crossroads.png'
import { getStoryDetail } from '@/services/learnerDataRepository'
import PageBackButton from '@/components/common/PageBackButton.vue'

interface StoryPage { lines: string[]; image: string; imagePosition?: string }
interface Story { title: string; character: string; question: string; pages: StoryPage[] }

interface SpeechRecognitionResultLike { 0?: { transcript?: string } }
interface SpeechRecognitionEventLike { results?: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionErrorLike { error: string }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const route = useRoute()
const router = useRouter()
const storyId = computed(() => String(route.params.storyId ?? 'alice'))
const story = computed<Story>(() => {
  const detail = getStoryDetail(storyId.value)
  return {
    title: detail.title,
    character: detail.character,
    question: detail.branchQuestion,
    pages: detail.pages.map((page) => ({
      image: page.imageUrl,
      imagePosition: page.imagePosition,
      lines: page.lines,
    })),
  }
})
const storageKey = computed(() => `iread-story-page:${storyId.value}`)
const generatedStorageKey = computed(() => `iread-story-generated:${storyId.value}`)

function loadGeneratedPages(): StoryPage[] {
  if (route.query.continue !== '1') return []
  try {
    const saved = JSON.parse(window.localStorage.getItem(generatedStorageKey.value) ?? '[]') as Array<{ lines?: unknown; imagePosition?: unknown }>
    return saved
      .filter((item) => Array.isArray(item.lines) && item.lines.every((line) => typeof line === 'string'))
      .map((item) => ({ lines: item.lines as string[], image: story.value.pages.at(-1)!.image, imagePosition: typeof item.imagePosition === 'string' ? item.imagePosition : story.value.pages.at(-1)?.imagePosition }))
  } catch {
    return []
  }
}

function initialPage() {
  if (route.query.continue !== '1') return 0
  const saved = Number(window.localStorage.getItem(storageKey.value) ?? 0)
  return Number.isInteger(saved) ? Math.min(Math.max(saved, 0), allPages.value.length - 1) : 0
}

const currentPage = ref(0)
const generatedPages = ref<StoryPage[]>([])
const screen = ref<'reading' | 'question' | 'generating'>('reading')
const readThrough = ref(-1)
const gaze = ref({ x: 0, y: 0, visible: false })
const showReturnCue = ref(false)
const textPanel = ref<HTMLElement | null>(null)
const dwellTargetIndex = ref<number | null>(null)
const dwellDurationMs = ref(100)
const transcript = ref('')
const isListening = ref(false)
const speechError = ref(false)
let leaveTimer: number | undefined
let dwellTimer: number | undefined
let generationTimer: number | undefined
let silenceRetryTimer: number | undefined
let recognition: SpeechRecognitionLike | null = null

const allPages = computed(() => [...story.value.pages, ...generatedPages.value])
const page = computed<StoryPage>(() => allPages.value[currentPage.value] ?? story.value.pages[0]!)
const pageWords = computed(() => page.value.lines.flatMap((line, lineIndex) => line.split(' ').map((word) => ({ word, lineIndex }))))
const isLastPage = computed(() => currentPage.value === allPages.value.length - 1)
const isPageRead = computed(() => readThrough.value >= pageWords.value.length - 1)
function getSpeechRecognitionConstructor() {
  const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function setMicrophoneState(active: boolean, available?: boolean) {
  window.dispatchEvent(new CustomEvent('iread:microphone-state', {
    detail: { active, ...(typeof available === 'boolean' ? { available } : {}) },
  }))
}

function clearLeaveTimer() {
  if (leaveTimer !== undefined) window.clearTimeout(leaveTimer)
  leaveTimer = undefined
}

function clearDwell() {
  if (dwellTimer !== undefined) window.clearTimeout(dwellTimer)
  dwellTimer = undefined
  dwellTargetIndex.value = null
}

function getDwellDuration(word: string) {
  const readableCharacterCount = Array.from(word).filter((character) => /[\p{L}\p{N}]/u.test(character)).length
  return Math.max(readableCharacterCount, 1) * 100
}

function beginDwell(index: number) {
  if (index <= readThrough.value) {
    clearDwell()
    return
  }
  if (dwellTargetIndex.value === index) return

  clearDwell()
  dwellTargetIndex.value = index
  dwellDurationMs.value = getDwellDuration(pageWords.value[index]?.word ?? '')
  dwellTimer = window.setTimeout(() => {
    if (dwellTargetIndex.value !== index) return
    setProgress(index)
  }, dwellDurationMs.value)
}

function scheduleReturnCue() {
  clearLeaveTimer()
  if (readThrough.value >= pageWords.value.length - 1) return
  leaveTimer = window.setTimeout(() => { showReturnCue.value = true }, 3000)
}

function setProgress(index: number) {
  if (index > readThrough.value) readThrough.value = index
  clearDwell()
  showReturnCue.value = false
  clearLeaveTimer()
}

function updateGaze(clientX: number, clientY: number) {
  if (screen.value !== 'reading') return
  const panel = textPanel.value
  if (!panel) return
  const panelRect = panel.getBoundingClientRect()
  gaze.value = { x: clientX - panelRect.left, y: clientY - panelRect.top, visible: clientX >= panelRect.left && clientX <= panelRect.right && clientY >= panelRect.top && clientY <= panelRect.bottom }
  if (!gaze.value.visible) { clearDwell(); scheduleReturnCue(); return }
  const target = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-word-index]')
  if (target && panel.contains(target)) beginDwell(Number(target.dataset.wordIndex))
  else clearDwell()
}

function onPointerMove(event: PointerEvent) { updateGaze(event.clientX, event.clientY) }
function onPointerLeave() { gaze.value.visible = false; clearDwell(); scheduleReturnCue() }
function onExternalGaze(event: Event) {
  const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail
  if (typeof detail?.x === 'number' && typeof detail?.y === 'number') updateGaze(detail.x, detail.y)
}

async function goNext() {
  if (isLastPage.value) {
    clearDwell()
    clearLeaveTimer()
    gaze.value.visible = false
    transcript.value = ''
    speechError.value = false
    screen.value = 'question'
    await nextTick()
    startListening()
    return
  }
  currentPage.value += 1
  window.localStorage.setItem(storageKey.value, String(currentPage.value))
  readThrough.value = -1
  clearDwell()
  showReturnCue.value = false
  gaze.value.visible = false
  clearLeaveTimer()
  await nextTick()
}

function startListening() {
  if (silenceRetryTimer !== undefined) window.clearTimeout(silenceRetryTimer)
  silenceRetryTimer = undefined
  speechError.value = false
  isListening.value = true
  setMicrophoneState(true)

  const Recognition = getSpeechRecognitionConstructor()
  if (!Recognition) {
    // 실제 앱에서는 연결된 STT 장치가 iread:speech 이벤트를 전달합니다.
    return
  }

  recognition?.stop()
  recognition = new Recognition()
  recognition.lang = 'ko-KR'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.onresult = (event) => {
    const answer = event.results?.[0]?.[0]?.transcript?.trim()
    if (answer) {
      setMicrophoneState(false, true)
      acceptAnswer(answer)
    }
  }
  recognition.onerror = (event) => {
    isListening.value = false
    speechError.value = true
    const unavailable = ['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event.error)
    setMicrophoneState(false, unavailable ? false : undefined)
  }
  recognition.onend = () => {
    isListening.value = false
    setMicrophoneState(false)
    if (screen.value === 'question' && !speechError.value) {
      speechError.value = true
      silenceRetryTimer = window.setTimeout(() => {
        if (screen.value === 'question') startListening()
      }, 1400)
    }
  }
  recognition.start()
}

function stopListening() {
  recognition?.stop()
  isListening.value = false
  setMicrophoneState(false)
}

function onExternalSpeech(event: Event) {
  if (screen.value !== 'question') return
  const detail = (event as CustomEvent<{ transcript?: string; text?: string }>).detail
  const answer = (detail?.transcript ?? detail?.text ?? '').trim()
  if (answer) {
    speechError.value = false
    setMicrophoneState(false)
    acceptAnswer(answer)
  }
}

function acceptAnswer(answer: string) {
  transcript.value = answer
  screen.value = 'generating'
  stopListening()
  generationTimer = window.setTimeout(() => appendGeneratedPage(answer), 1400)
}

function appendGeneratedPage(answer: string) {
  const shortAnswer = answer.replace(/[“”\"]/g, '').slice(0, 28)
  const nextPage: StoryPage = {
    image: story.value.pages.at(-1)!.image,
    imagePosition: story.value.pages.at(-1)?.imagePosition,
    lines: [
      `아이의 생각은 “${shortAnswer}”였어요.`,
      `${story.value.character}의 새 이야기가 시작됐지요.`,
      `${story.value.character}는 용기를 내어 앞으로 나아갔어요.`,
    ],
  }
  generatedPages.value.push(nextPage)
  window.localStorage.setItem(generatedStorageKey.value, JSON.stringify(generatedPages.value.map(({ lines, imagePosition }) => ({ lines, imagePosition }))))
  currentPage.value = allPages.value.length - 1
  window.localStorage.setItem(storageKey.value, String(currentPage.value))
  readThrough.value = -1
  transcript.value = ''
  screen.value = 'reading'
}

watch(storyId, () => {
  generatedPages.value = loadGeneratedPages()
  currentPage.value = initialPage()
  screen.value = 'reading'
  readThrough.value = -1
  clearDwell()
})
onMounted(() => {
  generatedPages.value = loadGeneratedPages()
  currentPage.value = initialPage()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('iread:gaze', onExternalGaze)
  window.addEventListener('iread:speech', onExternalSpeech)
})
onBeforeUnmount(() => {
  clearLeaveTimer()
  clearDwell()
  if (generationTimer !== undefined) window.clearTimeout(generationTimer)
  if (silenceRetryTimer !== undefined) window.clearTimeout(silenceRetryTimer)
  recognition?.stop()
  setMicrophoneState(false)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('iread:gaze', onExternalGaze)
  window.removeEventListener('iread:speech', onExternalSpeech)
})
</script>

<template>
  <main class="story-reader">
    <section class="reader-frame" :aria-label="`${story.title} 읽기`">
      <div v-if="screen === 'reading'" class="story-scene">
        <PageBackButton
          class="reader-back"
          label="이야기 나라로 돌아가기"
          @back="router.push({ name: 'stories' })"
        />
        <div class="story-progress" role="status" :aria-label="`현재 ${currentPage + 1}페이지, 전체 ${allPages.length}페이지`">
          {{ currentPage + 1 }} / {{ allPages.length }}
        </div>
        <img :src="page.image" :alt="`${story.title} 이야기 장면`" :style="{ objectPosition: page.imagePosition ?? 'center' }" />
        <div class="scene-shade" aria-hidden="true" />
        <div ref="textPanel" class="reading-panel" aria-live="polite" @pointerleave="onPointerLeave">
          <div class="story-lines">
            <p v-for="(line, lineIndex) in page.lines" :key="line">
              <template v-for="(item, index) in pageWords" :key="`${lineIndex}-${index}`">
                <span v-if="item.lineIndex === lineIndex" class="story-word" :class="{ 'story-word--read': index <= readThrough, 'story-word--next': showReturnCue && index === readThrough + 1 }" :data-word-index="index">{{ item.word }}</span>
              </template>
            </p>
          </div>
          <span
            v-if="gaze.visible"
            :key="dwellTargetIndex ?? 'idle'"
            class="gaze-ring"
            :class="{ 'gaze-ring--dwelling': dwellTargetIndex !== null }"
            aria-hidden="true"
            :style="{
              transform: `translate(${gaze.x}px, ${gaze.y}px) translate(-50%, -50%)`,
              animationDuration: `${dwellDurationMs}ms`,
            }"
          />
        </div>
        <button v-if="isPageRead" class="next-page story-next" type="button" @click="goNext">
          <span>{{ isLastPage ? '이야기 이어 만들기' : '다음 페이지' }}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>

      <div v-else class="question-scene">
        <PageBackButton
          class="reader-back"
          label="이야기 나라로 돌아가기"
          @back="router.push({ name: 'stories' })"
        />
        <img :src="page.image" alt="" :style="{ objectPosition: page.imagePosition ?? 'center' }" />
        <div class="question-backdrop" aria-hidden="true" />
        <section class="question-card" :class="{ 'question-card--generating': screen === 'generating' }" aria-live="polite">
          <template v-if="screen === 'question'">
            <div class="choice-illustration">
              <img :src="storyChoiceScene" alt="갈림길 앞에서 어느 길로 갈지 고민하는 거북이" />
            </div>
            <h1>{{ story.question }}</h1>
            <section class="voice-answer" aria-label="말로 대답하기">
              <span class="listening-mic" :class="{ 'listening-mic--active': isListening }" aria-hidden="true">
                <svg viewBox="0 0 48 48"><rect x="17" y="6" width="14" height="25" rx="7"/><path d="M11 23c0 8 5.8 14 13 14s13-6 13-14M24 37v7M17 44h14"/></svg>
              </span>
              <div class="listening-copy">
                <strong>{{ speechError ? '잘 듣지 못했어요' : '이야기를 들려주세요!' }}</strong>
                <p>{{ speechError ? '천천히 다시 말해 볼까요?' : '지금 대답을 듣고 있어요…' }}</p>
              </div>
              <button v-if="speechError" class="retry-button" type="button" @click="startListening">
                다시 말하기
              </button>
            </section>
          </template>

          <template v-else>
            <h1 class="making-title">다음 이야기를 만들고 있어요!</h1>
            <blockquote>“{{ transcript }}”</blockquote>
            <span class="making-dots" aria-label="다음 이야기 만드는 중"><i/><i/><i/></span>
          </template>
        </section>
      </div>

    </section>
  </main>
</template>

<style scoped src="@/styles/story/StoryReaderView.css"></style>
