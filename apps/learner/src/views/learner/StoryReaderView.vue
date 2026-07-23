<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import RiveGuideCharacter from '../../components/RiveGuideCharacter.vue'
import storyScene from '../../assets/story/story-reader-turtle-scene-mock.png'

interface StoryPage { lines: string[]; image: string; imagePosition?: string }
interface Story { title: string; character: string; question: string; pages: StoryPage[] }

interface SpeechRecognitionResultLike { 0?: { transcript?: string } }
interface SpeechRecognitionEventLike { results?: ArrayLike<SpeechRecognitionResultLike> }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const stories: Record<string, Story> = {
  'ant-and-grasshopper': {
    title: '개미와 베짱이',
    character: '개미와 베짱이',
    question: '개미와 베짱이는 이제 무엇을 할까요?',
    pages: [
      { image: storyScene, lines: ['개미는 부지런히 먹이를 옮겼어요.', '작은 곡식도 차곡차곡 쌓았지요.', '베짱이는 나무 아래에서 노래했어요.'] },
      { image: storyScene, lines: ['개미는 겨울을 생각하며 일했어요.', '창고에는 곡식이 가득 모였지요.', '베짱이는 여름 내내 노래를 불렀어요.'] },
      { image: storyScene, lines: ['겨울이 오자 베짱이는 배가 고팠어요.', '베짱이는 개미의 집을 찾아갔지요.', '개미는 따뜻한 음식을 함께 나누었어요.'] },
    ],
  },
  'old-man-and-sea': {
    title: '노인과 바다',
    character: '노인',
    question: '노인은 다음에 어디로 가게 될까요?',
    pages: [
      { image: storyScene, lines: ['노인은 오늘도 작은 배를 띄웠어요.', '푸른 바다에는 잔잔한 파도가 일었지요.', '반짝이는 물고기 떼가 지나갔어요.'] },
      { image: storyScene, lines: ['노인은 바다의 소리에 귀 기울였어요.', '멀리서 하얀 새 한 마리가 날아왔지요.', '노인은 용기를 내어 노를 저었답니다.'] },
      { image: storyScene, lines: ['노인의 배는 노을빛으로 물들었어요.', '따뜻한 바람이 배를 살며시 밀어 주었지요.', '노인은 바다에 인사하고 돌아왔어요.'] },
    ],
  },
  alice: {
    title: '이상한 나라의 앨리스',
    character: '앨리스',
    question: '앨리스는 다음에 어떻게 될까요?',
    pages: [
      { image: storyScene, lines: ['앨리스는 하얀 토끼를 보고 놀랐어요.', '토끼는 시계를 보며 늦었다고 외쳤지요.', '그리고 알록달록한 숲길로 달려갔어요.'] },
      { image: storyScene, lines: ['커다란 악어가 책을 읽고 있었어요.', '앨리스는 악어에게 길을 물어보았지요.', '악어는 이상한 나라의 길을 알려 주었어요.'] },
      { image: storyScene, lines: ['앨리스는 갈림길 앞에서 고민했어요.', '어느 길로 가야 할지 알 수 없었지요.', '앨리스는 용기를 내어 힘차게 걸어갔어요.'] },
    ],
  },
}

const route = useRoute()
const storyId = computed(() => String(route.params.storyId ?? 'alice'))
const story = computed<Story>(() => stories[storyId.value] ?? stories.alice!)
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
const typedAnswer = ref('')
const showTyping = ref(false)
const isListening = ref(false)
const speechError = ref(false)
let leaveTimer: number | undefined
let dwellTimer: number | undefined
let generationTimer: number | undefined
let recognition: SpeechRecognitionLike | null = null

