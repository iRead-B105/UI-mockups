<script setup lang="ts">
// 훈련 서브메뉴 모달
// 기존 모달 패턴(StoryLandModal 참고)을 따릅니다.
// 한 카테고리의 레슨 목록(5개)을 보여주고, 준비 중 레슨 선택 시
// "이 훈련은 준비하고 있어요." 메시지를 표시합니다.

import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { TrainingCategory } from '@/types/training'
import TrainingLessonCard from './TrainingLessonCard.vue'

const props = defineProps<{
  open: boolean
  category: TrainingCategory | null
}>()

const emit = defineEmits<{
  select: [lessonId: string]
  close: []
}>()

const panel = ref<HTMLElement | null>(null)
const notReadyMessage = ref<string | null>(null)
let notReadyTimer: ReturnType<typeof setTimeout> | null = null

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeydown)
      await nextTick()
      panel.value?.focus()
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
  },
)

watch(
  () => props.category?.id,
  () => {
    notReadyMessage.value = null
  },
)

const handleNotReady = (lessonId: string) => {
  const lesson = props.category?.lessons.find((l) => l.id === lessonId)
  notReadyMessage.value = lesson
    ? `${lesson.title}은(는) 준비하고 있어요.`
    : '이 훈련은 준비하고 있어요.'
  if (notReadyTimer) clearTimeout(notReadyTimer)
  notReadyTimer = setTimeout(() => {
    notReadyMessage.value = null
  }, 2200)
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (notReadyTimer) clearTimeout(notReadyTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open && category"
        class="lesson-modal-overlay"
        @click.self="emit('close')"
      >
        <section
          ref="panel"
          class="lesson-modal-panel"
          role="dialog"
          aria-modal="true"
          :aria-label="`${category.title} 레슨 선택`"
          tabindex="-1"
        >
          <header class="modal-heading">
            <div class="heading-icon">
              <img :src="category.image" :alt="category.title" />
            </div>
            <div class="heading-text">
              <h2 class="heading-title">{{ category.title }}</h2>
              <p class="heading-desc">{{ category.description }}</p>
            </div>
            <button class="modal-close" type="button" aria-label="닫기" @click="emit('close')">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <div class="modal-body">
            <ul class="lesson-list">
              <li v-for="lesson in category.lessons" :key="lesson.id">
                <TrainingLessonCard
                  :lesson="lesson"
                  @select="emit('select', $event)"
                  @not-ready="handleNotReady"
                />
              </li>
            </ul>

            <Transition name="toast">
              <p v-if="notReadyMessage" class="not-ready-toast" role="status">
                {{ notReadyMessage }}
              </p>
            </Transition>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lesson-modal-overlay {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(12px, 3dvh, 28px) clamp(12px, 3dvw, 36px);
  background: color-mix(in srgb, var(--learner-color-text) 42%, transparent);
}

.lesson-modal-panel {
  width: min(94dvw, 720px);
  max-height: min(92dvh, 820px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: clamp(16px, 3dvh, 32px);
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background-color: #fff9dc;
  background-image: url('../../assets/backgrounds/training-inner-background-flat-vector.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: var(--learner-shadow-floating);
  outline: none;
}

.modal-heading {
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
  padding-bottom: var(--learner-space-5);
  border-bottom: var(--learner-border-width) solid var(--learner-border-color-soft);
}
.heading-icon {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: var(--learner-radius-medium);
  background: rgb(255 255 255 / 60%);
  overflow: hidden;
}
.heading-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.heading-text {
  flex: 1;
  min-width: 0;
}
.heading-title {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.1;
}
.heading-desc {
  margin: var(--learner-space-1) 0 0;
  font-size: var(--learner-font-size-body);
  color: var(--learner-color-text-soft);
}

.modal-close {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 60%);
  color: var(--learner-color-text);
  cursor: pointer;
  transition: background var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.modal-close:hover { background: rgb(255 255 255 / 90%); transform: rotate(90deg); }
.modal-close:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }
.modal-close svg { width: 22px; height: 22px; }

.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: var(--learner-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-3);
}

.lesson-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-3);
}

.not-ready-toast {
  position: sticky;
  bottom: 0;
  margin: var(--learner-space-4) auto 0;
  padding: var(--learner-space-3) var(--learner-space-6);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-text);
  color: var(--learner-color-text-inverse);
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
  box-shadow: var(--learner-shadow-card);
  text-align: center;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--learner-duration-normal) var(--learner-easing-standard);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .lesson-modal-panel,
.modal-leave-active .lesson-modal-panel {
  transition: transform var(--learner-duration-normal) var(--learner-easing-bounce);
}
.modal-enter-from .lesson-modal-panel,
.modal-leave-to .lesson-modal-panel {
  transform: scale(0.92) translateY(12px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--learner-duration-fast), transform var(--learner-duration-fast);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .modal-close:hover { transform: none; }
}
</style>
