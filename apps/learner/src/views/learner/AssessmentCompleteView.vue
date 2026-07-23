<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <main class="complete-view">
    <div class="complete-icon" aria-hidden="true">★</div>
    <h1>모두 마쳤어요</h1>
    <p>끝까지 참여해 주어서 고마워요.<br />결과는 선생님이 확인할 거예요.</p>
    <button type="button" @click="router.push({ name: 'learner-home' })">홈으로 가기</button>
  </main>
</template>

<style scoped>
.complete-view{height:100dvh;display:grid;place-content:center;justify-items:center;gap:18px;padding:28px;background:linear-gradient(180deg,#eaf8ff,#fff);color:#173d57;text-align:center;font-family:var(--learner-font-reading)}.complete-icon{display:grid;width:110px;height:110px;place-items:center;border-radius:50%;background:#ffd24a;color:#7b5800;font-size:60px}.complete-view h1{margin:0;font-size:42px}.complete-view p{margin:0;color:#527183;font-size:20px;line-height:1.6}.complete-view button{min-width:210px;min-height:64px;margin-top:8px;border:0;border-radius:20px;background:#1769aa;color:#fff;font-size:21px;font-weight:900;box-shadow:0 6px 0 #0c4776}
</style>


