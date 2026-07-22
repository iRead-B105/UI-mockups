<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import aliceScene from '../../assets/story/alice-continue.png'
import antScene from '../../assets/story/covers/ant-and-grasshopper.png'
import seaScene from '../../assets/story/covers/old-man-and-sea.png'

interface StoryPage { lines: [string, string]; image: string; imagePosition?: string }
interface Story { title: string; pages: StoryPage[] }

const stories: Record<string, Story> = {
  'ant-and-grasshopper': {
    title: '개미와 베짱이',
    pages: [
      { image: antScene, imagePosition: 'center 42%', lines: ['햇살이 반짝이는 여름날, 개미는 부지런히 먹이를 옮겼어요.', '베짱이는 나무 그늘에 앉아 즐겁게 노래를 부르고 있었지요.'] },
      { image: antScene, imagePosition: 'center 58%', lines: ['개미는 추운 겨울을 생각하며 곡식을 차곡차곡 모았어요.', '베짱이는 괜찮다며 노래를 멈추지 않고 여름을 보냈답니다.'] },
      { image: antScene, imagePosition: 'center 70%', lines: ['겨울이 오자 배고픈 베짱이는 개미의 집을 찾아갔어요.', '개미는 따뜻한 음식을 나누며 함께 준비하자고 말했답니다.'] },
    ],
  },
  'old-man-and-sea': {
    title: '노인과 바다',
    pages: [
      { image: seaScene, lines: ['푸른 바다를 사랑하는 노인은 오늘도 작은 배를 띄웠어요.', '잔잔한 파도 너머로 반짝이는 물고기 떼가 지나갔지요.'] },
      { image: seaScene, imagePosition: 'center 58%', lines: ['노인은 서두르지 않고 바다의 소리에 가만히 귀 기울였어요.', '멀리 날아가는 새를 보며 용기를 내어 노를 저었답니다.'] },
      { image: seaScene, imagePosition: 'center 72%', lines: ['해가 질 무렵 노인의 배는 따뜻한 빛으로 물들었어요.', '노인은 고마운 바다에 인사하고 천천히 집으로 돌아왔지요.'] },
    ],
  },
  alice: {
    title: '이상한 나라의 앨리스',
    pages: [
      { image: aliceScene, lines: ['앨리스는 회중시계를 든 하얀 토끼를 발견하고 깜짝 놀랐어요.', '토끼는 늦었다고 외치며 알록달록한 숲길로 달려갔지요.'] },
      { image: aliceScene, imagePosition: 'center 44%', lines: ['앨리스가 토끼를 따라가자 커다란 악어가 책을 읽고 있었어요.', '악어는 웃으며 이상한 나라의 길을 친절하게 알려 주었답니다.'] },
      { image: aliceScene, imagePosition: 'center 58%', lines: ['갈림길 앞에서 앨리스는 어느 길로 갈지 잠시 고민했어요.', '용기를 낸 앨리스는 마음이 가리키는 길로 힘차게 걸어갔지요.'] },
    ],
  },
}

const route = useRoute()
const router = useRouter()
const storyId = computed(() => String(route.params.storyId ?? 'alice'))
const story = computed<Story>(() => stories[storyId.value] ?? stories.alice!)
const storageKey = computed(() => `iread-story-page:${storyId.value}`)

function initialPage() {
  if (route.query.continue !== '1') return 0
  const saved = Number(window.localStorage.getItem(storageKey.value) ?? 0)
  return Number.isInteger(saved) ? Math.min(Math.max(saved, 0), story.value.pages.length - 1) : 0
}

const currentPage = ref(0)
const readThrough = ref(-1)
const gaze = ref({ x: 0, y: 0, visible: false })
const showReturnCue = ref(false)
const textPanel = ref<HTMLElement | null>(null)
let leaveTimer: number | undefined

const page = computed<StoryPage>(() => story.value.pages[currentPage.value] ?? story.value.pages[0]!)
const pageWords = computed(() => page.value.lines.flatMap((line, lineIndex) => line.split(' ').map((word) => ({ word, lineIndex }))))
const isLastPage = computed(() => currentPage.value === story.value.pages.length - 1)