const allPages = computed(() => [...story.value.pages, ...generatedPages.value])
const page = computed<StoryPage>(() => allPages.value[currentPage.value] ?? story.value.pages[0]!)
const pageWords = computed(() => page.value.lines.flatMap((line, lineIndex) => line.split(' ').map((word) => ({ word, lineIndex }))))
const isLastPage = computed(() => currentPage.value === allPages.value.length - 1)
const isPageRead = computed(() => readThrough.value >= pageWords.value.length - 1)
const speechSupported = computed(() => Boolean(getSpeechRecognitionConstructor()))
const storyGuideMessage = computed(() => {
  if (isPageRead.value) {
    return isLastPage.value
      ? '끝까지 다 읽었네!\n다음 이야기를 만들어 보자!'
      : '한 페이지를 다 읽었네!\n다음 이야기로 가보자!'
  }
  if (showReturnCue.value) return '읽던 곳을 찾았어!\n다시 천천히 읽어보자!'
  return readThrough.value < 0
    ? '책을 펼쳤네!\n토끼와 함께 읽어보자!'
    : '좋아, 잘 읽고 있어!\n천천히 이어서 읽어보자!'
})
const storyGuideMood = computed<'idle' | 'reading' | 'cheer'>(() => {
  if (isPageRead.value) return 'cheer'
  if (showReturnCue.value) return 'idle'
  return 'reading'
})

function getSpeechRecognitionConstructor() {
  const speechWindow = window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
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
    typedAnswer.value = ''
    showTyping.value = false
    speechError.value = false
    screen.value = 'question'
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
  const Recognition = getSpeechRecognitionConstructor()
  if (!Recognition) {
    speechError.value = true
    showTyping.value = true
    return
  }

  recognition?.stop()
  recognition = new Recognition()
  recognition.lang = 'ko-KR'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.onresult = (event) => {
    const answer = event.results?.[0]?.[0]?.transcript?.trim()
    if (answer) acceptAnswer(answer)
  }
  recognition.onerror = () => {
    isListening.value = false
    speechError.value = true
    showTyping.value = true
  }
  recognition.onend = () => { isListening.value = false }
  isListening.value = true
  speechError.value = false
  recognition.start()
}

function stopListening() {
  recognition?.stop()
  isListening.value = false
}

function onExternalSpeech(event: Event) {
  if (screen.value !== 'question') return
  const detail = (event as CustomEvent<{ transcript?: string; text?: string }>).detail
  const answer = (detail?.transcript ?? detail?.text ?? '').trim()
  if (answer) acceptAnswer(answer)
}

function submitTypedAnswer() {
  const answer = typedAnswer.value.trim()
  if (answer) acceptAnswer(answer)
}

function acceptAnswer(answer: string) {
  stopListening()
  transcript.value = answer
  screen.value = 'generating'
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
  recognition?.stop()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('iread:gaze', onExternalGaze)
  window.removeEventListener('iread:speech', onExternalSpeech)
})
</script>

<template>
  <main class="story-reader">
    <section class="reader-frame" :aria-label="`${story.title} 읽기`">
      <div v-if="screen === 'reading'" class="story-scene">
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
        <img :src="page.image" alt="" :style="{ objectPosition: page.imagePosition ?? 'center' }" />
        <div class="question-backdrop" aria-hidden="true" />
        <section class="question-card" aria-live="polite">
          <template v-if="screen === 'question'">
            <span class="question-kicker">이야기를 이어 주세요!</span>
            <h1>{{ story.question }}</h1>
            <p class="question-guide">생각한 이야기를 큰 소리로 말해 봐요.</p>

            <button class="mic-button" :class="{ 'mic-button--listening': isListening }" type="button" :aria-label="isListening ? '듣기 멈추기' : '대답하기'" @click="isListening ? stopListening() : startListening()">
              <svg viewBox="0 0 48 48" aria-hidden="true"><rect x="17" y="6" width="14" height="25" rx="7"/><path d="M11 23c0 8 5.8 14 13 14s13-6 13-14M24 37v7M17 44h14"/></svg>
            </button>
            <strong class="listening-label">{{ isListening ? '듣고 있어요…' : '눌러서 대답해요' }}</strong>

            <button v-if="!showTyping" class="typing-toggle" type="button" @click="showTyping = true">직접 입력하기</button>
            <form v-else class="answer-form" @submit.prevent="submitTypedAnswer">
              <label for="story-answer">말한 내용을 적어도 좋아요</label>
              <div>
                <input id="story-answer" v-model="typedAnswer" autocomplete="off" placeholder="예: 토끼를 따라갈 거예요" />
                <button type="submit" :disabled="!typedAnswer.trim()">이야기 만들기</button>
              </div>
            </form>
            <p v-if="speechError" class="speech-error">잘 듣지 못했어요. 다시 말하거나 적어 주세요.</p>
          </template>

          <template v-else>
            <span class="sparkles" aria-hidden="true">✦ ✨ ✦</span>
            <h1 class="making-title">새 이야기를 만들고 있어요!</h1>
            <blockquote>“{{ transcript }}”</blockquote>
            <span class="making-dots" aria-label="이야기 만드는 중"><i/><i/><i/></span>
          </template>
        </section>
      </div>

    </section>
    <RiveGuideCharacter
      v-if="screen === 'reading'"
      class="story-guide"
      :message="storyGuideMessage"
      :mood="storyGuideMood"
    />
  </main>
