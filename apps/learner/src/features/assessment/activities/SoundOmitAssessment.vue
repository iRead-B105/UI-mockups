<script setup lang="ts">
import { ref, watch } from 'vue'
import AssessmentAudioButton from '../components/AssessmentAudioButton.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const selected = ref<string[]>([])
const editCount = ref(0)
const replayCount = ref(0)
watch(() => props.item.id, () => { selected.value = []; editCount.value = 0; replayCount.value = 0 })
const toggle = (id: string) => {
  editCount.value += selected.value.length ? 1 : 0
  selected.value = selected.value.includes(id) ? selected.value.filter((value) => value !== id) : [...selected.value, id]
}
const submit = () => emit('submit', {
  payload: { kind: 'omit', selectedUnitIds: [...selected.value], editCount: editCount.value },
  modality: navigator.maxTouchPoints > 0 ? 'touch' : 'mouse', replayCount: replayCount.value,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <p v-if="item.prompt.audioText">{{ item.prompt.audioText }}</p>
    <AssessmentAudioButton :text="item.prompt.audioText" :replay-count="replayCount" @played="replayCount++" />
    <div class="units">
      <button v-for="unit in item.prompt.manipulationUnits" :key="unit.id" type="button" :class="{ selected: selected.includes(unit.id) }" @click="toggle(unit.id)">{{ unit.text }}</button>
    </div>
    <AssessmentSubmitButton :disabled="selected.length === 0" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:21px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.activity p{margin:-10px 0 0;color:#527183;font-size:18px}.units{display:flex;flex-wrap:wrap;justify-content:center;gap:16px}.units button{display:grid;min-width:92px;height:92px;place-items:center;border:4px solid #b8d0df;border-radius:22px;background:#fff;color:#173d57;font-size:31px;font-weight:900}.units button.selected{border-color:#d46b57;background:#fff0eb;text-decoration:line-through}
</style>


