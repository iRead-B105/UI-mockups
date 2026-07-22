<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text: string
  color: string
  active?: boolean
}>()

const displayText = computed(() => props.text.replaceAll(' ', '\u2009'))
</script>

<template>
  <div class="region-label" :class="{ 'is-active': active }" :style="{ '--label-color': color }" aria-hidden="true">
    <svg class="region-label-svg" viewBox="0 0 300 96" role="presentation">
      <text class="region-label-text" x="150" y="66" text-anchor="middle">{{ displayText }}</text>
    </svg>
  </div>
</template>

<style scoped>
.region-label {
  --label-color: #4b78e6;
  position: absolute;
  z-index: 12;
  width: clamp(190px, 18vw, 290px);
  aspect-ratio: 300 / 96;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.region-label-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform-origin: center bottom;
  transition: transform 180ms ease;
  filter: drop-shadow(0 5px 4px rgb(48 69 108 / 18%));
  will-change: transform;
}

.region-label-text {
  fill: var(--label-color);
  stroke: #fff;
  stroke-width: 22px;
  stroke-linejoin: round;
  stroke-linecap: round;
  paint-order: stroke fill;
  font-family: 'Jua', 'Dongle', var(--learner-font-display), 'Noto Sans KR', sans-serif;
  font-size: 58px;
  font-weight: 900;
  letter-spacing: -0.085em;
}

.region-label.is-active .region-label-svg {
  animation: region-label-pop 300ms cubic-bezier(.34, 1.56, .64, 1) both;
}

@keyframes region-label-pop {
  0% { transform: translateY(0) scale(1); }
  45% { transform: translateY(-8px) scale(1.09); }
  72% { transform: translateY(-3px) scale(1.025); }
  100% { transform: translateY(-5px) scale(1.05); }
}

@media (prefers-reduced-motion: reduce) {
  .region-label-svg { animation: none !important; transition: transform 120ms ease; }
  .region-label.is-active .region-label-svg { transform: translateY(-2px) scale(1.03); }
}
</style>
