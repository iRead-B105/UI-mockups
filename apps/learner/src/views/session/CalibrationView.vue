<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import iReadHeaderLogo from '../../assets/header/iread-header.png'
import SessionReadyNotice from '../../components/common/SessionReadyNotice.vue'
import {
  useLearnerAccessSession,
  type LearnerInputMode,
} from '../../composables/useLearnerAccessSession'

type CalibrationViewState =
  | 'device-checking'
  | 'ready'
  | 'calibrating'
  | 'retry'
  | 'success'
  | 'fallback'

const router = useRouter()
const {
  state,
  selectedStudent,
  calibrationComplete,
  load,
  saveCalibration,
  acknowledgeReadyNotice,
} = useLearnerAccessSession()

const calibrationState = ref<CalibrationViewState>('device-checking')
const currentTargetIndex = ref(0)
const readyNoticeOpen = ref(false)
const statusHeading = ref<HTMLElement | null>(null)
const targetPositions = [
  { x: 16, y: 18 },
  { x: 84, y: 18 },
  { x: 50, y: 50 },
  { x: 16, y: 82 },
  { x: 84, y: 82 },
]

let deviceTimer: number | null = null
let calibrationTimer: number | null = null

const inputMode = computed<LearnerInputMode>(() => (
  calibrationState.value === 'fallback' || state.value.inputMode === 'pointer'
    ? 'pointer'
    : 'gaze'
))

const progressLabel = computed(() => (
  `${Math.min(currentTargetIndex.value + 1, targetPositions.length)} / ${targetPositions.length}`
))

const clearTimers = () => {
  if (deviceTimer !== null) window.clearTimeout(deviceTimer)
  if (calibrationTimer !== null) window.clearInterval(calibrationTimer)
  deviceTimer = null
  calibrationTimer = null
}

const focusStatus = async () => {
  await nextTick()
  statusHeading.value?.focus()
}

const notifyCalibrationBridge = (
  type: 'iread:calibration-start' | 'iread:calibration-complete',
  detail: Record<string, unknown>,
) => {
  window.dispatchEvent(new CustomEvent(type, { detail }))
}

const finishCalibration = async (mode: LearnerInputMode) => {
  clearTimers()
  saveCalibration(mode)
  calibrationState.value = mode === 'gaze' ? 'success' : 'fallback'
  notifyCalibrationBridge('iread:calibration-complete', {
    studentId: selectedStudent.value?.id ?? null,
    inputMode: mode,
    calibratedAt: state.value.calibrationCompletedAt,
    gazeRawDataAvailable: mode === 'gaze',
  })
  await focusStatus()
  readyNoticeOpen.value = true
}

const startCalibration = () => {
  clearTimers()
  calibrationState.value = 'calibrating'
  currentTargetIndex.value = 0
  notifyCalibrationBridge('iread:calibration-start', {
    studentId: selectedStudent.value?.id ?? null,
    startedAt: new Date().toISOString(),
  })

  calibrationTimer = window.setInterval(() => {
    if (currentTargetIndex.value >= targetPositions.length - 1) {
      void finishCalibration('gaze')
      return
    }
    currentTargetIndex.value += 1
  }, 760)
}

const markCalibrationProblem = async () => {
  clearTimers()
  calibrationState.value = 'retry'
  await focusStatus()
}

const usePointerFallback = () => {
  void finishCalibration('pointer')
}

const continueToLearnerHome = async () => {
  readyNoticeOpen.value = false
  acknowledgeReadyNotice()
  await router.replace({ name: 'learner-home' })
}

const returnToStudents = async () => {
  clearTimers()
  await router.replace({ name: 'student-selector' })
}

onMounted(() => {
  load()

  if (calibrationComplete.value) {
    calibrationState.value = state.value.inputMode === 'pointer' ? 'fallback' : 'success'
    readyNoticeOpen.value = !state.value.readyNoticeAcknowledged
    return
  }

  deviceTimer = window.setTimeout(() => {
    calibrationState.value = 'ready'
    void focusStatus()
  }, 650)
})

