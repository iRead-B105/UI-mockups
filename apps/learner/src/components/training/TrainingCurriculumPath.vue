<script setup lang="ts">
import { computed, nextTick, onMounted, ref, type CSSProperties } from 'vue'
import curriculumRabbit from '@/assets/training/curriculum-rabbit.png'
import completePlatform from '@/assets/training/learning-platform-complete.png'
import currentPlatform from '@/assets/training/learning-platform-current.png'
import lockedPlatform from '@/assets/training/learning-platform-locked.png'
import type { TrainingLessonSummary } from '@/types/training'

export interface CurriculumPathStep {
  categoryId: string
  lesson: TrainingLessonSummary
  status: 'complete' | 'current' | 'locked'
}

const props = defineProps<{
  steps: CurriculumPathStep[]
}>()

const emit = defineEmits<{
  select: [step: CurriculumPathStep]
}>()

const currentStepNumber = computed(() => {
  const index = props.steps.findIndex((step) => step.status === 'current')
  return index < 0 ? props.steps.length : index + 1
})

const pathWidth = computed(() => Math.max(1040, 300 + props.steps.length * 240))
const pathHeight = 460
const pathScroll = ref<HTMLElement | null>(null)
const pathOffset = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(true)
const platformImages = {
  complete: completePlatform,
  current: currentPlatform,
  locked: lockedPlatform,
} as const
const categoryColors: Record<string, string> = {
  'phonological-awareness': '#ff922f',
  phonics: '#61bf38',
  'short-text': '#368de8',
  fluency: '#8b61df',
}

const pointFor = (index: number) => ({
  x: 150 + index * 240,
  y: index % 2 === 0 ? 135 : 300,
})

const pathPoints = computed(() =>
  props.steps.map((_, index) => {
    const point = pointFor(index)
    return `${point.x},${point.y}`
  }).join(' '),
)

const nodeStyle = (step: CurriculumPathStep, index: number) => ({
  left: `${pointFor(index).x}px`,
  top: `${pointFor(index).y - 70}px`,
  '--lesson-category-color': categoryColors[step.categoryId] ?? '#ff922f',
} as CSSProperties)

const updateScrollButtons = () => {
  const element = pathScroll.value
  if (!element) return

  const maxOffset = Math.max(pathWidth.value - element.clientWidth, 0)
  canScrollLeft.value = pathOffset.value > 8
  canScrollRight.value = pathOffset.value < maxOffset - 8
}

const movePath = (direction: -1 | 1) => {
  const element = pathScroll.value
  if (!element) return

  const distance = Math.max(element.clientWidth * .78, 520)
  const maxOffset = Math.max(pathWidth.value - element.clientWidth, 0)
  pathOffset.value = Math.min(
    Math.max(pathOffset.value + direction * distance, 0),
    maxOffset,
  )
  updateScrollButtons()
}

onMounted(() => {
  void nextTick(updateScrollButtons)
})

const selectStep = (step: CurriculumPathStep) => {
  if (step.status === 'locked') return
  emit('select', step)
}
</script>

<template>
  <section class="curriculum-path" aria-labelledby="curriculum-title">
    <header class="curriculum-heading">
      <div>
        <h1 id="curriculum-title">
          <span>7월 24일</span>
          글자연습
        </h1>
      </div>

      <div class="progress-card" aria-label="오늘의 훈련 진행률">
        <span>오늘의 진행</span>
        <strong>{{ currentStepNumber }}<small>/ {{ steps.length }}</small></strong>
        <div class="progress-track">
          <i :style="{ width: `${(currentStepNumber / Math.max(steps.length, 1)) * 100}%` }"></i>
        </div>
      </div>
    </header>

    <div class="path-viewport">
      <button
        class="path-nav path-nav--left"
        type="button"
        aria-label="이전 훈련 보기"
        :disabled="!canScrollLeft"
        @click="movePath(-1)"
      >
        ‹
      </button>

      <div
        ref="pathScroll"
        class="path-scroll"
        aria-label="좌우로 이어지는 학습 커리큘럼"
      >
        <div
          class="path-stage"
          :style="{
            width: `${pathWidth}px`,
            height: `${pathHeight}px`,
            transform: `translateX(-${pathOffset}px)`,
          }"
        >
          <svg
            class="path-line"
            :viewBox="`0 0 ${pathWidth} ${pathHeight}`"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline :points="pathPoints" />
          </svg>

          <button
            v-for="(step, index) in steps"
            :key="`${step.categoryId}-${step.lesson.id}`"
            class="lesson-node"
            :class="`lesson-node--${step.status}`"
            type="button"
            :disabled="step.status === 'locked'"
            :style="nodeStyle(step, index)"
            :aria-label="`${index + 1}번 ${step.lesson.title}${step.status === 'locked' ? ', 잠김' : ''}`"
            @click="selectStep(step)"
          >
            <img
              v-if="step.status === 'current'"
              class="path-rabbit"
              :src="curriculumRabbit"
              alt=""
            />

            <span class="step-number">{{ index + 1 }}</span>
            <img
              class="lesson-island"
              :src="platformImages[step.status]"
              alt=""
              aria-hidden="true"
            />
            <strong>{{ step.lesson.title }}</strong>
          </button>
        </div>
      </div>

      <button
        class="path-nav path-nav--right"
        type="button"
        aria-label="다음 훈련 보기"
        :disabled="!canScrollRight"
        @click="movePath(1)"
      >
        ›
      </button>
    </div>
  </section>
