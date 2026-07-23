<script setup lang="ts">
import { ref, watch } from 'vue'
import AssessmentSpeechCapture from '../components/AssessmentSpeechCapture.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem, AssessmentTechnicalError } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const transcript = ref('')
const confidence = ref<number | null>(null)
const technicalError = ref<AssessmentTechnicalError | null>(null)
watch(() => props.item.id, () => { transcript.value = ''; confidence.value = null; technicalError.value = null })
const captured = (value: string, score: number | null) => { transcript.value = value; confidence.value = score; technicalError.value = null }
const unavailable = () => { technicalError.value = { code: 'SPEECH_EVALUATOR_UNAVAILABLE', message: '음성 인식 기능을 사용할 수 없어 결과에서 제외합니다.' } }
const submit = () => emit('submit', {
  payload: { kind: 'speech', transcript: transcript.value, confidence: confidence.value },
  modality: 'voice', replayCount: 0, technicalError: technicalError.value,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <div class="reading-card">
      <template v-if="item.prompt.readingTokens?.length">
        <span v-for="token in item.prompt.readingTokens" :key="token">{{ token }}</span>
      </template>
      <span v-else>{{ item.prompt.displayText }}</span>
    </div>
    <AssessmentSpeechCapture @captured="captured" @unavailable="unavailable" />
    <AssessmentSubmitButton :disabled="!transcript && !technicalError" label="말하기 완료" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:22px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.reading-card{display:flex;max-width:820px;flex-wrap:wrap;justify-content:center;gap:18px;padding:30px 38px;border:4px solid #bdd6e5;border-radius:28px;background:#fff;box-shadow:0 8px 0 #dceaf1}.reading-card span{color:#173d57;font-size:clamp(28px,4vw,46px);font-weight:900;line-height:1.5}
</style>


