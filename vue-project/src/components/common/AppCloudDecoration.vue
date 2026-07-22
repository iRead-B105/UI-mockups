<script setup lang="ts">
withDefaults(defineProps<{ size?: 'small' | 'medium' | 'large' }>(), { size: 'medium' })
</script>

<template>
  <span class="cloud-shape" :class="`cloud-shape--${size}`" aria-hidden="true" />
</template>

<style scoped>
.cloud-shape {
  position: relative;
  display: block;
  width: 128px;
  height: 38px;
  border-radius: var(--learner-radius-pill);
  background: color-mix(in srgb, var(--learner-color-surface) 88%, transparent);
  pointer-events: none;
}
.cloud-shape::before,.cloud-shape::after { position:absolute;bottom:0;border-radius:50%;background:inherit;content:''; }
.cloud-shape::before { left:15%;width:52%;height:175%; }
.cloud-shape::after { right:9%;width:43%;height:125%; }
.cloud-shape--small { transform:scale(.72); }
.cloud-shape--large { transform:scale(1.18); }
</style>
