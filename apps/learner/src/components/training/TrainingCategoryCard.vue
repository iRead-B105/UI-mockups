<script setup lang="ts">
import { computed } from 'vue'
import type {
  TrainingDisplayCategory,
  TrainingDisplayCategoryId,
} from '@/mocks/trainingDisplayCatalog'

const props = defineProps<{
  category: TrainingDisplayCategory
}>()

const emit = defineEmits<{
  select: [categoryId: TrainingDisplayCategoryId]
}>()

const isSelected = computed(() => false) // 확장 가능
</script>

<template>
  <button
    class="category-card"
    :class="{ 'is-selected': isSelected }"
    @click="emit('select', category.id)"
  >
    <div class="card-content">
      <h3 class="card-title">{{ category.title }}</h3>
      <p class="card-description">{{ category.description }}</p>
    </div>
  </button>
</template>

<style scoped>
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-5);
  min-height: 180px;
  padding: var(--learner-space-10) var(--learner-space-6);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background: var(--learner-color-surface);
  box-shadow: var(--learner-shadow-card);
  cursor: pointer;
  transition: all var(--learner-duration-normal) var(--learner-easing-standard);
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--learner-shadow-floating);
}

.category-card:active {
  transform: translateY(-4px);
}

.card-content {
  text-align: center;
}

.card-title {
  margin: 0 0 var(--learner-space-2);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title);
  font-weight: var(--learner-font-weight-bold);
}

.card-description {
  margin: 0;
  color: var(--learner-color-text-soft);
  font-size: var(--learner-font-size-body);
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .category-card:hover,
  .category-card:active {
    transform: translateY(0);
  }
}
</style>
