<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppCloudDecoration from '../../components/common/AppCloudDecoration.vue'
import PaginationDots from '../../components/common/PaginationDots.vue'
import StoryBookshelf from '../../components/story/StoryBookshelf.vue'
import type { StoryBook } from '../../components/story/StoryBookCard.vue'
import antAndGrasshopperCover from '../../assets/story/covers/ant-and-grasshopper.png'
import oldManAndSeaCover from '../../assets/story/covers/old-man-and-sea.png'
import aliceCover from '../../assets/story/covers/alice-cover.png'

const booksPerPage = 3
const currentPage = ref(0)
const storyBooks: StoryBook[] = [
  { id:'ant-and-grasshopper',title:'개미와 배짱이',coverImage:antAndGrasshopperCover,route:{ name:'story-reading',params:{ storyId:'ant-and-grasshopper' } } },
  { id:'old-man-and-sea',title:'노인과 바다',coverImage:oldManAndSeaCover,route:{ name:'story-reading',params:{ storyId:'old-man-and-sea' } } },
  { id:'alice',title:'이상한 나라의 엘리스',coverImage:aliceCover,route:{ name:'story-reading',params:{ storyId:'alice' } } },
]
const pageCount = Math.ceil(storyBooks.length / booksPerPage)
const visibleBooks = computed(() => storyBooks.slice(currentPage.value * booksPerPage,currentPage.value * booksPerPage + booksPerPage))
const hasPreviousPage = computed(() => currentPage.value > 0)
const hasNextPage = computed(() => currentPage.value < pageCount - 1)

function selectPage(page:number) { currentPage.value = Math.min(Math.max(page,0),pageCount - 1) }
function onKeydown(event:KeyboardEvent) {
  if (event.key === 'ArrowLeft') selectPage(currentPage.value - 1)
  if (event.key === 'ArrowRight') selectPage(currentPage.value + 1)
}
onMounted(() => window.addEventListener('keydown',onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown',onKeydown))
</script>

<template>
  <main class="story-select-page">
    <AppCloudDecoration class="cloud cloud--top-left" size="small" />
    <AppCloudDecoration class="cloud cloud--top-right" />
    <AppCloudDecoration class="cloud cloud--bottom-left" size="large" />
    <AppCloudDecoration class="cloud cloud--bottom-right" size="small" />
    <section class="story-select-panel" aria-labelledby="story-select-title">
      <header class="story-select-heading">
        <span class="heading-lines" aria-hidden="true"><i /><i /><i /></span>
        <h1 id="story-select-title">이야기 고르기</h1>
        <span class="heading-lines heading-lines--right" aria-hidden="true"><i /><i /><i /></span>
      </header>
      <div class="shelf-stage">
        <button v-if="hasPreviousPage" class="page-arrow page-arrow--previous" type="button" aria-label="이전 이야기 보기" @click="selectPage(currentPage - 1)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <StoryBookshelf :books="visibleBooks" :page-key="currentPage" />
        <button class="page-arrow page-arrow--next" type="button" :aria-label="hasNextPage ? '다음 이야기 보기' : '다음 이야기가 아직 없어요'" :disabled="!hasNextPage" @click="selectPage(currentPage + 1)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>
      <PaginationDots v-if="pageCount > 1" :count="pageCount" :current="currentPage" @select="selectPage" />
    </section>
  </main>
</template>

<style scoped>
.story-select-page { position:relative;display:grid;place-items:center;width:100%;height:100%;min-height:590px;overflow:hidden;padding:clamp(14px,2vh,28px) var(--learner-page-padding);background:var(--learner-background);color:var(--learner-color-text);font-family:var(--learner-font-reading); }
.cloud { position:absolute;z-index:0; }.cloud--top-left { top:17%;left:-44px; }.cloud--top-right { top:9%;right:-48px; }.cloud--bottom-left { bottom:11%;left:-62px; }.cloud--bottom-right { right:-45px;bottom:18%; }
.story-select-panel { position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:clamp(14px,2vh,24px);width:min(92vw,1500px);height:min(94%,830px);min-height:548px;padding:clamp(18px,2.4vh,32px) clamp(30px,4vw,64px) clamp(20px,2.5vh,32px);border-radius:var(--learner-radius-card);background:color-mix(in srgb,var(--learner-color-game) 8%,var(--learner-color-surface));box-shadow:var(--learner-shadow-floating); }
.story-select-heading { display:flex;align-items:center;justify-content:center;gap:clamp(22px,3vw,48px); }
.story-select-heading h1 { margin:0;font-family:var(--learner-font-display);font-size:clamp(44px,5vw,78px);font-weight:var(--learner-font-weight-heavy);line-height:1.1; }
.heading-lines { display:flex;flex-direction:column;align-items:flex-end;gap:var(--learner-space-2); }.heading-lines i { display:block;width:var(--learner-space-8);height:var(--learner-border-width-strong);border-radius:var(--learner-radius-pill);background:var(--learner-color-sky-top);transform:rotate(12deg); }.heading-lines i:nth-child(2) { width:var(--learner-space-10);transform:none; }.heading-lines i:nth-child(3) { transform:rotate(-12deg); }.heading-lines--right { transform:scaleX(-1); }
.shelf-stage { position:relative;display:flex;flex:1;min-height:0;align-items:center;justify-content:center;width:100%; }
.page-arrow { position:absolute;z-index:4;top:50%;display:grid;place-items:center;width:clamp(64px,5vw,76px);height:clamp(64px,5vw,76px);padding:0;border:var(--learner-border-width-strong) solid var(--learner-color-surface);border-radius:50%;background:var(--learner-color-primary);color:var(--learner-color-text-inverse);box-shadow:var(--learner-shadow-card);cursor:pointer;transform:translateY(-50%);transition:transform var(--learner-duration-fast) var(--learner-easing-standard),opacity var(--learner-duration-fast); }
.page-arrow--previous { left:clamp(0px,2vw,28px); }.page-arrow--next { right:clamp(0px,2vw,28px); }.page-arrow svg { width:52%;fill:none;stroke:currentColor;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round; }.page-arrow:hover:not(:disabled) { transform:translateY(calc(-50% - 3px)) scale(1.04); }.page-arrow:active:not(:disabled) { transform:translateY(-50%) scale(1); }.page-arrow:disabled { opacity:.48;cursor:not-allowed;filter:saturate(.55); }.page-arrow:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }
@media (max-width:1240px) { .story-select-panel { width:94vw;padding-inline:var(--learner-space-8); }.page-arrow--previous { left:0; }.page-arrow--next { right:0; } }
@media (max-height:760px) { .story-select-page { padding-block:var(--learner-space-3); }.story-select-panel { height:96%;min-height:540px;padding-block:var(--learner-space-4); }.story-select-heading h1 { font-size:clamp(36px,4vw,56px); } }
</style>
