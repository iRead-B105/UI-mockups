<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

export interface StoryBook {
  id: string
  title: string
  coverImage: string
  route: RouteLocationRaw
}

defineProps<{ book: StoryBook }>()
</script>

<template>
  <RouterLink class="story-book" :to="book.route" :aria-label="`${book.title} 이야기 선택`">
    <img :src="book.coverImage" :alt="`${book.title} 이야기 표지`" />
  </RouterLink>
</template>

<style scoped>
.story-book { display:block;width:min(100%,300px);height:100%;overflow:hidden;border:var(--learner-border-width) solid var(--learner-border-color);border-radius:var(--learner-radius-medium);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-card);text-decoration:none;transform-origin:center bottom;transition:transform var(--learner-duration-normal) var(--learner-easing-standard),box-shadow var(--learner-duration-normal); }
.story-book img { display:block;width:100%;height:100%;object-fit:cover;object-position:center; }
.story-book:hover { transform:translateY(-6px) scale(1.02);box-shadow:var(--learner-shadow-floating); }
.story-book:active { transform:translateY(0) scale(1); }
.story-book:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }
@media (prefers-reduced-motion:reduce) { .story-book { transition:none; } }
</style>
