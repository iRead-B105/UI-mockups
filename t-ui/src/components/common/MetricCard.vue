<script setup lang="ts">
defineProps<{
  label: string
  value: string
  description: string
  tone?: 'primary' | 'sky' | 'warning'
}>()
</script>

<template>
  <article class="metric-card surface" :class="`metric-card--${tone ?? 'primary'}`">
    <div class="metric-card__icon"><slot /></div>
    <div>
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
      <span>{{ description }}</span>
    </div>
  </article>
</template>

<style scoped>
.metric-card {
  display: grid;
  align-items: center;
  gap: 16px;
  padding: 22px;
  grid-template-columns: 54px 1fr;
}

.metric-card__icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 16px;
  background: var(--primary-50);
  color: var(--primary-600);
  font-size: 23px;
  font-weight: 800;
}

.metric-card--sky .metric-card__icon {
  background: #e0f2fe;
  color: var(--sky-500);
}

.metric-card--warning .metric-card__icon {
  background: #fff7ed;
  color: var(--warning-500);
}

.metric-card p {
  margin: 0 0 5px;
  color: var(--slate-500);
  font-size: 13px;
  font-weight: 700;
}

.metric-card strong {
  margin-right: 8px;
  font-size: 26px;
}

.metric-card span {
  color: var(--slate-500);
  font-size: 12px;
}
</style>
