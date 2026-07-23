<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { assessmentPolicy } from '../config/assessment-policy'

const props = defineProps<{ text?: string; replayCount: number }>()
const emit = defineEmits<{ played: [] }>()
const { speak, isPlaying } = useAudioPlayer()
const disabled = computed(() => !props.text || props.replayCount >= assessmentPolicy.maxTargetAudioReplay || isPlaying.value)

onMounted(async () => {
  if (props.text) await speak(props.text, 0.82)
})

const play = async () => {
  if (!props.text || disabled.value) return
  emit('played')
  await speak(props.text, 0.82)
}
</script>

<template>
  <button class="audio-button" type="button" :disabled="disabled" @click="play">
    <span aria-hidden="true">🔊</span>
    {{ replayCount === 0 ? '다시 듣기' : '다시 듣기 완료' }}
  </button>
</template>

<style scoped>
.audio-button{display:inline-flex;min-height:56px;align-items:center;gap:10px;padding:0 22px;border:3px solid #1769aa;border-radius:999px;background:#fff;color:#174d72;font-weight:800;box-shadow:0 4px 0 #b9d9ee}.audio-button:disabled{border-color:#a9b8c3;color:#74838d;box-shadow:none}.audio-button span{font-size:24px}
</style>