</template>

<style scoped>
.curriculum-path {
  position: relative;
  width: min(100%, 1240px);
  max-width: var(--learner-safe-width);
  margin: 0 auto;
  padding: clamp(28px, 3vw, 48px) clamp(24px, 4vw, 64px) 80px;
  border: 4px solid rgb(255 255 255 / 88%);
  border-radius: 36px;
  background: #fffaf0;
  box-shadow: 0 16px 36px rgb(44 91 119 / 20%);
}

.curriculum-heading {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
}

.curriculum-heading h1 {
  margin: 0;
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(34px, 4vw, 62px);
  font-weight: 900;
  line-height: 1.05;
}

.curriculum-heading h1 span {
  display: inline-block;
  margin-right: 12px;
  padding: 9px 18px 7px;
  border-radius: 18px;
  background: #ff9f22;
  box-shadow: inset 0 -5px 0 rgb(214 102 9 / 24%);
  color: #fff;
  font-size: .58em;
  vertical-align: .14em;
}

.progress-card {
  min-width: clamp(240px, 26vw, 350px);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px 14px;
  padding: 20px 24px;
  border: 2px solid #f1e7c9;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 20px rgb(89 82 44 / 10%);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(15px, 1.35vw, 21px);
  font-weight: 900;
}

.progress-card strong {
  color: #2869dc;
  font-size: clamp(24px, 2.2vw, 34px);
}

.progress-card small {
  margin-left: 5px;
  color: var(--learner-color-text);
  font-size: .58em;
}

.progress-track {
  grid-column: 1 / -1;
  height: 15px;
  overflow: hidden;
  border-radius: 999px;
  background: #e3e5ec;
}

.progress-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #65c537;
  transition: width 240ms ease;
}

.path-scroll {
  position: relative;
  width: 100%;
  margin-top: 20px;
  overflow-x: hidden;
  overflow-y: hidden;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;
}

.path-viewport {
  position: relative;
}

.path-nav {
  position: absolute;
  z-index: 25;
  top: 50%;
  width: 58px;
  height: 58px;
  display: grid;
  border: 4px solid #fff;
  border-radius: 50%;
  place-items: center;
  background: #5869e8;
  box-shadow:
    inset 0 -6px 0 rgb(41 55 177 / 28%),
    0 7px 16px rgb(43 54 115 / 25%);
  color: #fff;
  font-family: Arial, sans-serif;
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  transition: transform 160ms ease, opacity 160ms ease;
}

.path-nav:not(:disabled):hover {
  transform: translateY(-50%) scale(1.08);
}

.path-nav:focus-visible {
  outline: 5px solid rgb(74 130 255 / 28%);
  outline-offset: 3px;
}

.path-nav:disabled {
  opacity: 0;
  pointer-events: none;
}

.path-nav--left {
  left: 12px;
}

.path-nav--right {
  right: 12px;
}

.path-scroll::-webkit-scrollbar {
  display: none;
}

.path-stage {
  position: relative;
  min-width: 1040px;
  min-height: 460px;
  transition: transform 420ms var(--learner-easing-bounce);
}

