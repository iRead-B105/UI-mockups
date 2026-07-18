<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <header class="teacher-header">
    <div class="teacher-header__logo-frame">
      <img src="/images/iread-logo.png" alt="iRead" class="teacher-header__logo" />
    </div>
    <h1>{{ title }}</h1>
    <div class="teacher-header__account">
      <span class="teacher-header__status"></span>
      교수자 모드
    </div>
  </header>
</template>

<style scoped>
.teacher-header {
  position: sticky;
  z-index: 20;
  top: 0;
  display: grid;
  height: var(--header-height);
  align-items: center;
  padding: 0 28px;
  border-bottom: 1px solid var(--slate-200);
  background: rgba(255, 255, 255, 0.96);
  grid-template-columns: 180px 1fr 180px;
  backdrop-filter: blur(14px);
}

.teacher-header__logo-frame {
  display: grid;
  width: 112px;
  height: 58px;
  place-items: center;
  overflow: hidden;
}

.teacher-header__logo {
  width: 96px;
  height: 56px;
  max-width: none;
  object-fit: contain;
  transform: scale(1.85);
}

.teacher-header h1 {
  margin: 0;
  font-size: 22px;
  text-align: center;
}

.teacher-header__account {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: var(--slate-500);
  font-size: 13px;
  font-weight: 700;
}

.teacher-header__status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success-600);
  box-shadow: 0 0 0 4px #dcfce7;
}
</style>
