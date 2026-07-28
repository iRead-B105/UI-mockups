<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LearnerHeader from '../components/layout/LearnerHeader.vue'
import { getCachedStudent } from '@/services/learnerDataRepository'

const route = useRoute()
const hideHeader = computed(() => route.meta.hideLearnerHeader === true)
const activeStudent = computed(() => getCachedStudent())
</script>

<template>
  <div class="learner-layout">
    <LearnerHeader
      v-if="!hideHeader"
      :user-name="activeStudent.name"
    />
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

<style scoped src="@/styles/common/LearnerLayout.css"></style>
