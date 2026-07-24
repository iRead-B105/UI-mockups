<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LearnerHelpButton from '../components/common/LearnerHelpButton.vue'
import LearnerHeader from '../components/layout/LearnerHeader.vue'
import { useLearnerAccessSession } from '../composables/useLearnerAccessSession'
import { useVillageDecoration } from '../composables/useVillageDecoration'
import seaBackground from '../assets/main-map-sea-flat-vector-v4.png'

type LearnerEmotion = 'playful' | 'calm' | 'balanced'

const route = useRoute()
const { points } = useVillageDecoration()
const { selectedStudent } = useLearnerAccessSession()
const hideHeader = computed(() => route.meta.hideLearnerHeader === true)
const showLearnerHelp = computed(() => route.meta.showLearnerHelp === true)
const isHome = computed(() => route.name === 'learner-home')
const learnerEmotion = computed<LearnerEmotion>(() => {
  const value = route.meta.learnerEmotion
  return value === 'calm' || value === 'balanced' ? value : 'playful'
})
const helpContextLabel = computed(() => {
  if (String(route.name).startsWith('assessment')) return '실력 도전'
  if (String(route.name).startsWith('training')) return '글자 연습'
  return '학습'
})
const homeBackgroundStyle = computed(() => (
  isHome.value ? { backgroundImage: `url(${seaBackground})` } : undefined
))

const requestTeacherHelp = async () => {
  window.dispatchEvent(new CustomEvent('iread:help-request', {
    detail: {
      routeName: String(route.name ?? ''),
      path: route.fullPath,
      requestedAt: new Date().toISOString(),
    },
  }))
}
</script>

<template>
  <div
    class="learner-layout"
    :class="{ 'learner-layout--home': isHome }"
    :style="homeBackgroundStyle"
    :data-learner-emotion="learnerEmotion"
  >
    <LearnerHeader
      v-if="!hideHeader"
      :user-name="selectedStudent?.name ?? '학습자'"
      :stars="route.name === 'growth' ? points : undefined"
      :variant="route.name === 'learner-home' ? 'home' : 'default'"
    />
    <div class="learner-page" :class="{ 'learner-page--full': hideHeader }">
      <RouterView />
    </div>
    <LearnerHelpButton
      v-if="showLearnerHelp"
      :key="route.fullPath"
      :context-label="helpContextLabel"
      :request-help="requestTeacherHelp"
    />
  </div>
</template>

<style scoped>
.learner-layout {
  min-height: 100dvh;
  overflow: hidden;
  background: var(--learner-background);
  color: var(--learner-color-text);
  font-family: var(--learner-font-reading);
}

.learner-layout--home {
  background-color: var(--learner-home-sea);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.learner-page {
  height: calc(100dvh - var(--learner-header-height));
  min-height: 0;
}

.learner-page--full {
  height: 100dvh;
}

@media (max-width: 960px), (max-height: 640px) {
  .learner-layout {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .learner-page {
    height: auto;
    min-height: calc(100dvh - var(--learner-header-height));
  }

  .learner-page--full {
    min-height: 100dvh;
  }
}
</style>
