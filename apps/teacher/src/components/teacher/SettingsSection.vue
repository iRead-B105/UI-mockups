<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="settings-section" :aria-label="title">
    <header class="settings-section__header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot name="actions" />
    </header>
    <div class="settings-section__content"><slot /></div>
  </section>
</template>

<style scoped>
.settings-section {
  display: grid;
  align-items: start;
  column-gap: 40px;
  padding: 22px 0 26px;
  grid-template-columns: minmax(180px, 1fr) minmax(0, 620px);
}

.settings-section + .settings-section {
  margin-top: 12px;
}

.settings-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 0;
}

.settings-section__header h2 {
  margin: 0;
  color: var(--slate-950);
  font-size: 17px;
}

.settings-section__header p {
  margin: 3px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.settings-section__content {
  min-width: 0;
}

@media (max-width: 900px) {
  .settings-section {
    row-gap: 20px;
    grid-template-columns: 1fr;
  }
}
</style>
