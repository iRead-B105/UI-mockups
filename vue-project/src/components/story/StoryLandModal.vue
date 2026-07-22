<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import aliceContinueImage from '../../assets/story/alice-continue.png'

const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  dialog.value?.focus()
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div class="story-modal" @click.self="emit('close')">
    <section ref="dialog" class="story-panel" role="dialog" aria-modal="true" aria-labelledby="story-land-title" tabindex="-1">
      <header class="story-heading">
        <span aria-hidden="true"></span>
        <h2 id="story-land-title">이야기 나라</h2>
        <span aria-hidden="true"></span>
      </header>

      <RouterLink
        class="story-card"
        :to="{ name: 'story-reading', params: { storyId: 'alice' }, query: { continue: '1' } }"
        aria-label="이상한 나라의 앨리스 이어 읽기"
      >
        <div class="story-visual">
          <img :src="aliceContinueImage" alt="다독 악어와 함께 이상한 나라의 엘리스를 이어 읽는 장면" />
        </div>
        <div class="story-copy">
          <h3>이야기 이어 읽기</h3>
          <p>책을 읽으며 이야기를 함께 만들어봐요!</p>
        </div>
      </RouterLink>

      <nav class="story-actions" aria-label="이야기 선택 메뉴">
        <RouterLink class="story-action story-action--mine" :to="{ name: 'story-selection', query: { view: 'mine' } }">
          내 다른 이야기
        </RouterLink>
        <RouterLink class="story-action story-action--new" :to="{ name: 'story-selection' }">
          새로운 이야기 고르러 가기
        </RouterLink>
      </nav>
    </section>
  </div>
</template>

<style scoped>
.story-modal {
  position: fixed;
  z-index: 100;
  top: var(--learner-header-height);
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  place-items: center;
  padding: clamp(8px, 1.8dvh, 20px) clamp(12px, 2.5dvw, 36px);
  background: color-mix(in srgb, var(--learner-color-text) 38%, transparent);
}

.story-panel {
  width: min(92dvw, 1240px);
  height: min(96%, 760px);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  justify-items: center;
  gap: clamp(8px, 1.7dvh, 20px);
  overflow: hidden;
  padding: clamp(12px, 2.4dvh, 32px) clamp(18px, 3dvw, 40px);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  outline: none;
  background: color-mix(in srgb, var(--learner-color-game) 10%, var(--learner-color-surface));
  box-shadow: var(--learner-shadow-floating);
  color: var(--learner-color-text);
  font-family: var(--learner-font-reading);
}

.story-heading { display:flex;align-items:center;justify-content:center;gap:clamp(12px,2dvw,var(--learner-space-5)); }
.story-heading span { width: clamp(42px, 6vw, 84px); height: var(--learner-border-width); border-radius: var(--learner-radius-pill); background: var(--learner-color-primary-light); }
.story-heading h2 { margin:0;font-family:var(--learner-font-display);font-size:clamp(32px,min(4.2dvw,7dvh),60px);font-weight:var(--learner-font-weight-heavy);line-height:1; }

.story-card {
  position: relative;
  width: auto;
  max-width: min(72%, 760px);
  height: 100%;
  max-height: 100%;
  aspect-ratio: 1673 / 940;
  overflow: hidden;
  border: var(--learner-border-width) solid var(--learner-color-game);
  border-radius: var(--learner-radius-card);
  background: var(--learner-color-surface-soft);
  box-shadow: var(--learner-shadow-card);
  transform-origin: center;
  container-type: size;
  transition: transform var(--learner-duration-normal) var(--learner-easing-standard), box-shadow var(--learner-duration-normal);
  color: inherit;
  text-decoration: none;
}

.story-card:hover {
  transform: scale(1.025);
  box-shadow: var(--learner-shadow-floating);
}
.story-card:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }

.story-visual {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--learner-color-surface-soft);
}

.story-visual > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.story-copy { position:absolute;z-index:2;right:clamp(10px,3cqh,var(--learner-space-5));bottom:clamp(10px,3cqh,var(--learner-space-5));left:clamp(10px,3cqh,var(--learner-space-5));padding:0;text-align:center;background:transparent;filter:drop-shadow(var(--learner-shadow-small));pointer-events:none; }
.story-copy h3,.story-copy p { color:var(--learner-color-text);paint-order:stroke fill;-webkit-text-stroke:clamp(3px,.28vw,5px) var(--learner-color-surface); }
.story-copy h3 { margin:0 0 var(--learner-space-1);font-family:var(--learner-font-display);font-size:clamp(20px,7cqh,36px);font-weight:var(--learner-font-weight-heavy);line-height:1.15; }
.story-copy p { margin:0;font-size:clamp(14px,4.5cqh,23px);font-weight:var(--learner-font-weight-heavy);line-height:1.3; }

.story-actions {
  width: min(82%, 760px);
  display: flex;
  align-items: center;
  justify-content: stretch;
  gap: var(--learner-space-4);
}
.story-action {
  min-width: 0;
  min-height: clamp(48px, 8dvh, 68px);
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 var(--learner-space-5);
  border: var(--learner-border-width) solid var(--learner-border-color-soft);
  border-radius: var(--learner-radius-pill);
  box-shadow: var(--learner-shadow-small);
  font-family: var(--learner-font-display);
  font-size: clamp(16px, min(1.8dvw, 2.8dvh), 25px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.15;
  text-align: center;
  text-decoration: none;
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard), box-shadow var(--learner-duration-fast);
}
.story-action--mine { background:var(--learner-color-surface);color:var(--learner-color-text); }
.story-action--new { border-color:var(--learner-color-primary);background:var(--learner-color-primary);color:var(--learner-color-text-inverse); }
.story-action:hover { transform:translateY(-3px);box-shadow:var(--learner-shadow-card); }
.story-action:active { transform:translateY(0); }
.story-action:focus-visible { outline:none;box-shadow:var(--learner-shadow-focus); }

@media (max-width: 1100px) { .story-card { max-width: 78%; } }
@media (max-width: 820px) {
  .story-panel { width:94dvw;padding:clamp(10px,2dvh,var(--learner-space-5)); }
  .story-card { max-width:86%; }
  .story-heading span { width: 36px; }
}
@media (max-height: 720px) {
  .story-panel { height:96%; }
}

@media (prefers-reduced-motion: reduce) {
  .story-card { transition: none; }
}
</style>
