<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import SoundButton from '../SoundButton.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const slots = ref<(string | null)[]>([])
const draggedId = ref<string | null>(null)
const isAnswered = computed(() => progressState.isCurrentCorrect === true)
const isWrong = computed(() => progressState.isCurrentCorrect === false)

const reset = () => {
  slots.value = Array.from({ length: choices.value.length }, () => null)
  draggedId.value = null
}
watch(() => props.question.id, reset, { immediate: true })

const placed = computed(() => slots.value.map((id) => choices.value.find((choice) => choice.id === id) ?? null))
const remaining = computed(() => choices.value.filter((choice) => !slots.value.includes(choice.id)))
const allFilled = computed(() => slots.value.every(Boolean))

const sync = () => {
  progressState.isCurrentCorrect = null
  if (allFilled.value) session.selectAnswer(slots.value.join('|'))
  else progressState.selectedAnswer = null
}
const place = (id: string, target?: number) => {
  if (isAnswered.value || slots.value.includes(id)) return
  const index = target ?? slots.value.findIndex((value) => value === null)
  if (index < 0 || slots.value[index]) return
  const next = [...slots.value]
  next[index] = id
  slots.value = next
  sync()
}
const remove = (index: number) => {
  if (isAnswered.value || !slots.value[index]) return
  const next = [...slots.value]
  next[index] = null
  slots.value = next
  sync()
}
const drop = (index: number) => {
  if (draggedId.value) place(draggedId.value, index)
  draggedId.value = null
}
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <header class="activity-heading"><h1>{{ question.instruction }}</h1></header>

    <div class="slots" :class="{ wrong: isWrong }">
      <button
        v-for="(choice, index) in placed"
        :key="index"
        class="sentence-slot"
        :class="{ filled: choice, correct: isAnswered }"
        type="button"
        :disabled="isAnswered"
        :aria-label="choice ? `${index + 1}번째 ${choice.text}, 빼기` : `${index + 1}번째 빈칸`"
        @click="remove(index)"
        @dragover.prevent
        @drop="drop(index)"
      >
        <span v-if="choice">{{ choice.text }}</span>
        <span v-else>{{ index + 1 }}</span>
      </button>
    </div>

    <div class="source-cards" aria-label="문장 카드">
      <button
        v-for="choice in remaining"
        :key="choice.id"
        class="sentence-card"
        type="button"
        :draggable="!isAnswered"
        :disabled="isAnswered"
        @click="place(choice.id)"
        @dragstart="draggedId = choice.id"
        @dragend="draggedId = null"
      >
        {{ choice.text }}
      </button>
    </div>

    <SoundButton v-if="allFilled" :text="question.targetText ?? ''" label="완성 문장 듣기" size="medium" variant="ghost" />

    <div class="action-bar">
      <button v-if="!isAnswered" class="action action--primary" type="button" :disabled="!allFilled" @click="session.submitAnswer()">확인</button>
      <button v-else class="action action--next" type="button" @click="$emit('next')">다음 문제</button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;width:100%;max-width:1180px;height:100%;min-height:0;padding:22px 28px 20px;border:4px solid rgba(255,255,255,.92);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#eef8ff 58%,#e5f4d1 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14)}.activity-heading h1{margin:0;color:#193b79;font-family:var(--learner-font-display);font-size:clamp(28px,2.4vw,38px);font-weight:900}.slots{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:18px;width:min(100%,900px)}.sentence-slot{min-height:120px;padding:16px;border:4px dashed #86a3df;border-radius:24px;background:rgba(255,255,255,.68);color:#8795aa;font-family:var(--learner-font-display);font-size:24px;font-weight:900;cursor:pointer}.sentence-slot.filled{border-style:solid;border-color:#7191e9;background:#fffdf8;color:#263853;box-shadow:var(--learner-shadow-card)}.sentence-slot.correct{border-color:#5fbd69;background:#f3fff0}.slots.wrong .sentence-slot.filled{border-color:#ef8a7f;background:#fff4f1}.source-cards{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:18px;width:min(100%,900px);min-height:100px}.sentence-card{min-height:94px;padding:14px 18px;border:4px solid #f1e4c5;border-radius:22px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:24px;font-weight:900;box-shadow:var(--learner-shadow-card);cursor:grab}.sentence-card:hover{transform:translateY(-4px);box-shadow:var(--learner-shadow-floating)}.sentence-card:active{cursor:grabbing}.activity :deep(.sound-button){height:52px;color:#3b64d8;background:#fff;border:2px solid #f1dfae}.sentence-slot:focus-visible,.sentence-card:focus-visible,.action:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.action-bar{display:flex;justify-content:flex-end;width:100%}.action{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(49,80,150,.24)}.action--primary{background:linear-gradient(180deg,#7797f5,#4f72e1)}.action--next{background:linear-gradient(180deg,#ffc657,#f2a92e)}.action:disabled{opacity:.42;cursor:default}@media(max-width:700px){.activity{overflow-y:auto}.slots,.source-cards{gap:8px}.sentence-slot,.sentence-card{font-size:18px;padding:10px}}@media(max-height:800px){.activity{gap:18px;padding:14px 22px}.activity-heading h1{font-size:26px}.sentence-slot{min-height:96px}.source-cards{min-height:80px}.sentence-card{min-height:76px}.action{min-height:56px}}
</style>
