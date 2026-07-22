<script setup lang="ts">
// 훈련 레슨 화면: 인트로 → 문제 풀이 → 결과 저장
// 세션 상태는 useTrainingSession(싱글톤)에서 공유합니다.
// 액티비티는 'next' 이벤트만 보내며, 다음 레슨으로의 이동/자동 진행은 이곳에서 처리합니다.
// (향후 자동 커리큘럼 연결 시 이 지점의 goNext/finish 흐름을 서버 세션 기반으로 교체)
//
// 본 화면은 "메인 섬 화면"처럼 요소를 최소로 유지합니다.
// 토끼 캐릭터(RiveGuideCharacter)가 화면에 상주하며 말풍선으로 응원·피드백을 전합니다.
// 별도의 피드백 배너/무거운 헤더 대신 토끼 한 마리가 역할을 모두 맡습니다.

import { computed, onMounted, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TrainingActivityType } from '@/types/training'
import { getLessonById } from '@/mocks/trainingLessons'
import { useTrainingSession } from '@/composables/useTrainingSession'
import TrainingIntro from '@/components/training/TrainingIntro.vue'
import RiveGuideCharacter from '@/components/RiveGuideCharacter.vue'
import ListenAndSelectActivity from '@/components/training/activities/ListenAndSelectActivity.vue'
import SoundBuildActivity from '@/components/training/activities/SoundBuildActivity.vue'
import SoundOmitActivity from '@/components/training/activities/SoundOmitActivity.vue'
import SoundChoiceActivity from '@/components/training/activities/SoundChoiceActivity.vue'
import FillBlankActivity from '@/components/training/activities/FillBlankActivity.vue'
import SentenceOrderActivity from '@/components/training/activities/SentenceOrderActivity.vue'
import CardCombineActivity from '@/components/training/activities/CardCombineActivity.vue'
import SentenceChoiceActivity from '@/components/training/activities/SentenceChoiceActivity.vue'
import ReadAloudActivity from '@/components/training/activities/ReadAloudActivity.vue'

const route = useRoute()
const router = useRouter()
const session = useTrainingSession()

const categoryId = computed(() => String(route.params.categoryId ?? ''))
const lessonId = computed(() => String(route.params.lessonId ?? ''))

const lesson = computed(() => getLessonById(lessonId.value))
// 구현된 액티비티 컴포넌트만 매핑. 준비 중 유형은 여기 없으며(도달 불가),
// 향후 추가 시 이 맵에만 등록하면 됩니다.
const activityComponents: Partial<Record<TrainingActivityType, Component>> = {
  'listen-and-select': ListenAndSelectActivity,
  'sound-choice': SoundChoiceActivity,
  'sound-omit': SoundOmitActivity,
  'sound-blend': SoundBuildActivity,
  'card-combine': CardCombineActivity,
  'sentence-choice': SentenceChoiceActivity,
  'read-aloud': ReadAloudActivity,
  'fill-blank': FillBlankActivity,
  'sentence-order': SentenceOrderActivity,
}

const activityComponent = computed<Component | null>(() =>
  lesson.value ? (activityComponents[lesson.value.activityType] ?? null) : null,
)

type Phase = 'intro' | 'playing' | 'saving'
const phase = ref<Phase>('intro')

const currentQuestion = computed(() => session.currentQuestion.value)

onMounted(() => {
  // 세션 초기화 및 첫 문제 준비(이전 정답/녹음은 모두 리셋)
  if (lesson.value) {
    session.startLesson(lesson.value)
  }
  phase.value = 'intro'
})

const startPlaying = () => {
  phase.value = 'playing'
}

const exitToHome = () => {
  void router.push({ name: 'training-home' })
}

// 다음 문제로 이동. 마지막 문제면 결과 저장 흐름으로 진입.
const goNext = () => {
  const hasMore = session.nextQuestion()
  if (!hasMore) {
    void saveAndFinish()
  }
}

// 목업 결과 저장(첫 시도 실패 → 재시도 성공). 저장 중에는 입력 잠금.
const saveAndFinish = async () => {
  phase.value = 'saving'
  const ok = await session.saveResult()
  if (ok) {
    session.completeLesson()
    // 완료 화면으로 자동 이동
    void router.replace({
      name: 'training-complete',
      params: { categoryId: categoryId.value, lessonId: lessonId.value },
    })
  }
  // 실패 시 phase 는 'saving' 유지 → 저장 오버레이에서 재시도 버튼 노출
}

const isSavingFailed = computed(() => session.savingState.status === 'failed')

