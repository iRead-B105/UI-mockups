<script setup lang="ts">
import { ref } from 'vue'
import RegionLabel from './RegionLabel.vue'
import { mainMapMenu, type MainMapMenuItem } from '../data/mainMapMenu'
import islandMain from '../assets/map/island-main-fixed.png'
import growthMap from '../assets/map/island-growth-fixed.png'
import gameMap from '../assets/map/island-game-fixed.png'
import letterMap from '../assets/map/island-letter-fixed.png'
import challengeMap from '../assets/map/island-challenge-fixed.png'

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
    <div class="cloud cloud-left"></div>
    <div class="cloud cloud-right"></div>

    <img class="island-main" :src="islandMain" alt="네 가지 학습 지역으로 이루어진 아이리드 섬" />
    <img v-for="part in parts" v-show="activePart === part.id" :key="part.id" class="part-image" :class="`part-${part.id}`" :src="part.src" alt="" />

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
.map-stage{position:relative;width:min(1260px,94vw,calc((100vh - 86px) * 1.78));aspect-ratio:3/2;margin:auto}.island-main,.part-image{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none}.island-main{z-index:3}.part-image{z-index:7;animation:region-lift var(--learner-duration-normal) var(--learner-easing-standard) both;filter:drop-shadow(0 15px 8px #31527838) brightness(1.04)}@keyframes region-lift{from{transform:translateY(0) scale(1)}to{transform:translateY(-1.1%) scale(1.025)}}.part-growth{transform-origin:28% 51%}.part-game{transform-origin:51% 31%}.part-letter{transform-origin:72% 49%}.part-challenge{transform-origin:51% 70%}.part-hit{position:absolute;z-index:8;inset:0;width:100%;height:100%;border:0;outline:none;background:transparent;cursor:pointer}.hit-growth{clip-path:polygon(5% 25%,36% 21%,47% 48%,38% 76%,20% 92%,5% 73%)}.hit-game{clip-path:polygon(28% 12%,69% 12%,72% 37%,60% 55%,44% 58%,30% 46%)}.hit-letter{clip-path:polygon(63% 27%,89% 27%,96% 51%,88% 74%,67% 77%,57% 52%)}.hit-challenge{clip-path:polygon(28% 50%,57% 52%,73% 72%,67% 91%,47% 97%,24% 86%,17% 68%)}.part-hit:focus-visible{box-shadow:inset 0 0 0 5px #fff}.cloud{position:absolute;z-index:1;width:11%;height:5%;border-radius:999px;background:#fff;opacity:.92}.cloud::before,.cloud::after{content:'';position:absolute;bottom:0;border-radius:50%;background:#fff}.cloud::before{left:13%;width:50%;height:160%}.cloud::after{right:12%;width:42%;height:115%}.cloud-left{left:-5%;top:18%}.cloud-right{right:-4%;top:13%;transform:scale(.85)}@media(max-width:820px){.map-stage{width:min(1150px,138vw);left:-18vw}}
</style>
