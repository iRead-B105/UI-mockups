<script setup lang="ts">
// 리소스 추가 필요 자리 표시 컴포넌트
// 실제 이미지 에셋이 없을 때만 사용합니다.
// 이모지/CSS 일러스트/불필요한 대체 이미지로 채우지 않습니다.

withDefaults(
  defineProps<{
    // 필요한 에셋 설명(예: "가방 그림 PNG")
    label?: string
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    label: '리소스 추가 필요',
    size: 'medium',
  },
)
</script>

<template>
  <!-- 리소스 추가 필요: {{ label }} -->
  <div class="resource-required" :class="`resource-required--${size}`" role="img" :aria-label="`리소스 추가 필요: ${label}`">
    <svg class="resource-icon" viewBox="0 0 48 48" aria-hidden="true">
      <rect x="8" y="6" width="32" height="36" rx="5" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="5 4" />
      <path d="M16 30l7-8 5 5 5-6 4 5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="resource-text">리소스 추가 필요</span>
    <span v-if="label && label !== '리소스 추가 필요'" class="resource-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.resource-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-2);
  border: var(--learner-border-width-strong) dashed var(--learner-color-text-soft);
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 35%);
  color: var(--learner-color-text-soft);
  text-align: center;
}

.resource-required--small {
  width: 120px;
  height: 120px;
  padding: var(--learner-space-3);
}
.resource-required--medium {
  width: 220px;
  height: 220px;
  padding: var(--learner-space-5);
}
.resource-required--large {
  width: 300px;
  height: 300px;
  padding: var(--learner-space-6);
}

.resource-icon {
  width: 56px;
  height: 56px;
  opacity: 0.7;
}
.resource-required--small .resource-icon {
  width: 36px;
  height: 36px;
}

.resource-text {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
}
.resource-required--small .resource-text {
  font-size: var(--learner-font-size-caption);
}

.resource-label {
  font-size: var(--learner-font-size-caption);
  opacity: 0.8;
}
</style>