onBeforeUnmount(clearTimers)
</script>

<template>
  <main class="calibration-page" data-learner-emotion="calm">
    <header class="session-header">
      <img :src="iReadHeaderLogo" alt="아이리드" />
      <button class="back-button" type="button" @click="returnToStudents">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M19 7 10 16l9 9" />
        </svg>
        학생 다시 선택
      </button>
    </header>

    <section class="calibration-shell" aria-labelledby="calibration-title">
      <div class="calibration-heading">
        <span class="step-badge">2 / 2</span>
        <p class="teacher-only">교수자 지도 화면</p>
        <h1 id="calibration-title">{{ selectedStudent?.name }} 학생의 시선을 보정합니다</h1>
        <p>아동이 화면 중앙을 편안히 볼 수 있도록 자세와 기기 위치를 먼저 확인해 주세요.</p>
      </div>

      <div class="calibration-layout">
        <section class="calibration-stage" aria-label="시선 보정 영역">
          <div v-if="calibrationState === 'device-checking'" class="stage-message" role="status">
            <span class="device-spinner" aria-hidden="true"></span>
            <strong ref="statusHeading" tabindex="-1">시선 추적기를 확인하고 있습니다</strong>
            <p>기기 연결과 화면 위치를 준비합니다.</p>
          </div>

          <div v-else-if="calibrationState === 'ready'" class="stage-message">
            <span class="status-icon status-icon--ready" aria-hidden="true">
              <svg viewBox="0 0 72 72">
                <path d="M8 36s10-17 28-17 28 17 28 17-10 17-28 17S8 36 8 36Z" />
                <circle cx="36" cy="36" r="10" />
                <path d="m48 51 6 6 11-14" />
              </svg>
            </span>
            <strong ref="statusHeading" tabindex="-1">시선 추적기가 연결되었습니다</strong>
            <p>아동에게 나타나는 점을 눈으로 따라보도록 안내해 주세요.</p>
            <button class="primary-button" type="button" @click="startCalibration">
              시선 보정 시작
            </button>
          </div>

          <div v-else-if="calibrationState === 'calibrating'" class="target-stage">
            <p class="target-instruction">빛나는 점을 눈으로 따라봐요</p>
            <span
              class="calibration-target"
              :style="{
                left: `${targetPositions[currentTargetIndex]?.x ?? 50}%`,
                top: `${targetPositions[currentTargetIndex]?.y ?? 50}%`,
              }"
              aria-hidden="true"
            >
              <i></i>
            </span>
            <div class="target-progress" role="status" aria-live="polite">
              <span>{{ progressLabel }}</span>
              <i
                v-for="(_, index) in targetPositions"
                :key="index"
                :class="{ complete: index <= currentTargetIndex }"
                aria-hidden="true"
              ></i>
            </div>
            <button class="problem-button" type="button" @click="markCalibrationProblem">
              보정이 잘 되지 않아요
            </button>
          </div>

          <div v-else-if="calibrationState === 'retry'" class="stage-message">
            <span class="status-icon status-icon--retry" aria-hidden="true">
              <svg viewBox="0 0 72 72">
                <path d="M16 24a23 23 0 1 1-2 20" />
                <path d="M7 19h14v14" />
                <path d="M36 25v14M36 48h.01" />
              </svg>
            </span>
            <strong ref="statusHeading" tabindex="-1">시선 보정을 다시 확인해 주세요</strong>
            <p>자세와 기기 위치를 조정해 다시 시도하거나 마우스로 계속할 수 있습니다.</p>
            <div class="retry-actions">
              <button class="primary-button" type="button" @click="startCalibration">
                다시 보정
              </button>
              <button class="secondary-button" type="button" @click="usePointerFallback">
                마우스로 계속하기
              </button>
            </div>
          </div>

          <div
            v-else-if="calibrationState === 'success'"
            class="stage-message"
            role="status"
          >
            <span class="status-icon status-icon--success" aria-hidden="true">
              <svg viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="29" />
                <path d="m21 37 10 10 21-24" />
              </svg>
            </span>
            <strong ref="statusHeading" tabindex="-1">시선 보정이 완료되었습니다</strong>
            <p>이 세션에서는 시선 추적 방식으로 읽기 활동을 진행합니다.</p>
          </div>

          <div v-else class="stage-message" role="status">
            <span class="status-icon status-icon--pointer" aria-hidden="true">
              <svg viewBox="0 0 72 72">
                <path d="m19 8 35 32-17 3 10 18-9 5-10-18-11 13 2-53Z" />
                <path d="M49 14v10M44 19h10" />
              </svg>
            </span>
            <strong ref="statusHeading" tabindex="-1">마우스 사용으로 준비되었습니다</strong>
            <p>시선 원천 데이터가 없는 포인터 대체 세션으로 기록합니다.</p>
          </div>
        </section>

        <aside class="teacher-guide" aria-labelledby="teacher-guide-title">
          <div class="student-chip">
            <span aria-hidden="true">{{ selectedStudent?.name.slice(0, 1) }}</span>
            <div>
              <strong>{{ selectedStudent?.name }}</strong>
              <small>{{ selectedStudent?.gradeLabel }} · {{ selectedStudent?.groupLabel }}</small>
            </div>
          </div>

          <h2 id="teacher-guide-title">보정 전 확인</h2>
          <ol>
            <li>
              <span>1</span>
              <p>아동의 눈과 화면 중앙 높이를 맞춥니다.</p>
            </li>
            <li>
              <span>2</span>
              <p>고개보다 눈으로 점을 따라보도록 안내합니다.</p>
            </li>
            <li>
              <span>3</span>
              <p>보정 중에는 교수자가 아동 옆에서 지켜봅니다.</p>
            </li>
          </ol>

          <div class="data-note">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M24 5 8 11v12c0 10 6 17 16 21 10-4 16-11 16-21V11L24 5Z" />
              <path d="M24 17v11M24 34h.01" />
            </svg>
            <p>
              보정은 기기 준비 단계입니다. 음성과 시선 원천 데이터 수집은 실제 읽기·말하기
              문항이 시작된 동안에만 진행합니다.
            </p>
          </div>
        </aside>
      </div>
    </section>

    <SessionReadyNotice
      :open="readyNoticeOpen"
      :input-mode="inputMode"
      @continue="continueToLearnerHome"
    />
  </main>
