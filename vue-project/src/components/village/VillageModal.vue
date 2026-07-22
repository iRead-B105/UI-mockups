<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps<{ title: string; description: string }>()
const emit = defineEmits<{ close: [] }>()

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="modal-backdrop" role="presentation" @mousedown.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" :aria-label="title">
      <header>
        <div><h2>{{ title }}</h2><p>{{ description }}</p></div>
        <button class="close" type="button" aria-label="창 닫기" @click="emit('close')">×</button>
      </header>
      <slot />
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px;background:rgba(20,40,70,.48);backdrop-filter:blur(5px);animation:fade .2s ease}.modal{width:min(920px,94vw);max-height:min(760px,90dvh);overflow:auto;border:4px solid rgba(255,255,255,.9);border-radius:32px;background:#fffdf7;box-shadow:0 24px 70px rgba(20,54,92,.3);animation:pop .24s cubic-bezier(.2,1.3,.4,1)}header{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:28px 32px 20px;background:#fffdf7}h2{font-family:var(--learner-font-display);font-size:clamp(28px,3vw,40px);font-weight:900;line-height:1.15;color:#183661}p{margin-top:5px;font-size:18px;color:#61728a}.close{width:54px;height:54px;border:0;border-radius:50%;background:#edf5ff;color:#286ed8;font-size:38px;line-height:1;cursor:pointer}.close:hover{transform:scale(1.06)}button:focus-visible{outline:5px solid #ffd34e;outline-offset:3px}@keyframes fade{from{opacity:0}}@keyframes pop{from{opacity:0;transform:scale(.95)}}@media(max-width:600px){header{padding:22px 20px 14px}.modal-backdrop{padding:10px}.modal{border-radius:24px}}
</style>
