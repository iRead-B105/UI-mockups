<script setup lang="ts">
import SaveToast from '@/components/common/SaveToast.vue'

withDefaults(
  defineProps<{
    saved: boolean
    disabled: boolean
    saveLabel?: string
    savedMessage?: string
  }>(),
  {
    saveLabel: '변경 사항 저장',
    savedMessage: '변경 사항이 저장되었습니다.',
  },
)

defineEmits<{
  cancel: []
}>()
</script>

<template>
  <footer class="form-actions">
    <SaveToast :visible="saved" :message="savedMessage" inline />
    <div class="form-actions__buttons">
      <button class="button button--secondary" type="button" @click="$emit('cancel')">취소</button>
      <button class="button" type="submit" :disabled="disabled">{{ saveLabel }}</button>
    </div>
  </footer>
</template>

<style scoped>
.form-actions {
  display: flex;
  width: min(100%, 620px);
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-left: auto;
  padding: 14px 0 18px;
  border-top: 1px solid var(--slate-300);
}

.form-actions__buttons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
</style>