</template>

<style scoped>
.calibration-page {
  min-height: 100dvh;
  overflow-x: hidden;
  background: var(--learner-page-background);
  color: var(--learner-color-text);
  font-family: var(--educator-font);
}

.session-header {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--learner-space-6);
  padding: var(--learner-space-3) clamp(24px, 5vw, 72px);
  border-bottom: 1px solid rgb(23 38 80 / 10%);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--learner-shadow-small);
}

.session-header > img {
  width: clamp(180px, 18vw, 260px);
  height: 64px;
  object-fit: contain;
  transform: scale(1.7);
}

.back-button {
  min-height: var(--learner-control-height-small);
  display: flex;
  align-items: center;
  gap: var(--learner-space-2);
  padding: 0 var(--learner-space-4);
  border: 2px solid #c9d5e6;
  border-radius: var(--learner-radius-small);
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  cursor: pointer;
  font-size: 15px;
  font-weight: 750;
}

.back-button svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.calibration-shell {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(32px, 5vw, 64px) 0;
}

.calibration-heading {
  display: grid;
  justify-items: center;
  margin-bottom: var(--learner-space-8);
  text-align: center;
}

.step-badge {
  padding: var(--learner-space-2) var(--learner-space-4);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 850;
}

.teacher-only {
  margin: var(--learner-space-3) 0 var(--learner-space-1);
  color: var(--learner-color-primary-dark);
  font-size: 14px;
  font-weight: 850;
}

