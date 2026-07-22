<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import type { TrainingChoice, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'
import LetterCard from '../LetterCard.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const audio = useAudioPlayer()
const choices = computed<TrainingChoice[]>(() => props.question.choices ?? [])
const isCorrect = computed(() => session.progressState.isCurrentCorrect === true)

const cardState = (choice: TrainingChoice) => {
  if (isCorrect.value) return choice.id === props.question.answer ? 'correct' : 'disabled'
  if (session.progressState.selectedAnswer === choice.id) {
    return session.progressState.isCurrentCorrect === false ? 'wrong' : 'selected'
  }
  return 'default'
}

const playQuestion = () => {
  if (props.question.audioText) void audio.replay(props.question.audioText, 0.72)
}

const choose = (choice: TrainingChoice) => {
  if (isCorrect.value) return
  session.selectAnswer(choice.id)
  const correct = session.submitAnswer()

  if (correct) {
    void audio.speak('맞았어!', 0.9)
  }
}

watch(
  () => props.question.id,
  () => void nextTick(playQuestion),
  { immediate: true },
)
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <h1>{{ question.instruction }}</h1>

    <div class="learning-area">
      <button
        class="listen-button"
        type="button"
        :disabled="audio.isPlaying.value"
        aria-label="문제 소리 다시 듣기"
        @click="playQuestion"
      >
        <span class="listen-rings" aria-hidden="true"></span>
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path d="M14 29h14l18-13v40L28 43H14z" fill="currentColor" />
          <path d="M53 26c5 6 5 14 0 20M60 20c9 10 9 22 0 32" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />
        </svg>
        <strong>{{ audio.isPlaying.value ? '듣고 있어요' : '다시 듣기' }}</strong>
      </button>

      <div class="choices" aria-label="글자 선택지">
        <LetterCard
          v-for="choice in choices"
          :key="choice.id"
          :jamo="choice.letter?.jamo ?? ''"
          :type="choice.letter?.type ?? 'consonant'"
          :state="cardState(choice)"
          :selectable="!isCorrect"
          size="large"
          @select="choose(choice)"
        />
      </div>
    </div>

    <div class="action-row">
      <p v-if="session.progressState.isCurrentCorrect === false" role="status">한 번 더 들어봐요.</p>
      <span v-else></span>
      <button v-if="isCorrect" class="next-button" type="button" @click="$emit('next')">
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity{display:flex;flex-direction:column;gap:18px;width:100%;max-width:1180px;height:100%;min-height:0;padding:24px 28px 22px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d9efff 0%,#edf7ff 58%,#e7f3cf 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.activity h1{margin:0;text-align:center;color:#233d79;font-family:var(--learner-font-display);font-size:clamp(30px,2.5vw,40px);font-weight:900}.learning-area{display:grid;grid-template-columns:270px minmax(0,1fr);gap:26px;flex:1;min-height:0}.listen-button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;border:3px solid #fff;border-radius:28px;background:rgba(255,253,244,.93);color:#4f72e1;box-shadow:0 7px 18px rgba(55,87,130,.13);cursor:pointer}.listen-button svg{width:108px;height:108px;padding:18px;border-radius:50%;background:linear-gradient(145deg,#8eb2ff,#5478e7);color:#fff;box-shadow:0 10px 22px rgba(62,98,183,.24)}.listen-button strong{font-family:var(--learner-font-display);font-size:25px;font-weight:900}.listen-button:hover:not(:disabled){transform:translateY(-3px)}.listen-button:focus-visible,.next-button:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}.listen-button:disabled{cursor:default;opacity:.88}.listen-rings{position:absolute;width:150px;height:150px;border:4px solid rgba(112,147,238,.18);border-radius:50%;pointer-events:none}.listen-button:disabled .listen-rings{animation:sound-wave 1.1s ease-out infinite}.choices{display:grid;grid-template-columns:repeat(3,minmax(150px,1fr));align-items:center;justify-items:center;gap:22px;padding:30px;border-radius:28px;background:rgba(255,255,255,.48)}.choices :deep(.letter-card){width:min(100%,210px);height:205px;padding:18px;border:5px solid #f1e4c7;border-radius:30px;background:#fffdf8}.choices :deep(.letter-card--wrong){border-color:#ef8a7f;background:#fff1ed}.choices :deep(.letter-card--correct){border-color:#62b96b;background:#f2fff0;box-shadow:0 0 0 7px rgba(98,185,107,.16),var(--learner-shadow-card)}.choices :deep(.letter-card--disabled){opacity:.5}.action-row{display:flex;align-items:center;justify-content:space-between;min-height:62px}.action-row p{margin:0;padding-left:18px;color:#b6534e;font-family:var(--learner-font-display);font-size:21px;font-weight:900}.next-button{min-width:190px;min-height:60px;padding:0 28px;border:0;border-radius:22px;background:linear-gradient(180deg,#ffc657,#f2a92e);color:#fff;font-family:var(--learner-font-display);font-size:22px;font-weight:900;box-shadow:0 7px 16px rgba(150,100,30,.22);cursor:pointer}@keyframes sound-wave{0%{transform:scale(.82);opacity:.8}100%{transform:scale(1.18);opacity:0}}@media(max-width:760px){.activity{overflow-y:auto;padding:18px}.learning-area{grid-template-columns:1fr}.listen-button{min-height:150px;flex-direction:row}.listen-button svg{width:86px;height:86px}.listen-rings{width:110px;height:110px}.choices{gap:12px;padding:18px}.choices :deep(.letter-card){height:145px}}@media(max-height:800px){.activity{gap:12px;padding:14px 20px}.activity h1{font-size:28px}.learning-area{grid-template-columns:240px minmax(0,1fr);gap:16px}.listen-button{gap:12px}.listen-button svg{width:88px;height:88px}.listen-rings{width:122px;height:122px}.listen-button strong{font-size:22px}.choices{gap:14px;padding:20px}.choices :deep(.letter-card){height:158px}.action-row{min-height:54px}.next-button{min-height:54px}}@media(prefers-reduced-motion:reduce){.listen-button:disabled .listen-rings{animation:none}}
</style>
