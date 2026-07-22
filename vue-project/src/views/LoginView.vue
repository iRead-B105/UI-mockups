<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iReadLogo from '../assets/header/iread-logo.png'

const router = useRouter()
const userId = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  const trimmedId = userId.value.trim()

  if (!trimmedId) {
    errorMessage.value = '아이디를 입력해 주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // TODO: 인증 API 또는 auth store가 추가되면 이 위치에서 로그인 요청을 처리합니다.
    await router.push({ name: 'learner-home' })
  } catch {
    errorMessage.value = '로그인할 수 없습니다. 아이디를 확인해 주세요.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="cloud cloud-left" aria-hidden="true"></div>
    <div class="cloud cloud-right" aria-hidden="true"></div>

    <div class="login-shell">
      <div class="login-logo-frame">
        <img :src="iReadLogo" alt="아이리드" class="login-logo" />
      </div>

      <section class="login-card" aria-labelledby="login-title">
        <h1 id="login-title" class="login-title">아이디를 입력해 주세요</h1>

        <form class="login-form" @submit.prevent="handleLogin">
          <label class="login-input-wrapper">
            <span class="sr-only">아이디</span>
            <svg class="user-icon" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="16" r="9" />
              <path d="M8 42c1.4-10 7-15 16-15s14.6 5 16 15" />
            </svg>
            <input
              v-model="userId"
              type="text"
              placeholder="아이디"
              autocomplete="username"
              aria-label="아이디"
              @input="errorMessage = ''"
              @keydown.enter.prevent="handleLogin"
            />
          </label>

          <p v-if="errorMessage" class="login-error" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="login-button" :disabled="isLoading">
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>
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
  padding: clamp(24px, 4vw, 64px);
  background: var(--learner-background);
  color: var(--learner-color-text);
  font-family: var(--learner-font-reading);
}

.login-shell {
  position: relative;
  z-index: 2;
  width: min(94vw, 760px);
}

.login-card {
  width: min(86vw, 580px);
  margin: 0 auto;
  padding: clamp(24px, 3.2vw, 40px);
  box-sizing: border-box;
  border: var(--learner-border-width) solid var(--learner-border-color);
  border-radius: var(--learner-radius-card);
  background: color-mix(in srgb, var(--learner-color-game) 16%, var(--learner-color-surface));
  box-shadow: var(--learner-shadow-card);
}

.login-logo-frame {
  width: min(92vw, 650px);
  height: clamp(160px, 23vh, 220px);
  margin: 0 auto var(--learner-space-6);
  overflow: visible;
}

.login-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: translateY(3px) scale(2.9);
  transform-origin: center;
}

.login-title {
  margin: 0 0 var(--learner-space-8);
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(30px, 3.4vw, 46px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.25;
  text-align: center;
}

.login-form { width: 100%; min-width: 0; display: grid; gap: var(--learner-space-5); }

.login-input-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: clamp(72px, 9vh, 84px);
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
  padding: 0 var(--learner-space-6);
  border: var(--learner-border-width) solid var(--learner-border-color-soft);
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-surface);
  transition: border-color var(--learner-duration-fast), box-shadow var(--learner-duration-fast);
}

.login-input-wrapper:focus-within {
  border-color: var(--learner-color-primary);
  box-shadow: var(--learner-shadow-focus);
}

.user-icon {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  fill: var(--learner-color-primary-light);
  stroke: var(--learner-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-input-wrapper input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--learner-color-text);
  font-family: var(--learner-font-display);
  font-size: clamp(24px, 2.4vw, 32px);
  font-weight: var(--learner-font-weight-bold);
}

.login-input-wrapper input::placeholder { color: var(--learner-color-text-soft); opacity: .7; }

.login-error {
  margin: calc(var(--learner-space-2) * -1) var(--learner-space-2) 0;
  color: var(--learner-color-error);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
}

.login-button {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  height: clamp(72px, 9vh, 84px);
  border: 0;
  border-radius: var(--learner-radius-medium);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  box-shadow: var(--learner-shadow-small);
  cursor: pointer;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-button);
  font-weight: var(--learner-font-weight-heavy);
  transition: transform var(--learner-duration-fast) var(--learner-easing-standard), background var(--learner-duration-fast);
}

.login-button:hover:not(:disabled) { transform: translateY(-2px); background: var(--learner-color-primary-dark); }
.login-button:active:not(:disabled) { transform: translateY(0); }
.login-button:focus-visible { outline: none; box-shadow: var(--learner-shadow-focus); }
.login-button:disabled { cursor: wait; opacity: .65; }

.cloud {
  position: absolute;
  width: clamp(130px, 14vw, 220px);
  height: clamp(42px, 5vw, 74px);
  border-radius: var(--learner-radius-pill);
  background: rgb(255 255 255 / 82%);
  pointer-events: none;
}

.cloud::before, .cloud::after { content: ''; position: absolute; bottom: 0; border-radius: 50%; background: inherit; }
.cloud::before { left: 12%; width: 48%; height: 155%; }
.cloud::after { right: 10%; width: 40%; height: 120%; }
.cloud-left { left: -3%; top: 18%; }
.cloud-right { right: -3%; bottom: 15%; transform: scale(.82); }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

@media (max-height: 760px) {
  .login-card { padding-block: var(--learner-space-6); }
  .login-logo-frame { height: 138px; margin-bottom: var(--learner-space-4); }
  .login-title { margin-bottom: var(--learner-space-5); font-size: clamp(28px, 3vw, 38px); }
}
</style>
