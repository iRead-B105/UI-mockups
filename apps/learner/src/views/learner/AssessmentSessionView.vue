<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AssessmentHeader from '@/features/assessment/components/AssessmentHeader.vue'
import AssessmentInstructionButton from '@/features/assessment/components/AssessmentInstructionButton.vue'
import AssessmentPauseDialog from '@/features/assessment/components/AssessmentPauseDialog.vue'
import NeutralFeedback from '@/features/assessment/components/NeutralFeedback.vue'
import GazeTraceAssessment from '@/features/assessment/activities/GazeTraceAssessment.vue'
import LetterBuildAssessment from '@/features/assessment/activities/LetterBuildAssessment.vue'
import ReadingAssessment from '@/features/assessment/activities/ReadingAssessment.vue'
import ShortTextAssessment from '@/features/assessment/activities/ShortTextAssessment.vue'
import SoundChoiceAssessment from '@/features/assessment/activities/SoundChoiceAssessment.vue'
import SoundOmitAssessment from '@/features/assessment/activities/SoundOmitAssessment.vue'
import SoundReplaceAssessment from '@/features/assessment/activities/SoundReplaceAssessment.vue'
import { useAssessmentSession } from '@/features/assessment/composables/useAssessmentSession'
import { assessmentPolicy } from '@/features/assessment/config/assessment-policy'
import type { AssessmentActivitySubmission, AssessmentItemType } from '@/features/assessment/types'

const router = useRouter()
const showPauseDialog = ref(false)
const instructionRepeatCount = ref(0)
const {
  session,
  currentItem,
  progressPercent,
  isNeutralFeedbackVisible,
  pendingAdvance,
  load,
  start,
  resume,
  pause,
  stopByLearner,
  submit,
  nextItem,
  skipCurrentItemForMock,
} = useAssessmentSession()

const activityByType = {
  'gaze-trace': GazeTraceAssessment,
  'sound-choice': SoundChoiceAssessment,
  'letter-build': LetterBuildAssessment,
  'sound-omit': SoundOmitAssessment,
  'sound-replace': SoundReplaceAssessment,
  reading: ReadingAssessment,
  'short-text': ShortTextAssessment,
} satisfies Record<AssessmentItemType, unknown>
const activeComponent = computed(() => currentItem.value ? activityByType[currentItem.value.itemType] : null)
watch(() => currentItem.value?.id, () => { instructionRepeatCount.value = 0 })

onMounted(() => {
  load()
  if (!session.value) {
    router.replace({ name: 'assessment-intro' })
    return
  }
  if (session.value.status === 'ready') start()
  else if (session.value.status !== 'in_progress' && session.value.status !== 'completed') resume()
})

watch(() => session.value?.status, (status) => {
  if (status === 'completed') router.replace({ name: 'assessment-complete' })
})

const handleSubmission = (submission: AssessmentActivitySubmission) => {
  submit(submission.payload, submission.modality, {
    replayCount: submission.replayCount,
    instructionRepeatCount: instructionRepeatCount.value,
    technicalError: submission.technicalError,
  })
}

const handleMockNext = () => {
  skipCurrentItemForMock()
}

const takeBreak = () => { pause(); showPauseDialog.value = false; router.push({ name: 'learner-home' }) }
const stop = () => { stopByLearner(); showPauseDialog.value = false; router.push({ name: 'learner-home' }) }
</script>

<template>
  <main class="assessment-session">
    <AssessmentHeader :progress-percent="progressPercent" @home="showPauseDialog = true" />
    <div class="activity-stage" :aria-busy="pendingAdvance">
      <div v-if="currentItem && activeComponent" class="activity-content">
        <AssessmentInstructionButton
          :text="[currentItem.prompt.instruction, currentItem.prompt.subInstruction].filter(Boolean).join(' ')"
          :repeat-count="instructionRepeatCount"
          @repeated="instructionRepeatCount++"
        />
        <component :is="activeComponent" :key="currentItem.id" :item="currentItem" @submit="handleSubmission" />
        <aside v-if="assessmentPolicy.mockNavigationEnabled" class="mock-navigation">
          <span>입력 기능을 연결하기 전 사용하는 목업 이동입니다.</span>
          <button type="button" :disabled="pendingAdvance" @click="handleMockNext">다음으로</button>
        </aside>
      </div>
      <p v-else class="loading">다음 활동을 준비하고 있어요…</p>
    </div>
    <NeutralFeedback v-if="isNeutralFeedbackVisible" @next="nextItem" />
    <AssessmentPauseDialog v-if="showPauseDialog" @continue="showPauseDialog = false" @pause="takeBreak" @stop="stop" />
  </main>
</template>

<style scoped>
.assessment-session{height:100dvh;display:grid;background:linear-gradient(180deg,#eaf8ff 0%,#f8fcff 100%);font-family:var(--learner-font-reading);grid-template-rows:auto minmax(0,1fr)}.activity-stage{display:grid;place-items:center;overflow:auto;padding:32px}.activity-content{display:grid;width:min(980px,100%);gap:12px}.mock-navigation{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:8px;padding:12px 16px;border:2px dashed #9eb3c0;border-radius:16px;background:#f4f7f9;color:#526b79}.mock-navigation span{font-size:13px;font-weight:700}.mock-navigation button{min-width:130px;min-height:46px;border:0;border-radius:14px;background:#2776a8;color:#fff;font-size:16px;font-weight:900}.mock-navigation button:disabled{background:#aebbc3}.loading{color:#456779;font-size:20px;font-weight:800}@media(max-height:720px){.activity-stage{align-items:start;padding:22px}}@media(max-width:700px){.mock-navigation{align-items:stretch;flex-direction:column;text-align:center}}
</style>

