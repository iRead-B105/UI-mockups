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
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :class="{ 'learner-screen-with-header': !hideHeader }"
        />
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.learner-layout {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: var(--learner-background);
  color: var(--learner-color-text);
  font-family: var(--learner-font-reading);
}

.learner-page {
  position: relative;
  z-index: 0;
  height: 100dvh;
  min-height: 0;
  box-sizing: border-box;
  padding-top: 0;
}

.learner-page--full {
  height: 100dvh;
  padding-top: 0;
}

:deep(.learner-screen-with-header) {
  box-sizing: border-box;
  padding-top: var(--learner-header-height) !important;
}
</style>
