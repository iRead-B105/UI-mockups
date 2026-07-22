<script setup lang="ts">
import StoryBookCard, { type StoryBook } from './StoryBookCard.vue'
defineProps<{ books: StoryBook[]; pageKey: number }>()
</script>

<template>
  <section class="bookshelf" aria-label="이야기 책장">
    <Transition name="book-page" mode="out-in">
      <div :key="pageKey" class="bookshelf__books">
        <StoryBookCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </Transition>
    <div class="bookshelf__ledge" aria-hidden="true" />
  </section>
</template>

<style scoped>
.bookshelf { position:relative;width:min(88%,1260px);height:min(100%,500px);min-height:400px;padding:clamp(22px,3vh,34px) clamp(48px,5vw,80px) clamp(30px,4vh,44px);border:clamp(14px,1.6vw,22px) solid color-mix(in srgb,var(--learner-color-game) 55%,var(--learner-color-growth));border-radius:var(--learner-radius-card);background:color-mix(in srgb,var(--learner-color-game) 34%,var(--learner-color-surface));box-shadow:inset 0 var(--learner-space-2) var(--learner-space-6) var(--learner-border-color-soft),var(--learner-shadow-card); }
.bookshelf__books { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:end;justify-items:center;gap:clamp(24px,4vw,60px);width:100%;height:100%; }
.bookshelf__ledge { position:absolute;right:calc(var(--learner-space-6) * -1);bottom:calc(var(--learner-space-4) * -1);left:calc(var(--learner-space-6) * -1);height:var(--learner-space-8);border-radius:var(--learner-radius-medium);background:color-mix(in srgb,var(--learner-color-game) 54%,var(--learner-color-growth));box-shadow:var(--learner-shadow-small); }
.book-page-enter-active,.book-page-leave-active { transition:opacity var(--learner-duration-normal) var(--learner-easing-standard),transform var(--learner-duration-normal) var(--learner-easing-standard); }
.book-page-enter-from { opacity:0;transform:translateX(var(--learner-space-6)); }
.book-page-leave-to { opacity:0;transform:translateX(calc(var(--learner-space-6) * -1)); }
@media (max-width:1240px) { .bookshelf { width:88%;padding-inline:clamp(36px,4vw,56px); }.bookshelf__books { gap:clamp(20px,3vw,40px); } }
@media (prefers-reduced-motion:reduce) { .book-page-enter-active,.book-page-leave-active { transition:none; } }
</style>