.calibration-heading h1 {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: clamp(30px, 4vw, 46px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.25;
  word-break: keep-all;
}

.calibration-heading > p:last-child {
  margin: var(--learner-space-3) 0 0;
  color: var(--learner-color-text-soft);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.6;
  word-break: keep-all;
}

.calibration-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: var(--learner-space-6);
}

.calibration-stage {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: var(--learner-radius-card);
  background:
    radial-gradient(circle at 50% 50%, rgb(255 255 255 / 85%) 0 2px, transparent 3px),
    linear-gradient(145deg, #dceeff, #f6fbff 58%, #edf6ff);
  box-shadow:
    inset 0 0 0 2px rgb(62 102 233 / 10%),
    var(--learner-shadow-card);
}

.stage-message {
  min-height: 520px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--learner-space-4);
  padding: clamp(28px, 5vw, 56px);
  text-align: center;
}

.stage-message > strong {
  font-family: var(--learner-font-display);
  font-size: clamp(26px, 3vw, 36px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.3;
  word-break: keep-all;
}

.stage-message > strong:focus {
  outline: none;
}

.stage-message > p {
  max-width: 520px;
  margin: 0;
  color: var(--learner-color-text-soft);
  font-size: 18px;
  font-weight: 650;
  line-height: 1.6;
  word-break: keep-all;
}

.device-spinner {
  width: 86px;
  height: 86px;
  border: 8px solid #d7e4f5;
  border-top-color: var(--learner-color-primary);
  border-radius: 50%;
  animation: device-spin 1s linear infinite;
}

.status-icon {
  width: 118px;
  height: 118px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e5efff;
  color: var(--learner-color-primary);
}

.status-icon svg {
  width: 78px;
  height: 78px;
  fill: none;
  stroke: currentColor;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.status-icon--success {
  background: #e5f7e9;
  color: var(--learner-color-success);
}

.status-icon--retry {
  background: #fff2d9;
  color: #bd7b15;
}

.status-icon--pointer {
  background: #eef0ff;
  color: #6657c9;
}

.primary-button,
.secondary-button,
.problem-button {
  min-height: var(--learner-control-height-medium);
  padding: 0 var(--learner-space-6);
  border-radius: var(--learner-radius-medium);
  cursor: pointer;
  font-size: 18px;
  font-weight: 850;
}

.primary-button {
  border: 0;
  background: var(--learner-color-primary);
  color: #fff;
  box-shadow: 0 6px 0 var(--learner-color-primary-dark);
}

.secondary-button,
.problem-button {
  border: 2px solid #9eb2cf;
  background: #fff;
  color: var(--learner-color-text);
}

.retry-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--learner-space-3);
  margin-top: var(--learner-space-2);
}

.target-stage {
  position: relative;
  width: 100%;
  min-height: 520px;
  overflow: hidden;
}

.target-instruction {
  position: absolute;
  z-index: 2;
  top: var(--learner-space-6);
  left: 50%;
  margin: 0;
  padding: var(--learner-space-2) var(--learner-space-5);
  transform: translateX(-50%);
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 88%);
  color: var(--learner-color-text);
  box-shadow: var(--learner-shadow-small);
  font-family: var(--learner-font-display);
  font-size: 20px;
  font-weight: 850;
  white-space: nowrap;
}

.calibration-target {
  position: absolute;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgb(255 215 73 / 24%);
  box-shadow: 0 0 0 14px rgb(255 215 73 / 12%);
  transition:
    left 300ms var(--learner-easing-standard),
    top 300ms var(--learner-easing-standard);
}

