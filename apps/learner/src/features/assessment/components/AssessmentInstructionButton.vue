<script setup lang="ts">
import { computed } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { assessmentPolicy } from '../config/assessment-policy'

const props = defineProps<{ text: string; repeatCount: number }>()
const emit = defineEmits<{ repeated: [] }>()
const { speak, isPlaying } = useAudioPlayer()
const disabled = computed(() => props.repeatCount >= assessmentPolicy.maxInstructionRepeat || isPlaying.value)
const repeat = async () => {
  if (disabled.value) return
  emit('repeated')
  await speak(props.text, 0.86)
}
</script>

<template>
  <button class="instruction-button" type="button" :disabled="disabled" @click="repeat">
    <span aria-hidden="true">💬</span>
    {{ repeatCount === 0 ? '문제 다시 듣기' : '문제 다시 듣기 완료' }}
  </button>
</template>

<style scoped>
.instruction-button{justify-self:end;min-height:42px;padding:0 14px;border:2px solid #789caf;border-radius:13px;background:#fff;color:#345d75;font-size:14px;font-weight:800}.instruction-button:disabled{border-color:#bdc9cf;color:#7c8c94}.instruction-button span{margin-right:5px}
</style>

