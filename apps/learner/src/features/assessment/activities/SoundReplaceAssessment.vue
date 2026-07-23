<script setup lang="ts">
import { ref, watch } from 'vue'
import AssessmentAudioButton from '../components/AssessmentAudioButton.vue'
import AssessmentSubmitButton from '../components/AssessmentSubmitButton.vue'
import type { AssessmentActivitySubmission, AssessmentItem } from '../types'

const props = defineProps<{ item: AssessmentItem }>()
const emit = defineEmits<{ submit: [submission: AssessmentActivitySubmission] }>()
const targets = ref<string[]>([])
const replacement = ref('')
const editCount = ref(0)
const replayCount = ref(0)
watch(() => props.item.id, () => { targets.value = []; replacement.value = ''; editCount.value = 0; replayCount.value = 0 })
const chooseTarget = (id: string) => { if (targets.value.length) editCount.value += 1; targets.value = [id] }
const chooseReplacement = (id: string) => { if (replacement.value && replacement.value !== id) editCount.value += 1; replacement.value = id }
const submit = () => emit('submit', {
  payload: { kind: 'replace', targetUnitIds: [...targets.value], replacementChoiceId: replacement.value, editCount: editCount.value },
  modality: navigator.maxTouchPoints > 0 ? 'touch' : 'mouse', replayCount: replayCount.value,
})
</script>

<template>
  <section class="activity">
    <h1>{{ item.prompt.instruction }}</h1>
    <p v-if="item.prompt.audioText">{{ item.prompt.audioText }}</p>
    <AssessmentAudioButton :text="item.prompt.audioText" :replay-count="replayCount" @played="replayCount++" />
    <div class="row">
      <button v-for="unit in item.prompt.manipulationUnits" :key="unit.id" type="button" :class="{ selected: targets.includes(unit.id) }" @click="chooseTarget(unit.id)">{{ unit.text }}</button>
    </div>
    <span class="arrow" aria-hidden="true">↓ 바꿀 소리</span>
    <div class="row replacements">
      <button v-for="choice in item.prompt.replacementChoices" :key="choice.id" type="button" :class="{ selected: replacement === choice.id }" @click="chooseReplacement(choice.id)">{{ choice.text }}</button>
    </div>
    <AssessmentSubmitButton :disabled="targets.length === 0 || !replacement" @submit="submit" />
  </section>
</template>

<style scoped>
.activity{display:grid;justify-items:center;gap:16px;text-align:center}.activity h1{margin:0;color:#173d57;font-size:clamp(27px,3vw,38px)}.activity p{margin:-7px 0 0;color:#527183;font-size:18px}.row{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}.row button{min-width:90px;min-height:76px;border:4px solid #b8d0df;border-radius:20px;background:#fff;color:#173d57;font-size:29px;font-weight:900}.row button.selected{border-color:#1769aa;background:#e8f6ff}.replacements button.selected{border-color:#36a96b;background:#eaf8f0}.arrow{color:#527183;font-weight:900}
</style>


