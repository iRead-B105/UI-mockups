<script setup lang="ts">
defineEmits<{ next: [] }>()
</script>

<template>
  <div class="neutral" role="status" aria-live="polite">
    <div class="neutral__dot" aria-hidden="true">✓</div>
    <strong>선택했어요</strong>
    <span>답을 기록했어요.</span>
    <button type="button" @click="$emit('next')">다음으로</button>
  </div>
</template>

<style scoped>
.neutral{position:fixed;inset:0;z-index:100;display:grid;place-content:center;justify-items:center;gap:12px;background:rgb(239 249 255 / .94);color:#173d57}.neutral__dot{display:grid;width:92px;height:92px;place-items:center;border-radius:50%;background:#1769aa;color:#fff;font-size:48px;font-weight:900}.neutral strong{font-size:30px}.neutral span{font-size:19px}
.neutral button{min-width:190px;min-height:60px;margin-top:8px;border:0;border-radius:20px;background:#1769aa;color:#fff;font-size:20px;font-weight:900;box-shadow:0 6px 0 #0c4776}.neutral button:focus-visible{outline:4px solid #ffd24a;outline-offset:4px}
</style>

