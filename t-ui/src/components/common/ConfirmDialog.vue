<script setup lang="ts">
withDefaults(
  defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string }>(),
  { confirmLabel: '삭제' },
)

defineEmits<{ cancel: []; confirm: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="open" class="dialog-backdrop" @click.self="$emit('cancel')">
        <section class="confirm-dialog" role="alertdialog" aria-modal="true" :aria-label="title">
          <span class="confirm-dialog__icon" aria-hidden="true">!</span>
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <div class="confirm-dialog__actions">
            <button class="button button--secondary" type="button" @click="$emit('cancel')">취소</button>
            <button class="button button--danger-solid" type="button" @click="$emit('confirm')">
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  padding: 24px;
  background: rgba(15, 23, 42, 0.48);
  place-items: center;
}
.confirm-dialog {
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
  background: var(--white);
  text-align: center;
}
.confirm-dialog__icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #fff1f2;
  color: var(--danger-600);
  font-size: 24px;
  font-weight: 900;
  place-items: center;
}
.confirm-dialog h2 { margin-bottom: 8px; font-size: 20px; }
.confirm-dialog p { margin-bottom: 24px; color: var(--slate-500); }
.confirm-dialog__actions { display: flex; justify-content: center; gap: 10px; }
.dialog-fade-enter-active,
.dialog-fade-leave-active { transition: opacity 160ms ease; }
.dialog-fade-enter-from,
.dialog-fade-leave-to { opacity: 0; }
</style>
