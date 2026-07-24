<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  contextLabel?: string
  requestHelp?: () => Promise<void>
}>(), {
  contextLabel: '지금 화면',
  requestHelp: undefined,
})

const emit = defineEmits<{
  request: []
}>()

type HelpRequestStatus = 'idle' | 'sending' | 'sent' | 'error'

const status = ref<HelpRequestStatus>('idle')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const label = computed(() => {
  if (status.value === 'sending') return '선생님께 알리는 중이에요'
  if (status.value === 'sent') return '도움을 요청했어요'
  if (status.value === 'error') return '다시 눌러 주세요'
  return '도와주세요'
})

const description = computed(() => {
  if (status.value === 'sent') return '선생님께 도움 요청을 보냈어요.'
  if (status.value === 'error') return '도움 요청을 보내지 못했어요. 다시 시도해 주세요.'
  return `${props.contextLabel}에서 선생님께 도움을 요청합니다.`
})

const scheduleReset = () => {
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    status.value = 'idle'
  }, 4_000)
}

const handleRequest = async () => {
  if (status.value === 'sending' || status.value === 'sent') return

  status.value = 'sending'
  emit('request')

  try {
    await props.requestHelp?.()
    status.value = 'sent'
  } catch {
    status.value = 'error'
  }

  scheduleReset()
}

onBeforeUnmount(() => clearTimeout(resetTimer))
</script>

<template>
  <aside class="help-control" aria-label="선생님 도움 요청">
    <button
      class="help-button"
      :class="`help-button--${status}`"
      type="button"
      :disabled="status === 'sending'"
      :aria-describedby="`help-status-${contextLabel.replace(/\s+/g, '-')}`"
      @click="handleRequest"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path class="help-hand" d="M18 31V15c0-4 6-4 6 0v12-16c0-4 6-4 6 0v16-18c0-4 6-4 6 0v18-14c0-4 6-4 6 0v19l5-5c4-4 9 1 6 5L41 49c-3 4-8 6-13 5-10-2-16-9-16-18v-5c0-4 6-4 6 0Z" />
        <path class="help-heart" d="M47 11c3-5 11-2 10 4-1 5-10 10-10 10s-9-5-10-10c-1-6 7-9 10-4Z" />
      </svg>
      <span>{{ label }}</span>
    </button>
    <p
      :id="`help-status-${contextLabel.replace(/\s+/g, '-')}`"
      class="help-status"
      :class="{ 'help-status--visible': status !== 'idle' }"
      role="status"
      aria-live="polite"
    >
      {{ description }}
    </p>
  </aside>
</template>

<style scoped>
.help-control {
  position: fixed;
  z-index: var(--learner-z-help);
  right: max(var(--learner-space-6), env(safe-area-inset-right));
  bottom: max(var(--learner-space-6), env(safe-area-inset-bottom));
  display: grid;
  justify-items: end;
  gap: var(--learner-space-2);
  max-width: min(320px, calc(100vw - var(--learner-space-8)));
  font-family: var(--learner-font-display);
}

.help-button {
  min-width: 176px;
  min-height: var(--learner-control-height-medium);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-3);
  padding: var(--learner-space-2) var(--learner-space-5);
  border: var(--learner-border-width) solid var(--learner-color-surface);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: var(--learner-shadow-floating);
  cursor: pointer;
  font-weight: var(--learner-font-weight-heavy);
  transition:
    transform var(--learner-duration-fast) var(--learner-easing-standard),
    background var(--learner-duration-fast) var(--learner-easing-standard);
}

.help-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--learner-color-primary-dark);
}

.help-button:active:not(:disabled) {
  transform: translateY(0);
}

.help-button:focus-visible {
  outline: none;
  box-shadow: var(--learner-shadow-focus), var(--learner-shadow-floating);
}

.help-button:disabled {
  opacity: .72;
}

.help-button--sent {
  background: var(--learner-color-success);
}

.help-button--error {
  background: var(--learner-color-error);
}

.help-button svg {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
}

.help-hand {
  fill: var(--learner-color-surface);
}

.help-heart {
  fill: var(--learner-color-warning);
}

.help-status {
  max-width: 100%;
  margin: 0;
  padding: var(--learner-space-2) var(--learner-space-4);
  border-radius: var(--learner-radius-medium);
  background: color-mix(in srgb, var(--learner-color-text) 92%, transparent);
  color: var(--learner-color-text-inverse);
  box-shadow: var(--learner-shadow-card);
  font-family: var(--learner-font-reading);
  font-size: var(--learner-font-size-caption);
  font-weight: var(--learner-font-weight-bold);
  line-height: 1.45;
  opacity: 0;
  transform: translateY(var(--learner-space-2));
  transition:
    opacity var(--learner-duration-fast) var(--learner-easing-standard),
    transform var(--learner-duration-fast) var(--learner-easing-standard);
  pointer-events: none;
}

.help-status--visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 700px), (max-height: 620px) {
  .help-control {
    right: var(--learner-space-4);
    bottom: var(--learner-space-4);
  }

  .help-button {
    min-width: var(--learner-touch-target);
    width: var(--learner-control-height-medium);
    padding: var(--learner-space-2);
  }

  .help-button span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}
</style>
