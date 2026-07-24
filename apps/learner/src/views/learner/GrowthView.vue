<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import RiveGuideCharacter from '../../components/RiveGuideCharacter.vue'
import gardenBackground from '../../assets/backgrounds/garden-growth/garden-stage-1-soil.png'

type GardenId = 1 | 2 | 3

interface Garden {
  id: GardenId
  title: string
}

const gardens: Garden[] = [
  { id: 1, title: '파닉스' },
  { id: 2, title: '읽기' },
  { id: 3, title: '유창성' },
]

const stageNames = ['흙', '새싹', '꽃봉', '꽃', '만개'] as const
const stages = reactive<Record<GardenId, number>>({ 1: 1, 2: 1, 3: 1 })
const growingGarden = ref<GardenId | null>(null)
const hoveredGarden = ref<GardenId | null>(null)
const guideMessage = ref('화단을 눌러\n꽃을 키워 봐!')
const guideMood = ref<'idle' | 'cheer'>('idle')
const announcement = ref('화단을 눌러 꽃을 키워 보세요.')
let guideTimer: ReturnType<typeof setTimeout> | undefined

const gardenImages = import.meta.glob<string>(
  '../../assets/backgrounds/garden-growth/[123]*.png',
  { eager: true, import: 'default' },
)

const imageFor = (garden: Garden) => {
  const stageName = stageNames[stages[garden.id] - 1]
  return gardenImages[
    `../../assets/backgrounds/garden-growth/${garden.id}${stageName}.png`
  ] ?? ''
}

const progressLabel = (garden: Garden) => (
  stages[garden.id] === 5 ? '만개' : `${stages[garden.id]}단계`
)

const grow = (garden: Garden) => {
  if (stages[garden.id] < 5) {
    stages[garden.id] += 1
  }

  growingGarden.value = garden.id
  window.setTimeout(() => {
    if (growingGarden.value === garden.id) growingGarden.value = null
  }, 520)

  announcement.value = stages[garden.id] === 5
    ? `${garden.title} 화단이 활짝 피었어요!`
    : `${garden.title} 화단이 ${stages[garden.id]}단계로 자랐어요!`

  guideMessage.value = stages[garden.id] === 5 ? '우와!\n활짝 피었어!' : '쑥쑥 자랐어!'
  guideMood.value = 'cheer'
  window.clearTimeout(guideTimer)
  guideTimer = window.setTimeout(() => {
    guideMessage.value = hoveredGarden.value ? '눌러서 키우기!' : '화단을 눌러\n꽃을 키워 봐!'
    guideMood.value = 'idle'
    guideTimer = undefined
  }, 1200)
}

const showGrowHint = (garden: Garden) => {
  hoveredGarden.value = garden.id
  if (growingGarden.value !== garden.id) guideMessage.value = '눌러서 키우기!'
}

const showGardenHint = (garden: Garden) => {
  if (hoveredGarden.value === garden.id) hoveredGarden.value = null
  if (!guideTimer) guideMessage.value = '화단을 눌러\n꽃을 키워 봐!'
}

onBeforeUnmount(() => {
  window.clearTimeout(guideTimer)
})
</script>

<template>
  <main class="growth-page">
    <section class="garden-scene" aria-labelledby="growth-title">
      <h1 id="growth-title" class="sr-only">나의 성장</h1>

      <img class="garden-background" :src="gardenBackground" alt="" />

      <img
        v-for="garden in gardens"
        :key="`${garden.id}-${stages[garden.id]}`"
        class="garden-layer"
        :class="{ 'garden-layer--growing': growingGarden === garden.id }"
        :src="imageFor(garden)"
        alt=""
      />

      <button
        v-for="garden in gardens"
        :key="garden.id"
        class="garden-button"
        :class="`garden-button--${garden.id}`"
        type="button"
        :aria-label="`${garden.title} 화단 ${progressLabel(garden)}. 눌러서 성장시키기`"
        @pointerenter="showGrowHint(garden)"
        @pointerleave="showGardenHint(garden)"
        @focus="showGrowHint(garden)"
        @blur="showGardenHint(garden)"
        @click="grow(garden)"
      >
        <span class="garden-title">{{ garden.title }}</span>
      </button>

      <RiveGuideCharacter
        :message="guideMessage"
        :mood="guideMood"
      />

      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </section>
  </main>
</template>

<style scoped>
.growth-page {
  display: grid;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  place-items: center;
  background: #20abe8;
}

:global(.growth-page.learner-screen-with-header) {
  padding-top: 0 !important;
}

.garden-scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
}

.garden-background,
.garden-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
}

.garden-background {
  z-index: 1;
}

.garden-layer {
  z-index: 2;
}

.garden-layer--growing {
  animation: garden-grow 500ms var(--learner-easing-bounce);
}

.garden-button {
  position: absolute;
  z-index: 4;
  top: 49%;
  width: 27%;
  height: 36%;
  padding: 0;
  border: 0;
  border-radius: 42% 42% 38% 38%;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.garden-button--1 {
  left: 15.5%;
  transform: rotate(-5deg);
}

.garden-button--2 {
  left: 36.5%;
}

.garden-button--3 {
  left: 58%;
  transform: rotate(5deg);
}

.garden-button::after {
  position: absolute;
  inset: 12% 5% 2%;
  border: 4px solid transparent;
  border-radius: inherit;
  content: '';
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 180ms var(--learner-easing-bounce);
}

.garden-button:hover::after,
.garden-button:focus-visible::after {
  border-color: rgb(255 255 255 / 82%);
  background: rgb(255 255 255 / 8%);
  transform: scale(1.025);
}

.garden-button:focus-visible {
  outline: none;
}

.garden-title {
  position: absolute;
  z-index: 2;
  top: -18%;
  left: 50%;
  min-width: 54%;
  padding: clamp(7px, 1vh, 12px) clamp(18px, 1.8vw, 30px);
  border: 4px solid #fff8dc;
  border-radius: 999px;
  background: #fff;
  box-shadow:
    0 6px 0 #e8b85d,
    0 11px 20px rgb(82 78 23 / 20%);
  color: #3e392e;
  font-family: var(--learner-font-display);
  font-size: clamp(21px, 2.15vw, 38px);
  font-weight: 900;
  letter-spacing: .03em;
  line-height: 1;
  text-align: center;
  text-shadow: 0 2px 0 #fff;
  transform: translateX(-50%);
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes garden-grow {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  45% {
    opacity: .88;
    transform: translateY(-1.1%) scale(1.022);
  }
}

@media (prefers-reduced-motion: reduce) {
  .garden-layer--growing,
  .garden-button::after {
    animation: none;
    transition: none;
  }
}
</style>
