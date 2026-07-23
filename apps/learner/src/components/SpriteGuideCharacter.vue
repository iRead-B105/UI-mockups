<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import bookSpriteUrl from '../assets/character/pink-rabbit-book-16-aligned.png'
import idleSpriteUrl from '../assets/character/pink-rabbit-idle-16-aligned.png'
import walkSpriteUrl from '../assets/character/pink-rabbit-walk-16-aligned.png'
import waveSpriteUrl from '../assets/character/pink-rabbit-wave-16-aligned.png'
import type { MainMapMenuItem } from '../data/mainMapMenu'

const props = withDefaults(
  defineProps<{
    activeMenu?: MainMapMenuItem['id'] | null
    message?: string
    mood?: 'idle' | 'cheer'
  }>(),
  { activeMenu: null, mood: 'idle' },
)

type BunnyAnimation = 'idle' | 'wave' | 'walk' | 'book'

const frameCount = 16
const animations: Record<BunnyAnimation, { sprite: string; interval: number }> = {
  idle: { sprite: idleSpriteUrl, interval: 110 },
  wave: { sprite: waveSpriteUrl, interval: 85 },
  walk: { sprite: walkSpriteUrl, interval: 80 },
  book: { sprite: bookSpriteUrl, interval: 105 },
}

const menuMessages: Record<MainMapMenuItem['id'], string> = {
  growth: '얼마나 열심히 했는지\n확인하러 가볼까?',
  game: '재미있는 이야기를\n만나러 가볼까?',
  letter: '오늘도 열심히\n연습해보자!',
  challenge: '얼마나 잘해졌나\n확인해보자!',
}

const isCompanion = computed(() => props.message !== undefined)
const ready = ref(false)
const hovered = ref(false)
const reducedMotion = ref(false)
const animation = ref<BunnyAnimation>('idle')
const animationStep = ref(0)
let frameTimer: ReturnType<typeof setInterval> | undefined
let cheerTimer: ReturnType<typeof setTimeout> | undefined
let motionQuery: MediaQueryList | undefined

const bubbleMessage = computed(() => {
  if (isCompanion.value) return props.message ?? '힘내요!'
  if (hovered.value) return '안녕~~'
  if (props.activeMenu) return menuMessages[props.activeMenu]
  return '윤정아!\n오늘도 화이팅!'
})

const currentFrame = computed(() => {
  return animationStep.value % frameCount
})

const spriteStyle = computed(() => {
  const column = currentFrame.value % 4
  const row = Math.floor(currentFrame.value / 4)
  return {
    backgroundImage: `url(${animations[animation.value].sprite})`,
    backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
  }
})

const startFrameClock = () => {
  clearInterval(frameTimer)
  animationStep.value = 0
  if (reducedMotion.value) return
  frameTimer = setInterval(() => {
    animationStep.value = (animationStep.value + 1) % frameCount
  }, animations[animation.value].interval)
}

const playAnimation = (next: BunnyAnimation) => {
  if (animation.value === next && frameTimer) return
  animation.value = next
  startFrameClock()
}

const baseAnimation = (): BunnyAnimation => {
  if (isCompanion.value) return 'idle'
  if (props.activeMenu === 'growth' || props.activeMenu === 'game') return 'walk'
  if (props.activeMenu === 'letter' || props.activeMenu === 'challenge') return 'book'
  return 'idle'
}

const restoreBaseAnimation = () => {
  if (!hovered.value) playAnimation(baseAnimation())
}

const enter = () => {
  hovered.value = true
  clearTimeout(cheerTimer)
  playAnimation('wave')
}

const leave = () => {
  hovered.value = false
  restoreBaseAnimation()
}

const handleMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => {
  reducedMotion.value = event.matches
  startFrameClock()
}

watch(() => props.activeMenu, restoreBaseAnimation)
watch(
  () => props.mood,
  (mood) => {
    if (!isCompanion.value || hovered.value) return
    clearTimeout(cheerTimer)
    if (mood === 'cheer') {
      playAnimation('wave')
      cheerTimer = setTimeout(restoreBaseAnimation, 1500)
    } else {
      restoreBaseAnimation()
    }
  },
)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  handleMotionPreference(motionQuery)
  motionQuery.addEventListener('change', handleMotionPreference)

  const spriteUrls = Object.values(animations).map(({ sprite }) => sprite)
  Promise.all(
    spriteUrls.map((sprite) => new Promise<void>((resolve) => {
      const image = new Image()
      image.onload = () => resolve()
      image.onerror = () => resolve()
      image.src = sprite
    })),
  ).then(() => { ready.value = true })
  playAnimation(baseAnimation())
})

onBeforeUnmount(() => {
  clearInterval(frameTimer)
  clearTimeout(cheerTimer)
  motionQuery?.removeEventListener('change', handleMotionPreference)
})
</script>

<template>
  <div class="guide" :class="{ ready }">
    <div
      class="bubble"
      :role="isCompanion ? 'status' : undefined"
      :aria-live="isCompanion ? 'polite' : undefined"
    >{{ bubbleMessage }}</div>
    <div class="bunny" :style="spriteStyle" aria-hidden="true"></div>
    <button
      class="bunny-hit"
      type="button"
      aria-label="토리 토끼에게 인사하기"
      @pointerenter="enter"
      @pointerleave="leave"
      @focus="enter"
      @blur="leave"
    ></button>
  </div>
</template>

<style scoped>
.guide {
  position: absolute;
  z-index: 18;
  right: 0;
  bottom: -1%;
  width: clamp(230px, 20vw, 320px);
  aspect-ratio: 1;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity var(--learner-duration-slow) var(--learner-easing-standard),
    transform var(--learner-duration-slow) var(--learner-easing-standard);
  pointer-events: none;
}

.guide.ready {
  opacity: 1;
  transform: translateY(0);
}

.bunny {
  position: absolute;
  z-index: 2;
  inset: 0;
  background-repeat: no-repeat;
  background-size: 400% 400%;
  pointer-events: none;
  transition: transform 180ms ease-out;
  will-change: background-position, transform;
}

.bunny-hit {
  position: absolute;
  z-index: 4;
  inset: 8% 11% 4%;
  border: 0;
  outline: none;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
}

.guide:has(.bunny-hit:hover) .bunny,
.guide:has(.bunny-hit:focus-visible) .bunny {
  transform: translateY(-5px);
}

.bunny-hit:focus-visible {
  filter: drop-shadow(0 0 8px #fff) drop-shadow(0 0 5px var(--learner-color-primary));
}

.bubble {
  position: absolute;
  z-index: 3;
  right: 92%;
  bottom: 46%;
  width: clamp(205px, 18vw, 270px);
  padding: var(--learner-space-5);
  border-radius: var(--learner-radius-large);
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(18px, 1.65vw, 25px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.35;
  text-align: center;
  white-space: pre-line;
  box-shadow: var(--learner-shadow-card);
  pointer-events: none;
}

.bubble::after {
  content: '';
  position: absolute;
  right: -25px;
  bottom: 20px;
  border: 16px solid transparent;
  border-left-color: var(--learner-color-surface);
  transform: rotate(16deg);
}

@media (max-width: 900px) {
  .guide { right: -3%; width: 250px; }
  .bubble { right: 82%; }
}

@media (prefers-reduced-motion: reduce) {
  .guide,
  .bunny { transition: opacity 100ms linear; }

  .guide:has(.bunny-hit:hover) .bunny,
  .guide:has(.bunny-hit:focus-visible) .bunny { transform: none; }
}
</style>
