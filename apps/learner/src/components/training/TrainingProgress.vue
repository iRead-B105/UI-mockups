<script setup lang="ts">
// 훈련 진행 바
// 현재 문제 번호(1부터)와 전체 문제 수를 받아 진행도를 표시합니다.
// 부모가 상태를 넘겨주는 단순 prop 주도 컴포넌트로, 여러 화면에서 재사용합니다.

const props = withDefaults(
  defineProps<{
    current: number // 현재 문제 번호(1부터)
    total: number // 전체 문제 수
    showDots?: boolean
  }>(),
  { showDots: true },
)

const percent = Math.min(100, Math.max(0, (props.current / Math.max(1, props.total)) * 100))
</script>

<template>
  <div class="progress-wrapper">
    <div
      class="progress-bar"
      role="progressbar"
      :aria-valuenow="current"
      :aria-valuemin="1"
      :aria-valuemax="total"
      :aria-label="`현재 ${current}번, 전체 ${total}문제`"
    >
      <div class="progress-fill" :style="{ width: `${percent}%` }"></div>
      <div v-if="showDots" class="progress-dots" aria-hidden="true">
        <span
          v-for="i in total"
          :key="i"
          class="progress-dot"
          :class="{ 'is-active': i <= current }"
        ></span>
      </div>
    </div>
    <span class="progress-text">{{ current }} / {{ total }}</span>
  </div>
</template>

<style scoped>
.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-2);
  width: 100%;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 14px;
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 45%);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-learning);
  transition: width var(--learner-duration-slow) var(--learner-easing-standard);
}

.progress-dots {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 0 var(--learner-space-2);
  pointer-events: none;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(255 255 255 / 70%);
  transition: background var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.progress-dot.is-active {
  background: var(--learner-color-text-inverse);
  transform: scale(1.15);
}

.progress-text {
  align-self: flex-end;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text);
}
</style>