.calibration-target i {
  width: 34px;
  height: 34px;
  border: 7px solid #fff;
  border-radius: 50%;
  background: #ffbd31;
  box-shadow: 0 4px 12px rgb(118 81 7 / 25%);
  animation: target-pulse 900ms ease-in-out infinite;
}

.target-progress {
  position: absolute;
  left: 50%;
  bottom: var(--learner-space-6);
  display: flex;
  align-items: center;
  gap: var(--learner-space-2);
  padding: var(--learner-space-2) var(--learner-space-4);
  transform: translateX(-50%);
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--learner-shadow-small);
}

.target-progress span {
  min-width: 38px;
  font-size: 14px;
  font-weight: 850;
}

.target-progress i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cfdae8;
}

.target-progress i.complete {
  background: var(--learner-color-primary);
}

.problem-button {
  position: absolute;
  right: var(--learner-space-5);
  bottom: var(--learner-space-5);
  z-index: 2;
}

.teacher-guide {
  align-self: start;
  padding: var(--learner-space-6);
  border: 3px solid #fff;
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 90%);
  box-shadow: var(--learner-shadow-small);
}

.student-chip {
  display: flex;
  align-items: center;
  gap: var(--learner-space-3);
  padding-bottom: var(--learner-space-5);
  border-bottom: 1px solid #dce4ef;
}

.student-chip > span {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #ffe2d8;
  color: #a64d42;
  font-family: var(--learner-font-display);
  font-size: 22px;
  font-weight: 900;
}

.student-chip div {
  display: grid;
}

.student-chip strong {
  font-size: 19px;
  font-weight: 850;
}

.student-chip small {
  color: var(--learner-color-text-soft);
  font-size: 13px;
  font-weight: 650;
}

.teacher-guide h2 {
  margin: var(--learner-space-6) 0 var(--learner-space-4);
  font-size: 20px;
  font-weight: 850;
}

.teacher-guide ol {
  display: grid;
  gap: var(--learner-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.teacher-guide li {
  display: grid;
  grid-template-columns: 34px 1fr;
  align-items: start;
  gap: var(--learner-space-3);
}

.teacher-guide li > span {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e9f0ff;
  color: var(--learner-color-primary-dark);
  font-weight: 900;
}

.teacher-guide li p,
.data-note p {
  margin: 0;
  color: #465a77;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.55;
  word-break: keep-all;
}

.data-note {
  display: flex;
  align-items: flex-start;
  gap: var(--learner-space-3);
  margin-top: var(--learner-space-6);
  padding: var(--learner-space-4);
  border-radius: var(--learner-radius-medium);
  background: #f0f5fb;
}

.data-note svg {
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--learner-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@keyframes device-spin {
  to { transform: rotate(360deg); }
}

@keyframes target-pulse {
  50% { transform: scale(1.18); }
}

@media (max-width: 960px) {
  .calibration-layout {
    grid-template-columns: 1fr;
  }

  .teacher-guide {
    order: -1;
  }

  .teacher-guide ol {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 680px) {
  .session-header {
    padding-inline: var(--learner-space-4);
  }

  .session-header > img {
    width: 145px;
  }

  .back-button {
    width: var(--learner-control-height-small);
    padding: 0;
    justify-content: center;
    overflow: hidden;
    color: transparent;
    font-size: 0;
  }

  .back-button svg {
    color: var(--learner-color-text);
  }

  .calibration-shell {
    width: min(100% - 32px, 1180px);
    padding-block: var(--learner-space-8);
  }

  .teacher-guide ol {
    grid-template-columns: 1fr;
  }

  .calibration-stage,
  .stage-message,
  .target-stage {
    min-height: 460px;
  }

  .problem-button {
    right: 50%;
    bottom: 76px;
    transform: translateX(50%);
    white-space: nowrap;
  }

  .target-progress {
    bottom: var(--learner-space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .calibration-target {
    transition: none;
  }

  .calibration-target i {
    animation: none;
  }

  .device-spinner {
    animation-duration: 2s;
  }
}
</style>
