<script setup lang="ts">
// visible은 표시 여부를 부모가 결정하고, message가 없으면 아래 기본 문구를 사용합니다.
withDefaults(
  defineProps<{
    visible: boolean
    message?: string
    showIcon?: boolean
  }>(),
  {
    message: '변경 사항이 저장되었습니다.',
    showIcon: true,
  },
)
</script>

<template>
  <!-- Transition은 요소가 생기고 사라질 때 아래 enter/leave CSS 애니메이션을 적용합니다. -->
  <Transition name="save-toast">
    <!-- v-if가 false면 HTML 자체를 제거합니다. role=status는 보조 기술에도 알림을 전달합니다. -->
    <div v-if="visible" class="save-toast" role="status" aria-live="polite">
      <span v-if="showIcon" aria-hidden="true">✓</span>
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.save-toast {
  /* position:absolute와 top/right로 부모 영역의 오른쪽 위에 떠 있는 알림을 만듭니다. */
  position: absolute;
  z-index: 2;
  top: 14px;
  right: 20px;
  display: flex;
  min-height: 46px;
  align-items: center;
  gap: 9px;
  padding: 11px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
  background: #f0fdf4;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
}

.save-toast span {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
}

.save-toast-enter-active,
.save-toast-leave-active {
  /* 나타남/사라짐 과정의 투명도와 위치 변화를 0.18초 동안 부드럽게 처리합니다. */
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.save-toast-enter-from,
.save-toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media print {
  /* 종이 또는 PDF로 인쇄할 때 순간 알림은 의미가 없으므로 숨깁니다. */
  .save-toast {
    display: none;
  }
}
</style>
