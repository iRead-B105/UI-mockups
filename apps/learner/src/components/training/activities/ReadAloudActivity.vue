<script setup lang="ts">
// 액티비티: 문장 따라 읽기 (유창성)
// 모범 음성을 듣고 마이크로 따라 읽어요.
// MediaRecorder 를 지원하면 실제 녹음, 미지원/권한거부 시 "목업 녹음"으로 동작합니다.
// 본 화면은 발음 평가/STT 점수를 표시하지 않으며, "연습 기록만 저장된다"고 안내합니다.
// 다음 레슨 이동은 상위가 처리합니다.

import { computed, watch } from 'vue'
import type { TrainingQuestion } from '@/types/training'
import { useTrainingSession } from '@/composables/useTrainingSession'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import SoundButton from '../SoundButton.vue'

const props = defineProps<{ question: TrainingQuestion }>()
defineEmits<{ next: [] }>()

const session = useTrainingSession()
const { progressState } = session
const { isPlaying, currentText } = useAudioPlayer()
const recorder = useVoiceRecorder()

const sentence = computed(() => props.question.targetText ?? '')
const chunks = computed(() => props.question.phraseChunks ?? [])
const isModelPlaying = computed(() => isPlaying.value && currentText.value === sentence.value)

const status = computed(() => recorder.state.status)
const isRecording = computed(() => status.value === 'recording')
const hasRecording = computed(() => recorder.state.hasRecording)
const isMock = computed(() => recorder.state.isMock)
const isAnswered = computed(() => progressState.isCurrentCorrect === true)

// 녹음이 완료되면 세션에 목업 결과를 저장(정답 처리)하여 다음 버튼 활성화
watch(
  () => status.value,
  (next) => {
    if (next === 'recorded' && !isAnswered.value) {
      session.markRecordingComplete({
        isMock: recorder.state.isMock,
        audioUrl: recorder.audioUrl.value,
      })
    }
  },
)

// 문제가 바뀌면 녹음 상태 초기화
watch(
  () => props.question.id,
  () => {
    recorder.reset()
    progressState.isCurrentCorrect = null
  },
)

const handleMicToggle = () => {
  if (isRecording.value) {
    recorder.stop()
  } else {
    void recorder.start()
  }
}

const handleReRecord = () => {
  recorder.reset()
  progressState.isCurrentCorrect = null
}

const playMyRecording = () => {
  // 실제 녹음이 있으면 재생(목업이면 재생 불가)
  if (recorder.audioUrl.value) {
    const audio = new Audio(recorder.audioUrl.value)
    void audio.play()
  }
}