</template>

<style scoped>
.story-reader{position:relative;width:100%;height:100%;min-height:590px;display:grid;place-items:center;padding:clamp(10px,1.5vh,18px) var(--learner-page-padding);overflow:hidden;background-color:#66bdf1;background-image:url('../../assets/backgrounds/story-reader-outer-background-flat-vector.png');background-position:center;background-size:cover;background-repeat:no-repeat;color:var(--learner-color-text);font-family:var(--learner-font-reading)}
.reader-frame{position:relative;width:min(94vw,1520px);height:min(97%,850px);min-height:0;max-height:100%;padding:clamp(14px,2vh,22px);border:3px solid #ecd17d;border-radius:34px;background:#fff6cf;box-shadow:0 16px 36px rgba(49,66,124,.22)}
.story-scene{position:relative;width:100%;height:100%;min-height:0;overflow:hidden;border:var(--learner-border-width-strong) solid rgba(255,255,255,.86);border-radius:calc(var(--learner-radius-card) - 8px);background:#d6edff;box-shadow:inset 0 0 0 2px rgba(119,85,35,.12),var(--learner-shadow-card)}
.story-scene>img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover}.scene-shade{position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(30,37,34,.16) 42%,rgba(30,37,34,.38));pointer-events:none}
.reading-panel{position:absolute;z-index:2;top:clamp(70px,12vh,120px);left:clamp(70px,8vw,130px);width:min(58%,860px);min-height:0;padding:0;border:0;background:transparent;box-shadow:none}
.story-lines{width:100%}.story-lines p{display:flex;justify-content:flex-start;flex-wrap:wrap;gap:.2em;margin:0 0 .34em;color:#132b67;font-size:clamp(40px,min(3.55vw,6vh),58px);font-weight:var(--learner-font-weight-heavy);line-height:1.3;letter-spacing:-.025em;white-space:normal;text-align:left;text-shadow:0 2px 0 rgba(255,255,255,.8),0 0 12px rgba(255,252,225,.92)}.story-lines p:last-child{margin-bottom:0}
.story-word{position:relative;display:inline-block;padding:0 .09em;border-radius:.3em;transition:color var(--learner-duration-fast),background-color var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.story-word--read{color:#315d8c;background:linear-gradient(transparent 64%,rgba(116,188,255,.34) 64%)}
.story-word--next{color:#183f78;background:#fff0a6;box-shadow:0 0 0 5px rgba(255,218,76,.24),0 0 22px rgba(255,193,36,.5);animation:return-cue 1.15s ease-in-out infinite}
.gaze-ring{position:absolute;top:0;left:0;width:42px;height:42px;border:4px solid rgba(46,133,232,.54);border-radius:50%;background:rgba(255,255,255,.1);box-shadow:0 0 0 7px rgba(87,170,255,.15);pointer-events:none}
.gaze-ring--dwelling{animation-name:gaze-dwell;animation-timing-function:linear;animation-fill-mode:forwards}
.next-page{min-width:clamp(188px,16vw,240px);min-height:var(--learner-control-height-large);display:inline-flex;align-items:center;justify-content:center;gap:var(--learner-space-3);padding:0 var(--learner-space-6);border:var(--learner-border-width) solid var(--learner-color-primary-dark);border-radius:var(--learner-radius-pill);background:var(--learner-color-primary);color:var(--learner-color-text-inverse);box-shadow:var(--learner-shadow-card);font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy);cursor:pointer;transition:transform var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.story-next{position:absolute;right:clamp(22px,3vw,48px);bottom:clamp(22px,3vh,40px);z-index:5;animation:next-arrive .28s var(--learner-easing-bounce) both}
.next-page svg{width:30px;fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}.next-page:hover{transform:translateY(-2px);box-shadow:var(--learner-shadow-floating)}.next-page:active{transform:translateY(0)}.next-page:focus-visible{outline:none;box-shadow:var(--learner-shadow-focus)}
.question-scene{position:relative;width:100%;height:100%;min-height:0;overflow:hidden;border:var(--learner-border-width-strong) solid rgba(255,255,255,.86);border-radius:calc(var(--learner-radius-card) - 8px);background:#d6edff;box-shadow:inset 0 0 0 2px rgba(119,85,35,.12),var(--learner-shadow-card)}
.question-scene>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.82) blur(2px);transform:scale(1.015)}
.question-backdrop{position:absolute;inset:0;background:linear-gradient(135deg,rgba(47,123,220,.58),rgba(120,84,190,.42)),rgba(24,55,92,.22)}
.question-card{position:absolute;z-index:1;top:50%;left:50%;width:min(88%,850px);min-height:min(82%,590px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(24px,4vh,46px) clamp(28px,5vw,70px);border:4px solid rgba(255,255,255,.88);border-radius:clamp(30px,4vw,52px);background:rgba(255,253,239,.96);box-shadow:0 20px 55px rgba(24,46,81,.3),inset 0 0 0 4px rgba(255,223,112,.28);transform:translate(-50%,-50%);text-align:center}
.question-kicker{margin-bottom:clamp(12px,2vh,20px);padding:8px 22px;border-radius:var(--learner-radius-pill);background:#fff0ac;color:#765310;font-family:var(--learner-font-display);font-size:clamp(18px,2vw,26px);font-weight:var(--learner-font-weight-heavy)}
.question-card h1{max-width:760px;margin:0;color:#243f7c;font-family:var(--learner-font-display);font-size:clamp(38px,5vw,66px);font-weight:var(--learner-font-weight-heavy);line-height:1.18;letter-spacing:-.04em;word-break:keep-all}
.question-guide{margin:clamp(12px,2vh,22px) 0;color:#58677b;font-size:clamp(19px,2.2vw,28px);font-weight:var(--learner-font-weight-bold)}
.mic-button{position:relative;width:clamp(92px,10vw,126px);height:clamp(92px,10vw,126px);display:grid;place-items:center;border:5px solid #fff;border-radius:50%;background:linear-gradient(145deg,#5b93ff,#3d6ee3);box-shadow:0 10px 0 #2d57bd,0 16px 28px rgba(45,87,189,.3);color:#fff;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}
.mic-button svg{width:50%;fill:currentColor;stroke:currentColor;stroke-width:4;stroke-linecap:round}.mic-button:hover{transform:translateY(-3px)}.mic-button:active{transform:translateY(5px);box-shadow:0 5px 0 #2d57bd}.mic-button:focus-visible{outline:6px solid rgba(255,199,54,.65);outline-offset:5px}
.mic-button--listening{background:linear-gradient(145deg,#ff8b72,#f05d58);box-shadow:0 10px 0 #c74542,0 0 0 14px rgba(255,111,94,.18);animation:mic-pulse 1.2s ease-in-out infinite}
.listening-label{margin-top:15px;color:#31528e;font-family:var(--learner-font-display);font-size:clamp(18px,2vw,25px)}
.typing-toggle{margin-top:14px;padding:8px 18px;border:0;background:transparent;color:#66758c;font-family:inherit;font-size:17px;font-weight:700;text-decoration:underline;text-underline-offset:5px;cursor:pointer}
.answer-form{width:min(100%,650px);margin-top:14px}.answer-form label{display:block;margin-bottom:8px;color:#5f6d82;font-size:16px;font-weight:700}.answer-form>div{display:flex;gap:10px}.answer-form input{min-width:0;flex:1;height:58px;padding:0 20px;border:3px solid #b8cdf4;border-radius:18px;background:#fff;color:#273a59;font-family:inherit;font-size:20px;font-weight:700}.answer-form input:focus{outline:none;border-color:#5286eb;box-shadow:0 0 0 5px rgba(82,134,235,.18)}.answer-form button{padding:0 22px;border:0;border-radius:18px;background:#477be5;color:#fff;font-family:var(--learner-font-display);font-size:19px;font-weight:800;cursor:pointer}.answer-form button:disabled{opacity:.45;cursor:not-allowed}
.speech-error{margin:10px 0 0;color:#b64f4b;font-size:17px;font-weight:700}.sparkles{margin-bottom:20px;color:#efb623;font-size:clamp(32px,4vw,50px);letter-spacing:.25em;animation:sparkle 1.2s ease-in-out infinite}.question-card .making-title{font-size:clamp(36px,4.5vw,60px)}.question-card blockquote{max-width:700px;margin:26px 0 20px;padding:18px 28px;border-radius:24px;background:#eaf2ff;color:#34578d;font-size:clamp(24px,3vw,38px);font-weight:800;line-height:1.35;word-break:keep-all}.making-dots{display:flex;gap:12px;margin-top:12px}.making-dots i{width:18px;height:18px;border-radius:50%;background:#5b86e5;animation:making-dot 1s ease-in-out infinite}.making-dots i:nth-child(2){animation-delay:.15s}.making-dots i:nth-child(3){animation-delay:.3s}
.question-footer{min-height:var(--learner-control-height-large);display:flex;align-items:center;justify-content:center;color:#786538;font-size:clamp(17px,1.8vw,22px);font-weight:800}
.story-reader :deep(.story-guide){right:-2%;bottom:-18%;width:clamp(250px,19vw,315px)}
.story-reader :deep(.story-guide .bubble){right:88%;bottom:48%;width:clamp(210px,17vw,265px)}
@keyframes next-arrive{from{opacity:0;transform:translateY(12px) scale(.94)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes return-cue{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
@keyframes gaze-dwell{0%{border-color:rgba(46,133,232,.32);box-shadow:0 0 0 7px rgba(87,170,255,.1)}100%{border-color:#2e85e8;box-shadow:0 0 0 9px rgba(87,170,255,.32)}}
@keyframes mic-pulse{50%{box-shadow:0 10px 0 #c74542,0 0 0 22px rgba(255,111,94,.1)}}
@keyframes sparkle{50%{transform:scale(1.08);opacity:.72}}
@keyframes making-dot{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(-10px);opacity:1}}
@media(max-width:980px){.reader-frame{width:97vw;padding:var(--learner-space-3)}.reading-panel{top:clamp(28px,7vh,54px);left:var(--learner-space-6);width:calc(100% - 2 * var(--learner-space-6))}.story-lines p{font-size:clamp(36px,5.4vw,50px)}}
@media(max-width:1180px){.story-reader :deep(.story-guide){right:-5%;width:260px}.story-reader :deep(.story-guide .bubble){right:78%;width:220px}}
@media(max-width:820px){.story-reader :deep(.story-guide){display:none}}
@media(max-height:720px){.story-reader{padding-block:var(--learner-space-3)}.reader-frame{height:98%;padding:var(--learner-space-4)}.reading-panel{top:var(--learner-space-3);padding-block:var(--learner-space-3)}.story-lines p{font-size:clamp(35px,6.1vh,48px);line-height:1.18}.question-card{min-height:92%;padding-block:18px}.question-guide{margin-block:8px}.mic-button{width:82px;height:82px}.listening-label{margin-top:10px}.typing-toggle{margin-top:8px}.question-footer{min-height:48px}}
@media(prefers-reduced-motion:reduce){.story-word--next,.gaze-ring--dwelling,.mic-button--listening,.sparkles,.making-dots i,.story-next{animation:none}.next-page,.story-word{transition:none}}
</style>
