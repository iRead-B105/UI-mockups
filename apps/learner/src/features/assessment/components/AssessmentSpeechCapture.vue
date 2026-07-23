<script setup lang="ts">
import { watch } from 'vue'
import { useAssessmentSpeechInput } from '../composables/useAssessmentSpeechInput'

const emit = defineEmits<{
  captured: [transcript: string, confidence: number | null]
  unavailable: []
}>()
const { state, start } = useAssessmentSpeechInput()

watch(() => state.status, (status) => {
  if (status === 'captured') emit('captured', state.transcript, state.confidence)
  if (status === 'unsupported') emit('unavailable')
})
</script>

<template>
  <div class="speech-capture">
    <button type="button" :disabled="state.status === 'listening' || state.status === 'captured'" @click="start">
      <span aria-hidden="true">🎙️</span>
      {{ state.status === 'listening' ? '듣고 있어요…' : state.status === 'captured' ? '말하기 완료' : '눌러서 말하기' }}
    </button>
    <p v-if="state.status === 'captured'" role="status">목소리를 담았어요.</p>
    <p v-else-if="state.errorMessage" class="error" role="alert">{{ state.errorMessage }}</p>
  </div>
</template>

<style scoped>
.speech-capture{display:grid;justify-items:center;gap:8px}.speech-capture button{display:inline-flex;min-height:70px;align-items:center;gap:10px;padding:0 28px;border:4px solid #1769aa;border-radius:24px;background:#fff;color:#174d72;font-size:20px;font-weight:900;box-shadow:0 6px 0 #b9d9ee}.speech-capture button:disabled{border-color:#36a96b;background:#eaf8f0;box-shadow:0 5px 0 #a9d8bd;color:#246b45}.speech-capture button span{font-size:28px}.speech-capture p{margin:0;color:#367357;font-weight:800}.speech-capture p.error{max-width:430px;color:#9d4939}
</style>


