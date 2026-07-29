<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LearnerHeader from '../components/layout/LearnerHeader.vue'
import GazeCalibrationModal from '../components/common/GazeCalibrationModal.vue'
import { useGazeCalibration } from '../composables/useGazeCalibration'
import { getCachedStudent } from '@/services/learnerDataRepository'

const route = useRoute()
const hideHeader = computed(() => route.meta.hideLearnerHeader === true)
const activeStudent = computed(() => getCachedStudent())
const { isOpen: isGazeCalibrationOpen, close: closeGazeCalibration } = useGazeCalibration()
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

    <GazeCalibrationModal v-if="isGazeCalibrationOpen" @close="closeGazeCalibration" />
  </div>
</template>

<style scoped src="@/styles/common/LearnerLayout.css"></style>
