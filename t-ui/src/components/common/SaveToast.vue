<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    message?: string
  }>(),
  {
    message: '변경 사항이 저장되었습니다.',
  },
)
</script>

<template>
  <Transition name="save-toast">
    <div v-if="visible" class="save-toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.save-toast {
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
  .save-toast {
    display: none;
  }
}
</style>
