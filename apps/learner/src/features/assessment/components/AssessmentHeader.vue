<script setup lang="ts">
defineProps<{ progressPercent: number }>()
defineEmits<{ home: [] }>()
</script>

<template>
  <header class="assessment-header">
    <button class="home-button" type="button" aria-label="테스트 나가기 메뉴 열기" @click="$emit('home')">⌂</button>
    <div class="progress" aria-label="테스트 진행률">
      <span :style="{ width: `${progressPercent}%` }"></span>
    </div>
    <span class="progress-label">천천히 해도 괜찮아요</span>
  </header>
</template>

<style scoped>
.assessment-header{display:grid;align-items:center;gap:18px;padding:18px 28px;background:#fff;grid-template-columns:58px minmax(180px,1fr) auto;box-shadow:0 2px 0 rgb(18 74 109 / .1)}.home-button{width:56px;height:56px;border:3px solid #1769aa;border-radius:18px;background:#fff;color:#1769aa;font-size:34px;font-weight:900}.progress{height:18px;overflow:hidden;border-radius:999px;background:#dbeaf3}.progress span{display:block;height:100%;border-radius:inherit;background:#36a96b;transition:width .25s ease}.progress-label{color:#426477;font-size:16px;font-weight:800}@media(max-width:700px){.assessment-header{padding:12px 16px;grid-template-columns:52px 1fr}.progress-label{display:none}}
</style>


