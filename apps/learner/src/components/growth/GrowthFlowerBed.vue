<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  image: string
  stage: number
  isGrowing: boolean
  depth: 'back' | 'front'
}>()

const emit = defineEmits<{ grow: [] }>()
</script>

<template>
  <button
    class="flower-bed"
    type="button"
    :class="[
      `flower-bed--${depth}`,
      { 'flower-bed--growing': isGrowing, 'flower-bed--complete': stage === 5 },
    ]"
    :aria-label="`${title} 꽃밭 ${stage}단계. 눌러서 꽃밭 키우기`"
    @click="emit('grow')"
  >
    <span class="field-sign">
      <span class="field-icon" aria-hidden="true">{{ icon }}</span>
      <strong>{{ title }}</strong>
      <span class="stage-chip">{{ stage }}/5</span>
    </span>

    <Transition name="field-grow" mode="out-in">
      <img :key="image" class="field-image" :src="image" alt="" />
    </Transition>

    <span class="growth-hint">{{ stage === 5 ? '활짝 피었어요!' : '눌러서 키우기' }}</span>
    <span class="sparkles" aria-hidden="true"><i>✦</i><i>✿</i><i>✦</i></span>
  </button>
</template>

<style scoped>
.flower-bed {
  --depth-scale: 1;
  --depth-shift: 0%;
  --depth-y: 0px;
  position: relative;
  min-width: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 8px 8px rgb(63 100 28 / 16%));
  transform: translateX(var(--depth-shift)) translateY(var(--depth-y)) scale(var(--depth-scale));
  transition: transform 180ms var(--learner-easing-standard), filter 180ms ease;
}

.flower-bed--back { --depth-scale: .84; --depth-y: 20px; }
.flower-bed--back:nth-child(odd) { --depth-shift: 8%; }
.flower-bed--back:nth-child(even) { --depth-shift: -8%; }
.flower-bed--front { --depth-scale: 1.04; --depth-y: 10px; }
.flower-bed--front:nth-child(odd) { --depth-shift: -1.5%; }
.flower-bed--front:nth-child(even) { --depth-shift: 1.5%; }

.flower-bed:hover,
.flower-bed:focus-visible {
  z-index: 3;
  outline: none;
  filter: drop-shadow(0 12px 10px rgb(63 100 28 / 24%));
  transform: translateX(var(--depth-shift)) translateY(calc(var(--depth-y) - 7px)) scale(calc(var(--depth-scale) + .035));
}

.flower-bed:focus-visible .field-sign {
  outline: none;
  text-shadow:
    0 2px 4px rgb(0 0 0 / 40%),
    0 0 12px rgb(0 0 0 / 30%),
    0 0 20px rgb(255 255 255 / 20%),
    0 0 30px var(--learner-color-primary);
}

.field-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.field-sign {
  position: absolute;
  z-index: 4;
  top: 2%;
  left: 50%;
  min-width: 56%;
  height: clamp(42px, 6.1vh, 66px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(5px, .7vw, 10px);
  padding: 0 clamp(10px, 1.2vw, 18px);
  border: none;
  border-radius: 20px;
  background: transparent;
  color: white;
  transform: translateX(-50%);
  white-space: nowrap;
  text-shadow:
    0 2px 4px rgb(0 0 0 / 40%),
    0 0 12px rgb(0 0 0 / 30%),
    0 0 20px rgb(255 255 255 / 20%);
}

.field-sign::after {
  display: none;
}

.field-icon { font-size: clamp(24px, 2.5vw, 36px); line-height: 1; filter: drop-shadow(0 2px 4px rgb(0 0 0 / 50%)); }
.field-sign strong { font-family: var(--learner-font-display);font-size:clamp(18px,2vw,32px);font-weight:var(--learner-font-weight-heavy);letter-spacing:0.05em; }
.stage-chip { display:grid;place-items:center;min-width:30px;height:26px;padding:0 7px;border-radius:12px;background:rgb(255 255 255 / 90%);color:#4d80e9;font-size:clamp(11px,1.2vw,14px);font-weight:900;box-shadow:0 2px 8px rgb(0 0 0 / 20%); }

.growth-hint {
  position: absolute;
  z-index: 5;
  right: 10%;
  bottom: 11%;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgb(255 255 255 / 88%);
  color: #61733a;
  font-size: clamp(10px, .9vw, 13px);
  font-weight: 800;
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 160ms ease, transform 160ms ease;
}

.flower-bed:hover .growth-hint,
.flower-bed:focus-visible .growth-hint { opacity: 1;transform: translateY(0); }

.sparkles { position:absolute;z-index:7;inset:22% 12% 18%;pointer-events:none;opacity:0; }
.sparkles i { position:absolute;color:#fff8a7;font-size:clamp(18px,2vw,30px);font-style:normal;text-shadow:0 2px 6px #f2a52d; }
.sparkles i:nth-child(1) { left:8%;top:25%; }.sparkles i:nth-child(2) { left:48%;top:3%; }.sparkles i:nth-child(3) { right:5%;top:42%; }
.flower-bed--growing .sparkles { animation:sparkle-burst 650ms ease-out both; }
.flower-bed--growing { animation:bed-bounce 540ms var(--learner-easing-bounce); }
.flower-bed--complete .stage-chip { background:#77bb4b;color:#fff; }

.field-grow-enter-active,.field-grow-leave-active { transition:opacity 180ms ease,transform 300ms var(--learner-easing-bounce); }
.field-grow-enter-from { opacity:0;transform:scale(.86); }.field-grow-leave-to { position:absolute;inset:0;opacity:0;transform:scale(1.05); }

@keyframes bed-bounce { 0%,100%{transform:translateX(var(--depth-shift)) translateY(var(--depth-y)) scale(var(--depth-scale))} 45%{transform:translateX(var(--depth-shift)) translateY(calc(var(--depth-y) - 7px)) scale(calc(var(--depth-scale) + .045))} }
@keyframes sparkle-burst { 0%{opacity:0;transform:scale(.5)} 35%{opacity:1} 100%{opacity:0;transform:scale(1.22) translateY(-12px)} }

@media (prefers-reduced-motion: reduce) {
  .flower-bed,.flower-bed--growing,.sparkles,.field-grow-enter-active,.field-grow-leave-active { animation:none;transition:none; }
}
</style>