const formatTime = (ms: number): string => {
  const total = Math.floor(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(1, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

const micButtonLabel = computed(() => {
  switch (status.value) {
    case 'recording':
      return '녹음 중… 누르면 멈춰요'
    case 'requesting':
      return '마이크 권한을 확인하고 있어요…'
    case 'recorded':
      return '녹음 완료! 다시 녹음하려면 눌러요'
    case 'denied':
      return '마이크 권한이 필요해요. 다시 눌러 허용해 주세요.'
    case 'unsupported':
      return '녹음 준비가 되었어요.'
    default:
      return '누르면 내 목소리를 녹음해요'
  }
})
</script>

<template>
  <section class="activity" :aria-label="question.instruction">
    <div class="activity-main">
      <div class="instruction">
        <p class="instruction-main">{{ question.instruction }}</p>
        <p v-if="question.subInstruction" class="instruction-sub">{{ question.subInstruction }}</p>
      </div>

      <!-- 모범 문장 -->
      <div class="sentence-card" :class="{ playing: isModelPlaying }">
        <div class="sentence-chunks">
          <span v-for="(chunk, i) in chunks" :key="i" class="chunk">{{ chunk }}</span>
          <span v-if="chunks.length === 0" class="chunk">{{ sentence }}</span>
        </div>
        <SoundButton :text="sentence" label="모범 음성 듣기" size="medium" variant="primary" />
      </div>

      <!-- 녹음 영역 -->
      <div class="record-area">
        <!-- 목업 파형 -->
        <div class="waveform" :class="{ active: isRecording }" aria-hidden="true">
          <span
            v-for="(bar, i) in recorder.waveform.value"
            :key="i"
            class="wave-bar"
            :style="{ height: `${Math.max(8, bar * 100)}%` }"
          ></span>
        </div>

        <button
          class="mic-button"
          :class="{ recording: isRecording, recorded: hasRecording && !isRecording, denied: status === 'denied' }"
          type="button"
          :aria-label="micButtonLabel"
          @click="handleMicToggle"
        >
          <svg v-if="!isRecording && !hasRecording" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="19" y="8" width="10" height="20" rx="5" fill="currentColor" />
            <path d="M12 24a12 12 0 0024 0M24 36v6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <svg v-else-if="isRecording" viewBox="0 0 48 48" aria-hidden="true">
            <rect x="16" y="16" width="16" height="16" rx="4" fill="currentColor" />
          </svg>
          <svg v-else viewBox="0 0 48 48" aria-hidden="true">
            <path d="M14 24l7 7 13-14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <p class="record-status">
          <span v-if="isRecording" class="timer">{{ formatTime(recorder.state.elapsedMs) }}</span>
          {{ micButtonLabel }}
        </p>

        <p v-if="status === 'denied'" class="denied-note">권한을 허용하면 녹음할 수 있어요.</p>

        <!-- 녹음 후 액션 -->
        <div v-if="hasRecording && !isRecording" class="record-actions">
          <button v-if="!isMock" class="chip" type="button" @click="playMyRecording">내 녹음 듣기</button>
          <button class="chip" type="button" @click="handleReRecord">다시 녹음하기</button>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button
        class="action action--primary"
        type="button"
        :disabled="!isAnswered"
        @click="$emit('next')"
      >
        다음 문제
      </button>
    </div>
  </section>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-5);
  width: 100%;
  max-width: var(--learner-reading-width);
  margin: 0 auto;
}
.activity-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-5);
  width: 100%;
}

.instruction { text-align: center; }
.instruction-main {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.2;
}
.instruction-sub {
  margin: var(--learner-space-2) 0 0;
  font-size: var(--learner-font-size-body-large);
  color: var(--learner-color-text-soft);
}

.sentence-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-4);
  width: 100%;
  max-width: 640px;
  padding: var(--learner-space-6) var(--learner-space-6);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background: var(--learner-color-surface);
  box-shadow: var(--learner-shadow-card);
  transition: border-color var(--learner-duration-fast);
}
.sentence-card.playing {
  border-color: var(--learner-color-primary);
}
.sentence-chunks {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--learner-space-2) var(--learner-space-3);
}
.chunk {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-reading-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.25;
}
.sentence-card.playing .chunk { color: var(--learner-color-primary); }

.record-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-4);
  width: 100%;
}

.waveform {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 64px;
  width: min(100%, 360px);
}
.wave-bar {
  width: 6px;
  border-radius: 3px;
  background: var(--learner-color-text-soft);
  opacity: 0.5;
  transition: height var(--learner-duration-fast);
}
.waveform.active .wave-bar {
  background: var(--learner-color-error);
  opacity: 0.9;
}

.mic-button {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  box-shadow: var(--learner-shadow-floating);
  cursor: pointer;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard), background var(--learner-duration-fast);
}
.mic-button:hover { transform: scale(1.05); }
.mic-button:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }
.mic-button svg { width: 60px; height: 60px; }
.mic-button.recording {
  background: var(--learner-color-error);
  color: #fff;
  animation: micPulse 1.4s ease-in-out infinite;
}
.mic-button.recorded {
  background: var(--learner-color-success);
  color: #fff;
}
.mic-button.denied {
  background: var(--learner-color-warning);
}
@keyframes micPulse {
  0%, 100% { box-shadow: var(--learner-shadow-floating), 0 0 0 0 rgb(239 107 107 / 0.5); }
  50% { box-shadow: var(--learner-shadow-floating), 0 0 0 22px rgb(239 107 107 / 0); }
}

.record-status {
  margin: 0;
  text-align: center;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
}
.timer {
  display: inline-block;
  min-width: 56px;
  margin-right: var(--learner-space-2);
  padding: 0 var(--learner-space-2);
  color: var(--learner-color-error);
}

