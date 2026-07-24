<script setup lang="ts">
import { ref } from 'vue'
import RegionLabel from './RegionLabel.vue'
import { mainMapMenu, type MainMapMenuItem } from '../data/mainMapMenu'
import islandMain from '../assets/map/island-hover-base.png'
import growthMap from '../assets/map/island-hover-growth.png'
import gameMap from '../assets/map/island-hover-story.png'
import letterMap from '../assets/map/island-hover-training.png'
import challengeMap from '../assets/map/island-hover-skill.png'

const emit = defineEmits<{
  select: [id: MainMapMenuItem['id']]
  hover: [id: MainMapMenuItem['id'] | null]
}>()
const activePart = ref<MainMapMenuItem['id'] | null>(null)
const parts: Array<{ id: MainMapMenuItem['id']; label: string; src: string }> = [
  { id: 'growth', label: '나의 성장', src: growthMap },
  { id: 'game', label: '이야기 나라', src: gameMap },
  { id: 'letter', label: '글자 연습', src: letterMap },
  { id: 'challenge', label: '실력 도전', src: challengeMap },
]

const setActivePart = (id: MainMapMenuItem['id'] | null) => {
  activePart.value = id
  emit('hover', id)
}
</script>

<template>
  <div class="map-stage">
    <img class="island-main" :src="islandMain" alt="네 가지 학습 지역으로 이루어진 아이리드 섬" />
    <img
      v-for="part in parts"
      v-show="activePart === part.id"
      :key="part.id"
      class="part-image"
      :class="`part-${part.id}`"
      :src="part.src"
      alt=""
    />

    <button
      v-for="part in parts"
      :key="`${part.id}-hit`"
      type="button"
      class="part-hit"
      :class="`hit-${part.id}`"
      :aria-label="`${part.label} 지역 열기`"
      @pointerenter="setActivePart(part.id)"
      @pointerleave="setActivePart(null)"
      @focus="setActivePart(part.id)"
      @blur="setActivePart(null)"
      @click="emit('select', part.id)"
    ></button>

    <RegionLabel
      v-for="item in mainMapMenu"
      :key="item.id"
      :text="item.label"
      :color="item.color"
      :active="activePart === item.id"
      :class="`${item.id}-label`"
      :style="{ left: item.position.left, top: item.position.top }"
    />
  </div>
</template>

<style scoped>
.map-stage{position:relative;width:min(1260px,94vw,calc(var(--learner-page-height) * 1.5));max-height:100%;aspect-ratio:3/2;margin:auto}.island-main,.part-image{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}.island-main{z-index:3}.part-image{z-index:4;animation:region-pop var(--learner-duration-normal) var(--learner-easing-standard) both;filter:drop-shadow(0 12px 7px rgba(39,77,101,.2))}@keyframes region-pop{from{opacity:.75;transform:translateY(0) scale(1)}to{opacity:1;transform:translateY(-.7%) scale(1.022)}}.part-growth{transform-origin:27% 49%}.part-game{transform-origin:51% 27%}.part-letter{transform-origin:75% 49%}.part-challenge{transform-origin:51% 72%}.part-hit{position:absolute;z-index:8;inset:0;width:100%;height:100%;border:0;outline:none;background:transparent;cursor:pointer}.hit-growth{clip-path:polygon(5% 25%,36% 21%,47% 48%,38% 76%,20% 92%,5% 73%)}.hit-game{clip-path:polygon(28% 12%,69% 12%,72% 37%,60% 55%,44% 58%,30% 46%)}.hit-letter{clip-path:polygon(63% 27%,89% 27%,96% 51%,88% 74%,67% 77%,57% 52%)}.hit-challenge{clip-path:polygon(28% 50%,57% 52%,73% 72%,67% 91%,47% 97%,24% 86%,17% 68%)}.part-hit:focus-visible{box-shadow:inset 0 0 0 5px #fff}@media(max-width:820px){.map-stage{width:min(1150px,138vw,calc(var(--learner-page-height) * 1.5));left:0}}@media(prefers-reduced-motion:reduce){.part-image{animation:none}}
</style>
