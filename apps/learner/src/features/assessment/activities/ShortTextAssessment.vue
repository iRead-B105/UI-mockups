<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const selected = ref<string[]>([])
const editCount = ref(0)
const isSequence = computed(() => props.item.responseMode === 'sequence')
const expectedLength = computed(() => Array.isArray(props.item.answerKey) ? props.item.answerKey.length : 1)
watch(() => props.item.id, () => { selected.value = []; editCount.value = 0 })
const choose = (id: string) => {
  if (!isSequence.value) {
    if (selected.value[0] && selected.value[0] !== id) editCount.value += 1
    selected.value = [id]
  } else if (!selected.value.includes(id)) selected.value.push(id)
}
const erase = () => { if (selected.value.length) { selected.value.pop(); editCount.value += 1 } }
const submit = () => emit('submit', {
  payload: isSequence.value
    ? { kind: 'sequence', value: [...selected.value], editCount: editCount.value }
    : { kind: 'choice', value: selected.value[0] ?? '', editCount: editCount.value },
  modality: navigator.maxTouchPoints > 0 ? 'touch' : 'mouse', replayCount: 0,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <div v-if="item.prompt.displayText" class="sentence">{{ item.prompt.displayText }}</div>
    <div v-if="isSequence" class="answer-line">
      <span v-for="(id, index) in selected" :key="`${id}-${index}`">{{ item.prompt.choices?.find((choice) => choice.id === id)?.text }}</span>
    </div>
    <div class="choices">
      <button v-for="choice in item.prompt.choices" :key="choice.id" type="button" :disabled="isSequence && selected.includes(choice.id)" :class="{ selected: selected.includes(choice.id) }" @click="choose(choice.id)">{{ choice.text }}</button>
    </div>
    <button v-if="isSequence" class="erase" type="button" :disabled="selected.length === 0" @click="erase">하나 지우기</button>
    <AssessmentSubmitButton :disabled="selected.length !== expectedLength" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:20px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.sentence{max-width:800px;padding:24px 32px;border-radius:24px;background:#fff;color:#173d57;font-size:clamp(25px,3vw,38px);font-weight:900;box-shadow:0 6px 0 #dceaf1}.answer-line,.choices{display:flex;min-height:64px;flex-wrap:wrap;justify-content:center;gap:12px}.answer-line span{padding:12px 16px;border-bottom:4px solid #1769aa;color:#173d57;font-size:23px;font-weight:900}.choices button{min-height:70px;padding:10px 20px;border:4px solid #b8d0df;border-radius:19px;background:#fff;color:#173d57;font-size:23px;font-weight:900}.choices button.selected{border-color:#1769aa;background:#e8f6ff}.choices button:disabled{opacity:.4}.erase{min-height:44px;padding:0 18px;border:2px solid #9bb6c7;border-radius:14px;background:#fff;color:#345d75;font-weight:800}
</style>