.mock-badge {
  padding: var(--learner-space-1) var(--learner-space-4);
  border-radius: var(--learner-radius-pill);
  background: color-mix(in srgb, var(--learner-color-warning) 22%, var(--learner-color-surface));
  border: 2px solid var(--learner-color-warning);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
}
.denied-note {
  margin: 0;
  font-size: var(--learner-font-size-caption);
  color: var(--learner-color-error);
}

.record-actions {
  display: flex;
  gap: var(--learner-space-3);
  flex-wrap: wrap;
  justify-content: center;
}
.chip {
  min-height: var(--learner-touch-target);
  padding: 0 var(--learner-space-5);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  cursor: pointer;
  box-shadow: var(--learner-shadow-small);
}
.chip:hover { transform: translateY(-2px); box-shadow: var(--learner-shadow-card); }
.chip:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }

.action-bar { display: flex; justify-content: center; width: 100%; margin-top: var(--learner-space-2); }
.action {
  min-width: 220px;
  min-height: var(--learner-control-height-large);
  border: none;
  border-radius: var(--learner-radius-large);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  box-shadow: var(--learner-shadow-card);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast), opacity var(--learner-duration-fast);
}
.action:hover:not(:disabled) { transform: translateY(-3px); box-shadow: var(--learner-shadow-floating); }
.action:disabled { opacity: 0.45; cursor: default; }
.action:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }

@media (prefers-reduced-motion: reduce) {
  .mic-button:hover, .mic-button.recording, .chip:hover, .action:hover { transform: none; animation: none; }
}

/* 와이어프레임 TR-F/G: 읽기 카드와 녹음 조작을 한 화면의 두 영역으로 배치 */
.activity {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1180px;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 22px 26px 20px;
  border: 4px solid rgb(255 255 255 / 92%);
  border-radius: 30px;
  background: linear-gradient(180deg, #d9efff 0%, #eef8ff 58%, #e5f4d1 100%);
  box-shadow: inset 0 0 0 2px rgb(89 145 212 / 20%), 0 12px 26px rgb(45 94 145 / 14%);
  overflow: hidden;
}
.activity-main {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, .55fr);
  grid-template-areas:
    "instruction instruction"
    "sentence record";
  align-items: stretch;
  gap: 16px 20px;
  flex: 1;
  min-height: 0;
}
.instruction { grid-area: instruction; }
.sentence-card {
  grid-area: sentence;
  justify-content: center;
  max-width: none;
  height: 100%;
  min-height: 0;
  padding: 24px;
  border: 4px solid #fff;
  background: #fffdf8;
}
.sentence-chunks { gap: 12px; }
.chunk {
  padding: 10px 14px;
  border-radius: 16px;
  background: #f3f6ff;
}
.record-area {
  grid-area: record;
  justify-content: center;
  gap: 12px;
  min-height: 0;
  padding: 18px;
  border: 3px solid rgb(255 255 255 / 90%);
  border-radius: 26px;
  background: rgb(255 255 255 / 62%);
}
.waveform { height: 50px; }
.mic-button { width: 100px; height: 100px; }
.mic-button svg { width: 50px; height: 50px; }
.record-status { font-size: 16px; }
.action-bar { justify-content: flex-end; margin-top: 0; }
.action { min-width: 190px; min-height: 60px; }

@media (max-width: 760px) {
  .activity { overflow-y: auto; }
  .activity-main {
    grid-template-columns: 1fr;
    grid-template-areas: "instruction" "sentence" "record";
  }
}
@media (max-height: 800px) and (min-width: 761px) {
  .activity { gap: 10px; padding: 14px 20px; }
  .activity-main { gap: 10px 16px; }
  .instruction-main { font-size: 26px; }
  .instruction-sub { margin-top: 2px; font-size: 16px; }
  .sentence-card { gap: 12px; padding: 16px; }
  .chunk { padding: 8px 11px; font-size: 34px; }
  .sentence-card :deep(.sound-button) { height: 48px; }
  .record-area { gap: 8px; padding: 12px; }
  .waveform { height: 36px; }
  .mic-button { width: 82px; height: 82px; }
  .mic-button svg { width: 42px; height: 42px; }
  .action { min-height: 56px; }
}
</style>