// ---- 토끼(컴패니언) 응원/피드백 ----
// 풀이 대기 중: 액티비티 유형에 맞춘 가벼운 응원.
const waitingEncouragement = computed(() => {
  switch (lesson.value?.activityType) {
    case 'listen-and-select':
    case 'sound-choice':
      return '소리를 잘 듣고\n골라보세요!'
    case 'sound-omit':
      return '들은 소리가 되도록\n하나를 빼보세요!'
    case 'sound-blend':
      return '소리를 차례로\n모아보세요!'
    case 'card-combine':
      return '카드를 모아서\n글자를 만들어요!'
    case 'sentence-choice':
      return '그림을 보고\n맞는 문장을 골라요!'
    case 'fill-blank':
      return '빈칸에 맞는\n낱말을 골라요!'
    case 'sentence-order':
      return '낱말을 차례로\n놓아보세요!'
    case 'read-aloud':
      return '큰 목소리로\n따라 읽어요!'
    default:
      return '천천히\n생각해봐요!'
  }
})

// 토끼 말풍선 메시지: 단계/정답 상태에 따라 한 줄로 응원하거나 친절하게 피드백.
const companionMessage = computed(() => {
  if (phase.value === 'intro') return '윤정아!\n오늘도 화이팅!'
  const q = currentQuestion.value
  if (!q) return '힘내요!'
  if (session.progressState.isCurrentCorrect === true) return q.feedback?.correct ?? '잘했어요!'
  if (session.progressState.isCurrentCorrect === false) return q.feedback?.retry ?? '괜찮아요.\n한 번 더 해봐요.'
  return waitingEncouragement.value
})

// 정답이면 토끼가 손을 흔들며 환호(cheer).
const companionMood = computed<'idle' | 'cheer'>(() =>
  phase.value === 'playing' && session.progressState.isCurrentCorrect === true ? 'cheer' : 'idle',
)
</script>

<template>
  <div class="lesson-view">
    <!-- 상단: 뒤로가기 + 진행 점(풀이 중에만). 요소를 최소로. -->
    <div v-if="phase !== 'saving' && lesson" class="lesson-topbar">
      <button class="topbar-back" type="button" aria-label="그만하고 나가기" @click="exitToHome">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M30 36L18 24l12-12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="lesson-title">
        <strong>{{ lesson.title }}</strong>
      </div>
      <div
        v-if="phase === 'playing'"
        class="topbar-progress"
        role="status"
        :aria-label="`현재 ${session.currentQuestionNumber.value}번, 전체 ${session.totalQuestions.value}문제`"
      >
        <span
          v-for="i in session.totalQuestions.value"
          :key="i"
          class="prog-dot"
          :class="{ active: i <= session.currentQuestionNumber.value }"
        ></span>
      </div>
    </div>

    <!-- 인트로 -->
    <TrainingIntro
      v-if="phase === 'intro' && lesson"
      :lesson="lesson"
      @start="startPlaying"
    />

    <!-- 문제 풀이 -->
    <div v-else-if="phase === 'playing' && lesson" class="playing">
      <div class="question-scroll">
        <component
          :is="activityComponent"
          v-if="currentQuestion && activityComponent"
          :key="currentQuestion.id"
          :question="currentQuestion"
          @next="goNext"
        />
      </div>
    </div>

    <!-- 토끼(응원/피드백). 인트로·풀이에 상주. 저장 중엔 숨김 -->
    <RiveGuideCharacter
      v-if="phase !== 'saving' && lesson"
      :message="companionMessage"
      :mood="companionMood"
    />

    <!-- 저장 오버레이(저장 중 입력 잠금) -->
    <Transition name="fade">
      <div v-if="phase === 'saving'" class="saving-overlay" role="status" aria-live="polite">
        <div class="saving-panel">
          <template v-if="!isSavingFailed">
            <span class="saving-spinner" aria-hidden="true"></span>
            <p class="saving-text">결과를 저장하고 있어요…</p>
          </template>
          <template v-else>
            <p class="saving-icon" aria-hidden="true">!</p>
            <p class="saving-text">{{ session.savingState.errorMessage }}</p>
            <button class="retry-button" type="button" @click="saveAndFinish">다시 시도할래요</button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- 폴백: 알 수 없는 레슨 -->
    <div v-if="!lesson" class="fallback">
      <p>레슨을 불러올 수 없어요.</p>
      <button class="retry-button" type="button" @click="exitToHome">훈련 선택으로 가기</button>
    </div>
  </div>
</template>

