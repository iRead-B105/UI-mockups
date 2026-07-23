<script setup lang="ts">
defineEmits<{ continue: []; pause: []; stop: [] }>()
</script>

<template>
  <div class="dialog-backdrop" role="presentation">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <h2 id="pause-title">어떻게 할까요?</h2>
      <p>지금까지 한 것은 안전하게 남아 있어요.</p>
      <button class="primary" type="button" @click="$emit('continue')">계속할래요</button>
      <button type="button" @click="$emit('pause')">잠깐 쉴래요</button>
      <button type="button" @click="$emit('stop')">그만하고 나갈래요</button>
    </section>
  </div>
</template>

<style scoped>
.dialog-backdrop{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:20px;background:rgb(14 43 61 / .62)}.dialog{display:grid;width:min(430px,100%);gap:12px;padding:32px;border-radius:28px;background:#fff;text-align:center;box-shadow:0 20px 60px rgb(0 0 0 / .22)}.dialog h2{margin:0;color:#173d57;font-size:28px}.dialog p{margin:0 0 10px;color:#527183;font-size:16px}.dialog button{min-height:56px;border:2px solid #b8cedb;border-radius:16px;background:#fff;color:#244c65;font-weight:900}.dialog button.primary{border-color:#1769aa;background:#1769aa;color:#fff}
</style>


