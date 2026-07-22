<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IslandMap from '../../components/IslandMap.vue'
import RiveGuideCharacter from '../../components/RiveGuideCharacter.vue'
import StoryLandModal from '../../components/story/StoryLandModal.vue'
import type { MainMapMenuItem } from '../../data/mainMapMenu'
// 메인 섬 페이지 배경: 실사 바다 배경 에셋(리소스 원본 복사)
import seaBackground from '../../assets/map/main_map_sea_background_v2.png'

const router = useRouter()
const selected = ref<string | null>(null)
const activeMenu = ref<MainMapMenuItem['id'] | null>(null)
const showStoryLand = ref(false)
const labels: Record<MainMapMenuItem['id'], string> = {
  growth: '나의 성장',
  game: '이야기 나라',
  letter: '글자 연습',
  challenge: '실력 도전',
}

const handleSelect = (id: MainMapMenuItem['id']) => {
  if (id === 'game') {
    showStoryLand.value = true
    return
  }
  if (id === 'letter') {
    router.push({ name: 'training-home' })
    return
  }
  if (id === 'growth') {
    router.push({ name: 'growth' })
    return
  }
  selected.value = labels[id]
  window.setTimeout(() => { selected.value = null }, 1800)
}
</script>

<template>
  <main class="learner-home" :style="{ backgroundImage: `url(${seaBackground})` }">
    <IslandMap @select="handleSelect" @hover="activeMenu = $event" />
    <RiveGuideCharacter :active-menu="activeMenu" />
    <Transition name="modal">
      <StoryLandModal v-if="showStoryLand" @close="showStoryLand = false" />
    </Transition>
    <Transition name="toast">
      <p v-if="selected" class="toast">{{ selected }} 메뉴로 이동할게요!</p>
    </Transition>
  </main>
</template>

<style scoped>
.learner-home{position:relative;height:100%;display:grid;place-items:center;overflow:hidden;background-position:center;background-size:cover;background-repeat:no-repeat}.toast{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:30;margin:0;padding:var(--learner-space-3) var(--learner-space-6);border-radius:var(--learner-radius-pill);background:var(--learner-color-text);color:var(--learner-color-text-inverse);font-family:var(--learner-font-display);font-size:var(--learner-font-size-body);font-weight:var(--learner-font-weight-bold);box-shadow:var(--learner-shadow-card)}.toast-enter-active,.toast-leave-active,.modal-enter-active,.modal-leave-active{transition:opacity var(--learner-duration-normal) var(--learner-easing-standard)}.toast-enter-from,.toast-leave-to{opacity:0;transform:translate(-50%,10px)}.modal-enter-from,.modal-leave-to{opacity:0}@media(max-width:800px){.learner-home{display:block;overflow:auto}}
</style>