<style scoped>
.lesson-view {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 상단바: 뒤로가기 + 진행 점만. 헤더 한 줄로 최소화 */
.lesson-topbar {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: var(--learner-space-3) var(--learner-page-padding);
}
.topbar-back {
  width: var(--learner-control-height-small);
  height: var(--learner-control-height-small);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--learner-radius-medium);
  background: rgb(255 255 255 / 60%);
  color: var(--learner-color-text);
  cursor: pointer;
  transition: background var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.topbar-back:hover { background: rgb(255 255 255 / 90%); transform: translateX(-2px); }
.topbar-back:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }
.topbar-back svg { width: 26px; height: 26px; }

.topbar-progress {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: var(--learner-space-2);
}
.prog-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgb(255 255 255 / 55%);
  transition: background var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.prog-dot.active {
  background: var(--learner-color-learning);
  transform: scale(1.15);
}

.playing {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 var(--learner-page-padding) var(--learner-space-6);
}

.question-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--learner-space-4) 0;
}

.saving-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: var(--learner-page-padding);
  background: color-mix(in srgb, var(--learner-color-text) 45%, transparent);
}
.saving-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-4);
  width: min(92%, 420px);
  padding: var(--learner-space-10);
  border-radius: var(--learner-radius-card);
  background: var(--learner-color-surface);
  box-shadow: var(--learner-shadow-floating);
  text-align: center;
}
.saving-spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 6px solid color-mix(in srgb, var(--learner-color-primary) 25%, transparent);
  border-top-color: var(--learner-color-primary);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.saving-icon {
  width: 64px;
  height: 64px;
  margin: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--learner-color-error);
  color: #fff;
  font-family: var(--learner-font-display);
  font-size: 40px;
  font-weight: var(--learner-font-weight-heavy);
}
.saving-text {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
  line-height: 1.3;
}
.retry-button {
  min-height: var(--learner-control-height-medium);
  padding: 0 var(--learner-space-6);
  border: none;
  border-radius: var(--learner-radius-large);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-heavy);
  cursor: pointer;
  box-shadow: var(--learner-shadow-card);
}
.retry-button:hover { transform: translateY(-2px); box-shadow: var(--learner-shadow-floating); }
.retry-button:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }

.fallback {
  height: 100%;
  display: grid;
  place-items: center;
  gap: var(--learner-space-4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--learner-duration-normal) var(--learner-easing-standard);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .saving-spinner { animation: none; }
}
.lesson-view{background:linear-gradient(180deg,#a9ddff 0%,#d9f1ff 54%,#b9e68c 100%)}
.lesson-topbar{position:absolute;left:50%;top:28px;width:min(calc(100% - 96px),1280px);height:54px;padding:0 18px;transform:translateX(-50%)}
.topbar-back{background:#fff9df;border:2px solid #ead487;box-shadow:0 5px 12px rgba(71,83,104,.14)}
.lesson-title{position:absolute;left:50%;display:flex;align-items:baseline;gap:10px;transform:translateX(-50%);font-family:var(--learner-font-display)}
.lesson-title span{color:#8c742c;font-size:15px;font-weight:800}
.lesson-title strong{color:#233d79;font-size:27px;font-weight:900}
.topbar-progress{left:auto;right:18px;min-width:180px;justify-content:center;padding:14px 20px;border:2px solid #f0dfad;border-radius:999px;background:rgba(255,255,255,.88);box-shadow:0 5px 12px rgba(71,83,104,.12);transform:translateY(-50%)}
.prog-dot{width:11px;height:11px;background:#e7dec5}.prog-dot.active{background:#f1bd3e}
.playing{width:min(calc(100% - 56px),1360px);margin:16px auto 22px;padding:82px 26px 24px;border:4px solid rgba(255,255,255,.92);border-radius:36px;background:linear-gradient(180deg,#fff9dc,#fff4c6);box-shadow:0 14px 32px rgba(42,79,122,.2)}
.question-scroll{overflow:hidden;align-items:stretch;padding:0}
@media(max-width:900px){.lesson-topbar{width:calc(100% - 52px);top:20px}.lesson-title span{display:none}.lesson-title strong{font-size:22px}.topbar-progress{min-width:auto;padding-inline:12px}.playing{width:calc(100% - 28px);margin-block:10px;padding:72px 14px 14px}}
@media(max-height:800px){.lesson-topbar{top:12px}.playing{position:absolute;left:50%;right:auto;top:5px;bottom:10px;width:min(calc(100% - 56px),1360px);height:auto;margin:0;padding:72px 20px 16px;transform:translateX(-50%)}.question-scroll{min-height:0}.lesson-view :deep(.guide){width:250px;bottom:-24%}}
@media(max-width:1400px){.lesson-view :deep(.guide){display:none}}
</style>