function clearLeaveTimer() {
  if (leaveTimer !== undefined) window.clearTimeout(leaveTimer)
  leaveTimer = undefined
}

function scheduleReturnCue() {
  clearLeaveTimer()
  if (readThrough.value >= pageWords.value.length - 1) return
  leaveTimer = window.setTimeout(() => { showReturnCue.value = true }, 3000)
}

function setProgress(index: number) {
  if (index > readThrough.value) readThrough.value = index
  showReturnCue.value = false
  clearLeaveTimer()
}

function updateGaze(clientX: number, clientY: number) {
  const panel = textPanel.value
  if (!panel) return
  const panelRect = panel.getBoundingClientRect()
  gaze.value = { x: clientX - panelRect.left, y: clientY - panelRect.top, visible: clientX >= panelRect.left && clientX <= panelRect.right && clientY >= panelRect.top && clientY <= panelRect.bottom }
  if (!gaze.value.visible) { scheduleReturnCue(); return }
  const target = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-word-index]')
  if (target && panel.contains(target)) setProgress(Number(target.dataset.wordIndex))
}

function onPointerMove(event: PointerEvent) { updateGaze(event.clientX, event.clientY) }
function onPointerLeave() { gaze.value.visible = false; scheduleReturnCue() }
function onExternalGaze(event: Event) {
  const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail
  if (typeof detail?.x === 'number' && typeof detail?.y === 'number') updateGaze(detail.x, detail.y)
}

async function goNext() {
  if (isLastPage.value) { await router.push({ name: 'story-selection' }); return }
  currentPage.value += 1
  window.localStorage.setItem(storageKey.value, String(currentPage.value))
  readThrough.value = -1
  showReturnCue.value = false
  gaze.value.visible = false
  clearLeaveTimer()
  await nextTick()
}

watch(storyId, () => { currentPage.value = initialPage(); readThrough.value = -1 })
onMounted(() => {
  currentPage.value = initialPage()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('iread:gaze', onExternalGaze)
})
onBeforeUnmount(() => {
  clearLeaveTimer()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('iread:gaze', onExternalGaze)
})
</script>

<template>
  <main class="story-reader">
    <section class="reader-frame" :aria-label="`${story.title} 읽기`">
      <div class="story-scene">
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
          <span v-if="gaze.visible" class="gaze-ring" aria-hidden="true" :style="{ transform: `translate(${gaze.x}px, ${gaze.y}px) translate(-50%, -50%)` }" />
        </div>
      </div>
      <footer class="reader-footer">
        <span class="page-progress" :aria-label="`${currentPage + 1}쪽, 전체 ${story.pages.length}쪽`">
          <i v-for="index in story.pages.length" :key="index" :class="{ active: index - 1 === currentPage }" />
        </span>
        <button class="next-page" type="button" @click="goNext">
          <span>{{ isLastPage ? '책 덮기' : '다음 페이지' }}</span>
          <svg v-if="!isLastPage" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.story-reader{width:100%;height:100%;min-height:590px;display:grid;place-items:center;padding:clamp(14px,2vh,26px) var(--learner-page-padding);overflow:hidden;background:var(--learner-background);color:var(--learner-color-text);font-family:var(--learner-font-reading)}
