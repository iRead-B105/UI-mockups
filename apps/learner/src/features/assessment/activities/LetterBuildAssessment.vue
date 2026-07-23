<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AssessmentAudioButton from '../components/AssessmentAudioButton.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const sequence = ref<string[]>([])
const editCount = ref(0)
const replayCount = ref(0)
const expectedLength = computed(() => Array.isArray(props.item.answerKey) ? props.item.answerKey.length : 2)
watch(() => props.item.id, () => { sequence.value = []; editCount.value = 0; replayCount.value = 0 })
const add = (id: string) => { if (sequence.value.length < expectedLength.value) sequence.value.push(id) }
const erase = () => { if (sequence.value.length) { sequence.value.pop(); editCount.value += 1 } }
const submit = () => emit('submit', {
  payload: { kind: 'sequence', value: [...sequence.value], editCount: editCount.value },
  modality: navigator.maxTouchPoints > 0 ? 'touch' : 'mouse',
  replayCount: replayCount.value,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <p v-if="item.prompt.subInstruction">{{ item.prompt.subInstruction }}</p>
    <AssessmentAudioButton :text="item.prompt.audioText" :replay-count="replayCount" @played="replayCount++" />
    <div class="slots" aria-label="선택한 글자">
      <span v-for="index in expectedLength" :key="index">{{ item.prompt.choices?.find((choice) => choice.id === sequence[index - 1])?.text ?? '' }}</span>
    </div>
    <div class="cards">
      <button v-for="choice in item.prompt.choices" :key="choice.id" type="button" :disabled="sequence.includes(choice.id)" @click="add(choice.id)">{{ choice.text }}</button>
    </div>
    <button class="erase" type="button" :disabled="sequence.length === 0" @click="erase">하나 지우기</button>
    <AssessmentSubmitButton :disabled="sequence.length !== expectedLength" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:18px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.activity p{margin:-9px 0 0;color:#527183;font-size:18px}.slots,.cards{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}.slots span{display:grid;width:90px;height:90px;place-items:center;border:4px dashed #6fa1bf;border-radius:20px;background:#eff9ff;color:#173d57;font-size:36px;font-weight:900}.cards button{min-width:86px;min-height:78px;border:3px solid #b7cfdd;border-radius:18px;background:#fff;color:#173d57;font-size:31px;font-weight:900}.cards button:disabled{opacity:.35}.erase{min-height:44px;padding:0 18px;border:2px solid #9bb6c7;border-radius:14px;background:#fff;color:#345d75;font-weight:800}.erase:disabled{opacity:.45}
</style>


