<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AssessmentSpeechCapture from '../components/AssessmentSpeechCapture.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem, AssessmentTechnicalError } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const traceCompleted = ref(false)
const gazeSamples = ref(0)
const transcript = ref('')
const confidence = ref<number | null>(null)
const technicalError = ref<AssessmentTechnicalError | null>(null)
const canSubmit = computed(() => (traceCompleted.value && Boolean(transcript.value)) || Boolean(technicalError.value))
watch(() => props.item.id, () => { traceCompleted.value = false; gazeSamples.value = 0; transcript.value = ''; confidence.value = null; technicalError.value = null })
const markTrace = () => { traceCompleted.value = true; gazeSamples.value += 1 }
const captured = (value: string, score: number | null) => { transcript.value = value; confidence.value = score }
const unavailable = () => { technicalError.value = { code: 'SPEECH_EVALUATOR_UNAVAILABLE', message: '음성 인식 기능을 사용할 수 없어 결과에서 제외합니다.' } }
const submit = () => emit('submit', {
  payload: { kind: 'gaze-speech', transcript: transcript.value, confidence: confidence.value, traceCompleted: traceCompleted.value, gazeSamples: gazeSamples.value },
  modality: 'gaze', replayCount: 0, technicalError: technicalError.value,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <p>글자를 눈으로 따라간 뒤, 소리를 말해 주세요.</p>
    <button class="trace-card" :class="{ complete: traceCompleted }" type="button" @pointerenter="gazeSamples++" @focus="gazeSamples++" @click="markTrace">
      <span>{{ item.prompt.traceGlyph }}</span>
      <small>{{ traceCompleted ? '따라가기 완료' : '눈으로 따라간 뒤 눌러 주세요' }}</small>
    </button>
    <AssessmentSpeechCapture @captured="captured" @unavailable="unavailable" />
    <AssessmentSubmitButton :disabled="!canSubmit" label="말하기 완료" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:16px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.activity>p{margin:-6px 0 0;color:#527183;font-size:18px}.trace-card{display:grid;width:min(330px,72vw);height:260px;place-content:center;gap:8px;border:5px dashed #6ea3c1;border-radius:30px;background:#fff;color:#173d57}.trace-card span{font-size:140px;font-weight:900;line-height:1}.trace-card small{font-size:15px;font-weight:800}.trace-card.complete{border-style:solid;border-color:#36a96b;background:#effaf3}
</style>


