<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import iReadMainLogo from '../assets/header/iread-main.png'
import { useLearnerAccessSession } from '../composables/useLearnerAccessSession'

const router = useRouter()
const { login } = useLearnerAccessSession()
const educatorId = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const educatorIdInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)

const clearError = () => {
  errorMessage.value = ''
}

const focusFirstInvalidField = async () => {
  await nextTick()
  if (!educatorId.value.trim()) educatorIdInput.value?.focus()
  else passwordInput.value?.focus()
}

const handleLogin = async () => {
  const normalizedId = educatorId.value.trim()

  if (!normalizedId || !password.value) {
    errorMessage.value = !normalizedId && !password.value
      ? '아이디와 비밀번호를 입력해 주세요.'
      : !normalizedId
        ? '아이디를 입력해 주세요.'
        : '비밀번호를 입력해 주세요.'
    await focusFirstInvalidField()
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 목업 단계에서는 입력값 존재 여부만 확인하고 비밀번호는 저장하지 않는다.
    await new Promise((resolve) => window.setTimeout(resolve, 240))
    login(normalizedId)
    await router.replace({ name: 'student-selector' })
  } catch {
    errorMessage.value = '로그인할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="login-page" data-learner-emotion="calm">
    <div class="cloud cloud-left" aria-hidden="true"></div>
    <div class="cloud cloud-right" aria-hidden="true"></div>

    <div class="login-shell">
      <div class="login-logo-frame">
        <img :src="iReadMainLogo" alt="아이리드" class="login-logo" />
      </div>

      <section class="login-card" aria-labelledby="login-title">
        <div class="educator-badge">
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="16" r="8" />
            <path d="M9 41c1-10 6-15 15-15s14 5 15 15" />
            <path d="m31 20 9 4-9 4" />
          </svg>
          교수자 로그인
        </div>
        <h1 id="login-title" class="login-title">학습 세션을 준비해 주세요</h1>
        <p class="login-description">
          교수자가 로그인한 뒤 오늘 학습할 아동을 선택합니다.
        </p>

        <form class="login-form" novalidate @submit.prevent="handleLogin">
          <label class="field">
            <span>아이디</span>
            <span class="login-input-wrapper">
              <svg class="field-icon" viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="16" r="8" />
                <path d="M9 41c1-10 6-15 15-15s14 5 15 15" />
              </svg>
              <input
                ref="educatorIdInput"
                v-model="educatorId"
                type="text"
                autocomplete="username"
                inputmode="text"
                :aria-invalid="Boolean(errorMessage && !educatorId.trim())"
                aria-describedby="login-error"
                @input="clearError"
              />
            </span>
          </label>

          <label class="field">
            <span>비밀번호</span>
            <span class="login-input-wrapper">
              <svg class="field-icon" viewBox="0 0 48 48" aria-hidden="true">
                <rect x="10" y="21" width="28" height="21" rx="5" />
                <path d="M16 21v-5a8 8 0 0 1 16 0v5" />
                <circle cx="24" cy="31" r="2" />
                <path d="M24 33v4" />
              </svg>
              <input
                ref="passwordInput"
                v-model="password"
                type="password"
                autocomplete="current-password"
                :aria-invalid="Boolean(errorMessage && !password)"
                aria-describedby="login-error"
                @input="clearError"
              />
            </span>
          </label>

          <p
            id="login-error"
            class="login-error"
            :class="{ 'login-error--placeholder': !errorMessage }"
            role="alert"
          >
            {{ errorMessage || ' ' }}
          </p>

          <button type="submit" class="login-button" :disabled="isLoading">
            <span v-if="isLoading" class="button-spinner" aria-hidden="true"></span>
            {{ isLoading ? '확인하고 있어요' : '로그인' }}
          </button>
        </form>

        <p class="mock-note">목업에서는 아이디와 비밀번호를 입력하면 학생 선택 화면으로 이동합니다.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
  padding: clamp(24px, 4vw, 56px);
  background: var(--learner-page-background);
  color: var(--learner-color-text);
  font-family: var(--educator-font);
}

.login-shell {
  position: relative;
  z-index: 2;
  width: min(94vw, 720px);
}

.login-card {
  width: min(100%, 600px);
  margin: 0 auto;
  padding: clamp(28px, 4vw, 44px);
  border: var(--learner-border-width) solid rgb(255 255 255 / 82%);
  border-radius: var(--learner-radius-card);
  background: rgb(255 255 255 / 94%);
  box-shadow: var(--learner-shadow-floating);
}

.login-logo-frame {
  width: min(90vw, 480px);
  height: clamp(120px, 18vh, 170px);
  margin: 0 auto var(--learner-space-5);
  overflow: hidden;
}

.login-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.65);
}