.reader-frame{width:min(94vw,1480px);height:min(96%,830px);min-height:0;max-height:100%;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:clamp(12px,1.8vh,20px);padding:clamp(18px,2.6vh,30px);border:var(--learner-border-width) solid color-mix(in srgb,#e7c970 58%,var(--learner-border-color-soft));border-radius:var(--learner-radius-card);background:#fff6cf;box-shadow:var(--learner-shadow-floating)}
.story-scene{position:relative;min-height:0;overflow:hidden;border:var(--learner-border-width-strong) solid rgba(255,255,255,.86);border-radius:calc(var(--learner-radius-card) - 8px);background:#d6edff;box-shadow:inset 0 0 0 2px rgba(119,85,35,.12),var(--learner-shadow-card)}
.story-scene>img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover}.scene-shade{position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(30,37,34,.16) 42%,rgba(30,37,34,.38));pointer-events:none}
.reading-panel{position:absolute;z-index:2;right:clamp(22px,3.8vw,60px);bottom:clamp(22px,3.8vh,48px);left:clamp(22px,3.8vw,60px);min-height:clamp(142px,20vh,188px);display:grid;place-items:center;padding:clamp(20px,2.6vh,30px) clamp(26px,3.4vw,52px);border:3px solid rgba(255,236,175,.88);border-radius:var(--learner-radius-medium);background:rgba(255,253,240,.94);box-shadow:0 10px 28px rgba(66,50,28,.22)}
.story-lines{width:100%}.story-lines p{display:flex;justify-content:center;flex-wrap:nowrap;gap:.34em;margin:0;font-size:clamp(25px,min(2.25vw,3.4vh),38px);font-weight:var(--learner-font-weight-bold);line-height:1.72;letter-spacing:.015em;white-space:nowrap}
.story-word{position:relative;display:inline-block;padding:0 .09em;border-radius:.3em;transition:color var(--learner-duration-fast),background-color var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.story-word--read{color:#315d8c;background:linear-gradient(transparent 64%,rgba(116,188,255,.34) 64%)}
.story-word--next{color:#183f78;background:#fff0a6;box-shadow:0 0 0 5px rgba(255,218,76,.24),0 0 22px rgba(255,193,36,.5);animation:return-cue 1.15s ease-in-out infinite}
.gaze-ring{position:absolute;top:0;left:0;width:42px;height:42px;border:4px solid rgba(46,133,232,.54);border-radius:50%;background:rgba(255,255,255,.1);box-shadow:0 0 0 7px rgba(87,170,255,.15);pointer-events:none}
.reader-footer{position:relative;min-height:var(--learner-control-height-large);display:flex;align-items:center;justify-content:flex-end}.page-progress{position:absolute;left:50%;display:flex;gap:var(--learner-space-3);transform:translateX(-50%)}
.page-progress i{width:14px;height:14px;border-radius:50%;background:#dccb98;transition:width var(--learner-duration-fast),background-color var(--learner-duration-fast)}.page-progress i.active{width:34px;border-radius:var(--learner-radius-pill);background:var(--learner-color-primary)}
.next-page{min-width:clamp(188px,16vw,240px);min-height:var(--learner-control-height-large);display:inline-flex;align-items:center;justify-content:center;gap:var(--learner-space-3);padding:0 var(--learner-space-6);border:var(--learner-border-width) solid var(--learner-color-primary-dark);border-radius:var(--learner-radius-pill);background:var(--learner-color-primary);color:var(--learner-color-text-inverse);box-shadow:var(--learner-shadow-card);font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy);cursor:pointer;transition:transform var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.next-page svg{width:30px;fill:none;stroke:currentColor;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}.next-page:hover{transform:translateY(-2px);box-shadow:var(--learner-shadow-floating)}.next-page:active{transform:translateY(0)}.next-page:focus-visible{outline:none;box-shadow:var(--learner-shadow-focus)}
@keyframes return-cue{0%,100%{transform:scale(1)}50%{transform:scale(1.055)}}
@media(max-width:980px){.reader-frame{width:96vw;padding:var(--learner-space-4)}.reading-panel{right:var(--learner-space-5);bottom:var(--learner-space-5);left:var(--learner-space-5);padding-inline:var(--learner-space-5)}.story-lines p{font-size:clamp(20px,2.7vw,28px)}}
@media(max-height:720px){.story-reader{padding-block:var(--learner-space-3)}.reader-frame{height:98%;padding:var(--learner-space-4)}.reading-panel{min-height:126px;bottom:var(--learner-space-4);padding-block:var(--learner-space-3)}.story-lines p{font-size:clamp(20px,3.3vh,28px);line-height:1.55}}
@media(prefers-reduced-motion:reduce){.story-word--next{animation:none}.next-page,.page-progress i,.story-word{transition:none}}
</style>
