<template>
  <div class="educator-layout">
    <header class="educator-header">
      <strong>아이리드</strong>
      <span>교수자</span>
    </header>
    <main class="educator-page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.educator-layout {
  min-height: 100vh;
  background: var(--educator-background);
  color: var(--educator-text);
  font-family: var(--educator-font);
}

.educator-header {
  height: var(--educator-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid var(--educator-border);
  background: var(--educator-surface);
}

.educator-header strong { font-size: 24px; }
.educator-header span { color: var(--educator-muted); font-weight: 700; }
.educator-page { min-height: calc(100vh - var(--educator-header-height)); }
</style>