.educator-badge {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: var(--learner-space-2);
  margin: 0 auto var(--learner-space-4);
  padding: var(--learner-space-2) var(--learner-space-4);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-surface-calm);
  color: var(--learner-color-primary-dark);
  font-size: 16px;
  font-weight: 800;
}

.educator-badge svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-title {
  margin: 0;
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(30px, 4vw, 42px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.25;
  text-align: center;
  word-break: keep-all;
}

.login-description {
  margin: var(--learner-space-3) auto var(--learner-space-8);
  color: var(--learner-color-text-soft);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.6;
  text-align: center;
  word-break: keep-all;
}

.login-form {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: var(--learner-space-4);
}

.field {
  display: grid;
  gap: var(--learner-space-2);
  color: var(--learner-color-text);
  font-size: 17px;
  font-weight: 800;
}

.login-input-wrapper {
  width: 100%;
  height: var(--learner-control-height-large);
  display: flex;
  align-items: center;
  gap: var(--learner-space-3);
  padding: 0 var(--learner-space-5);
  border: 2px solid #cfd8e7;
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-surface);
  transition:
    border-color var(--learner-duration-fast),
    box-shadow var(--learner-duration-fast);
}

.login-input-wrapper:focus-within {
  border-color: var(--learner-color-primary);
  box-shadow: 0 0 0 4px rgb(62 102 233 / 16%);
}

.field-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--learner-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-input-wrapper input {
  min-width: 0;
  height: 100%;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--learner-color-text);
  font-size: 20px;
  font-weight: 700;
}

.login-input-wrapper:has(input[aria-invalid='true']) {
  border-color: var(--learner-color-error);
}

.login-error {
  min-height: 28px;
  margin: calc(var(--learner-space-2) * -1) 0 0;
  color: #b63d45;
  font-size: 16px;
  font-weight: 750;
}

.login-error--placeholder {
  visibility: hidden;
}

.login-button {
  width: 100%;
  height: var(--learner-control-height-large);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--learner-space-3);
  border: 0;
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: 0 6px 0 var(--learner-color-primary-dark);
  cursor: pointer;
  font-family: var(--learner-font-display);
  font-size: 23px;
  font-weight: var(--learner-font-weight-heavy);
  transition:
    transform var(--learner-duration-fast) var(--learner-easing-standard),
    box-shadow var(--learner-duration-fast) var(--learner-easing-standard);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 0 var(--learner-color-primary-dark);
}

.login-button:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 3px 0 var(--learner-color-primary-dark);
}

.login-button:disabled {
  cursor: wait;
  opacity: .72;
}

.button-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgb(255 255 255 / 45%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin .8s linear infinite;
}

.mock-note {
  margin: var(--learner-space-6) 0 0;
  padding-top: var(--learner-space-4);
  border-top: 1px solid #dce4ef;
  color: var(--learner-color-text-soft);
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  word-break: keep-all;
}

.cloud {
  position: absolute;
  width: clamp(130px, 14vw, 220px);
  height: clamp(42px, 5vw, 74px);
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 72%);
  pointer-events: none;
}

.cloud::before,
.cloud::after {
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  background: inherit;
  content: '';
}

.cloud::before {
  left: 12%;
  width: 48%;
  height: 155%;
}

.cloud::after {
  right: 10%;
  width: 40%;
  height: 120%;
}

.cloud-left {
  left: -3%;
  top: 18%;
}

.cloud-right {
  right: -3%;
  bottom: 15%;
  transform: scale(.82);
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .login-page {
    padding: var(--learner-space-4);
  }

  .login-logo-frame {
    height: 110px;
    margin-bottom: var(--learner-space-3);
  }

  .login-card {
    padding: var(--learner-space-6);
  }

  .login-description {
    margin-bottom: var(--learner-space-5);
  }
}

@media (max-height: 780px) {
  .login-page {
    align-items: flex-start;
  }

  .login-logo-frame {
    height: 100px;
    margin-bottom: var(--learner-space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-spinner {
    animation-duration: 1.6s;
  }
}
</style>
