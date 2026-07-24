<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  inputMode?: 'gaze' | 'pointer'
}>(), {
  inputMode: 'gaze',
})

const emit = defineEmits<{
  continue: []
}>()

const continueButton = ref<HTMLButtonElement | null>(null)

const keepDialogFocus = () => {
  continueButton.value?.focus()
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    continueButton.value?.focus()
  },
  { immediate: true },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="ready-notice">
      <div v-if="open" class="notice-backdrop">
        <section
          class="notice-card learner-surface"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-ready-title"
          aria-describedby="session-ready-description"
          @keydown.tab.prevent="keepDialogFocus"
          @keydown.esc.prevent
        >
          <span class="notice-icon" aria-hidden="true">
            <svg v-if="inputMode === 'gaze'" viewBox="0 0 72 72">
              <path d="M8 36s10-17 28-17 28 17 28 17-10 17-28 17S8 36 8 36Z" />
              <circle cx="36" cy="36" r="10" />
              <circle cx="39" cy="32" r="3" />
            </svg>
            <svg v-else viewBox="0 0 72 72">
              <path d="m19 8 35 32-17 3 10 18-9 5-10-18-11 13 2-53Z" />
            </svg>
          </span>

          <div class="notice-copy">
            <h2 id="session-ready-title">읽기 도우미가 준비됐어요</h2>
            <p id="session-ready-description">
              {{
                inputMode === 'gaze'
                  ? '편안하게 화면을 보고 천천히 시작해요.'
                  : '마우스로 천천히 눌러서 시작해요.'
              }}
            </p>
          </div>

          <button ref="continueButton" class="continue-button" type="button" @click="emit('continue')">
            시작할게요
          </button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notice-backdrop {
  position: fixed;
  z-index: var(--learner-z-dialog);
  inset: 0;
  display: grid;
  place-items: center;
  padding: var(--learner-page-padding);
  background: color-mix(in srgb, var(--learner-color-text) 38%, transparent);
}

.notice-card {
  width: min(560px, 100%);
  display: grid;
  justify-items: center;
  gap: var(--learner-space-6);
  padding: clamp(28px, 5vw, 48px);
  text-align: center;
}

.notice-icon {
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--learner-page-accent, var(--learner-color-primary)) 20%, var(--learner-color-surface));
  color: var(--learner-color-primary);
}

.notice-icon svg {
  width: 70px;
  height: 70px;
  fill: none;
  stroke: currentColor;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.notice-copy {
  display: grid;
  gap: var(--learner-space-3);
}

.notice-copy h2,
.notice-copy p {
  margin: 0;
}

.notice-copy h2 {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-card-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.25;
}

.notice-copy p {
  color: var(--learner-color-text-soft);
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  line-height: 1.6;
  word-break: keep-all;
}

.continue-button {
  min-width: 220px;
  min-height: var(--learner-control-height-large);
  padding: var(--learner-space-3) var(--learner-space-8);
  border: 0;
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: 0 7px 0 var(--learner-color-primary-dark);
  cursor: pointer;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  transition:
    transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast) var(--learner-easing-standard);
}

.continue-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 0 var(--learner-color-primary-dark);
}

.continue-button:active {
  transform: translateY(3px);
  box-shadow: 0 4px 0 var(--learner-color-primary-dark);
}

.continue-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus), 0 7px 0 var(--learner-color-primary-dark);
}

.ready-notice-enter-active,
.ready-notice-leave-active {
  transition: opacity var(--learner-duration-normal) var(--learner-easing-standard);
}

.ready-notice-enter-active .notice-card,
.ready-notice-leave-active .notice-card {
  transition: transform var(--learner-duration-normal) var(--learner-easing-standard);
}

.ready-notice-enter-from,
.ready-notice-leave-to {
  opacity: 0;
}

.ready-notice-enter-from .notice-card,
.ready-notice-leave-to .notice-card {
  transform: translateY(var(--learner-space-4)) scale(.98);
}
</style>
