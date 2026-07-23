<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LearnerHeader from '../components/layout/LearnerHeader.vue'
import { useVillageDecoration } from '../composables/useVillageDecoration'

const route = useRoute()
const { points } = useVillageDecoration()
const hideHeader = computed(() => route.meta.hideLearnerHeader === true)
</script>

<template>
  <div class="learner-layout">
    <LearnerHeader v-if="!hideHeader" user-name="윤정" :stars="route.name === 'growth' ? points : undefined" />
    <div class="learner-page" :class="{ 'learner-page--full': hideHeader }">
      <RouterView />
    </div>
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

.learner-page {
  height: calc(100dvh - var(--learner-header-height));
  min-height: 0;
}

.learner-page--full {
  height: 100dvh;
}
</style>
