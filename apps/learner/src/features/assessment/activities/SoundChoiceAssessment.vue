<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AssessmentAudioButton from '../components/AssessmentAudioButton.vue'
import AssessmentSpeechCapture from '../components/AssessmentSpeechCapture.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import AssessmentWritingCapture from '../components/AssessmentWritingCapture.vue'
import type { AssessmentActivitySubmission, AssessmentItem, AssessmentTechnicalError } from '../types'

type Point = { x: number; y: number }

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const selected = ref('')
const editCount = ref(0)
const replayCount = ref(0)
const strokes = ref<Point[][]>([])
const transcript = ref('')
const confidence = ref<number | null>(null)
const technicalError = ref<AssessmentTechnicalError | null>(null)
const isWriting = computed(() => props.item.responseMode === 'writing')
const isSpeaking = computed(() => props.item.responseMode === 'speech')
const canSubmit = computed(() => {
  if (technicalError.value) return true
  if (isWriting.value) return strokes.value.some((stroke) => stroke.length > 1)
  if (isSpeaking.value) return Boolean(transcript.value)
  return Boolean(selected.value)
})

watch(() => props.item.id, () => {
  selected.value = ''
  editCount.value = 0
  replayCount.value = 0
  strokes.value = []
  transcript.value = ''
  confidence.value = null
  technicalError.value = null
})

const choose = (id: string) => {
  if (selected.value && selected.value !== id) editCount.value += 1
  selected.value = id
}
const captured = (value: string, score: number | null) => {
  transcript.value = value
  confidence.value = score
  technicalError.value = null
}
const unavailable = () => {
  technicalError.value = { code: 'SPEECH_EVALUATOR_UNAVAILABLE', message: '음성 인식 기능을 사용할 수 없어 결과에서 제외합니다.' }
}

const submit = () => {
  let payload: AssessmentActivitySubmission['payload']
  let modality: AssessmentActivitySubmission['modality']
  if (isWriting.value) {
    payload = { kind: 'writing', strokes: strokes.value.map((stroke) => [...stroke]) }
    modality = 'writing'
  } else if (isSpeaking.value) {
    payload = { kind: 'speech', transcript: transcript.value, confidence: confidence.value }
    modality = 'voice'
  } else {
    payload = { kind: 'choice', value: selected.value, editCount: editCount.value }
    modality = navigator.maxTouchPoints > 0 ? 'touch' : 'mouse'
  }
  emit('submit', { payload, modality, replayCount: replayCount.value, technicalError: technicalError.value })
}
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <p v-if="item.prompt.subInstruction">{{ item.prompt.subInstruction }}</p>
    <AssessmentAudioButton :text="item.prompt.audioText" :replay-count="replayCount" @played="replayCount++" />
    <AssessmentWritingCapture v-if="isWriting" @changed="strokes = $event" />
    <AssessmentSpeechCapture v-else-if="isSpeaking" @captured="captured" @unavailable="unavailable" />
    <div v-else class="choices">
      <button v-for="choice in item.prompt.choices" :key="choice.id" type="button" :class="{ selected: selected === choice.id }" @click="choose(choice.id)">
        {{ choice.text }}
      </button>
    </div>
    <AssessmentSubmitButton :disabled="!canSubmit" :label="isWriting ? '다 썼어요' : isSpeaking ? '말하기 완료' : '답 보내기'" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:22px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.activity p{margin:-12px 0 0;color:#527183;font-size:19px}.choices{display:flex;flex-wrap:wrap;justify-content:center;gap:18px}.choices button{min-width:150px;min-height:100px;padding:16px;border:4px solid #b8d0df;border-radius:24px;background:#fff;color:#173d57;font-size:30px;font-weight:900;box-shadow:0 6px 0 #d3e1e9}.choices button.selected{border-color:#1769aa;background:#e8f6ff;box-shadow:0 6px 0 #1769aa}.choices button:focus-visible{outline:4px solid #ffd24a;outline-offset:3px}
</style>

