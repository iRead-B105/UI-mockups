<script setup lang="ts">
defineProps<{ disabled?: boolean; label?: string }>()
defineEmits<{ submit: [] }>()
</script>

<template>
  <button class="submit-button" type="button" :disabled="disabled" @click="$emit('submit')">
    {{ label ?? '선택 완료' }}
  </button>
</template>

<style scoped>
.submit-button{min-width:190px;min-height:64px;padding:0 30px;border:0;border-radius:20px;background:#1769aa;color:#fff;font-size:21px;font-weight:900;box-shadow:0 6px 0 #0c4776}.submit-button:disabled{background:#b7c3cb;box-shadow:0 4px 0 #8798a3;color:#f5f7f8}.submit-button:focus-visible{outline:4px solid #ffd24a;outline-offset:4px}
</style>