.path-line {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.path-line polyline {
  fill: none;
  stroke: #dfcda8;
  stroke-width: 16px;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 3 30;
}

.lesson-node {
  position: absolute;
  z-index: 2;
  width: clamp(180px, 23vw, 270px);
  height: 180px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--learner-color-text);
  cursor: pointer;
  transform: translateX(-50%);
}

.lesson-node:disabled {
  cursor: default;
}

.lesson-node:focus-visible {
  outline: none;
}

.lesson-node:focus-visible .lesson-island {
  filter: drop-shadow(0 0 0 #fff) drop-shadow(0 0 8px #326ff0);
}

.lesson-island {
  position: absolute;
  top: 4px;
  left: 50%;
  width: 100%;
  height: auto;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 12px 7px rgb(89 74 38 / 18%));
  transform: translateX(-50%);
  transition: transform 180ms var(--learner-easing-bounce), filter 180ms ease;
}

.lesson-node:not(:disabled):hover .lesson-island {
  filter: brightness(1.05) drop-shadow(0 14px 8px rgb(89 74 38 / 20%));
  transform: translateX(-50%) translateY(-4px) scale(1.035);
}

.lesson-node strong {
  position: absolute;
  top: 128px;
  left: 50%;
  z-index: 6;
  width: max-content;
  max-width: 122%;
  padding: 8px 17px 7px;
  border: 3px solid rgb(255 255 255 / 88%);
  border-radius: 15px;
  background: var(--lesson-category-color, #ff982e);
  box-shadow:
    inset 0 -4px 0 rgb(0 0 0 / 10%),
    0 5px 10px rgb(61 69 91 / 18%);
  color: #fff;
  font-family: var(--learner-font-display);
  font-size: clamp(17px, 1.55vw, 23px);
  font-weight: 900;
  line-height: 1.15;
  text-shadow: 0 2px 0 rgb(0 0 0 / 14%);
  transform: translateX(-50%);
}

.step-number {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 16%;
  width: 48px;
  height: 48px;
  display: grid;
  border: 4px solid #fff;
  border-radius: 50%;
  place-items: center;
  background: #61bc28;
  box-shadow: 0 4px 8px rgb(60 94 30 / 22%);
  color: #fff;
  font-family: var(--learner-font-display);
  font-size: 25px;
  font-weight: 900;
}

.lesson-node--current .step-number { background: #ff9d17; }
.lesson-node--locked .step-number { background: #909390; }

.path-rabbit {
  position: absolute;
  z-index: 5;
  bottom: 101px;
  left: 50%;
  width: clamp(78px, 8vw, 116px);
  height: auto;
  object-fit: contain;
  pointer-events: none;
  transform: translateX(-50%);
  filter: drop-shadow(0 7px 4px rgb(86 63 27 / 18%));
}

@media (max-width: 760px) {
  .curriculum-heading { flex-direction: column; }
  .progress-card { width: 100%; }
  .lesson-node { width: 180px; }
  .path-rabbit { width: 80px; }
  .path-nav {
    width: 48px;
    height: 48px;
    font-size: 40px;
  }
  .path-nav--left { left: 8px; }
  .path-nav--right { right: 8px; }
}

@media (max-height: 800px) and (min-width: 761px) {
  .curriculum-path {
    padding: 16px 28px 26px;
  }

  .curriculum-heading {
    align-items: center;
  }

  .curriculum-heading h1 {
    font-size: clamp(32px, 3.4vw, 46px);
  }

  .curriculum-heading h1 span {
    padding: 7px 14px 6px;
  }

  .progress-card {
    min-width: 260px;
    padding: 11px 17px;
    border-radius: 19px;
  }

  .progress-track {
    height: 11px;
  }

  .path-scroll {
    height: 380px;
    margin-top: 8px;
  }

  .path-stage {
    height: 380px !important;
    min-height: 380px;
  }

  .lesson-node {
    width: 220px;
    height: 150px;
    scale: .84;
    transform-origin: top center;
  }

  .lesson-node strong {
    top: 108px;
    padding: 7px 13px 6px;
    font-size: 18px;
  }

  .step-number {
    width: 42px;
    height: 42px;
    font-size: 22px;
  }

  .path-rabbit {
    bottom: 83px;
    width: 86px;
  }
}
</style>
