<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ loginId: '', password: '' })
const helpMessage = ref('')
const showPassword = ref(false)

function login() {
  router.push('/teacher/dashboard')
}

function showHelp(type: 'id' | 'password') {
  helpMessage.value =
    type === 'id'
      ? '아이디 찾기 기능은 현재 목업 화면으로 제공됩니다.'
      : '비밀번호 찾기 기능은 현재 목업 화면으로 제공됩니다.'
}
</script>

<template>
  <main class="login-page">
    <section class="login-shell" aria-labelledby="login-title">
      <RouterLink class="login-logo" to="/login" aria-label="로그인으로 이동">
        <img src="/images/iread-logo.png" alt="iRead" />
      </RouterLink>

      <form class="login-form" @submit.prevent="login">
        <header class="login-heading">
          <h1 id="login-title">로그인</h1>
          <p>교수자 계정으로 로그인해 주세요.</p>
        </header>

        <div class="login-fields">
          <div class="field">
            <label for="login-id">아이디</label>
            <input id="login-id" v-model="form.loginId" class="input" required placeholder="아이디 입력" />
          </div>
          <div class="field">
            <label for="login-password">비밀번호</label>
            <div class="password-input">
              <input
                id="login-password"
                v-model="form.password"
                class="input"
                required
                :type="showPassword ? 'text' : 'password'"
                placeholder="비밀번호 입력"
              />
              <button
                type="button"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 보기'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '숨기기' : '보기' }}
              </button>
            </div>
          </div>
        </div>

        <div class="login-help-links">
          <button type="button" @click="showHelp('id')">아이디 찾기</button>
          <span aria-hidden="true"></span>
          <button type="button" @click="showHelp('password')">비밀번호 찾기</button>
        </div>
        <p v-if="helpMessage" class="login-help-message" role="status">{{ helpMessage }}</p>

        <button class="button login-submit" type="submit">로그인</button>
        <p class="login-signup-link">
          아직 계정이 없으신가요? <RouterLink to="/signup">회원가입</RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  padding: 64px 48px 52px;
  background: var(--white);
  place-items: start center;
}

.login-shell {
  display: grid;
  width: min(420px, 100%);
  justify-items: stretch;
}

.login-logo {
  display: grid;
  width: 132px;
  height: 68px;
  margin: 0 auto 34px;
  overflow: hidden;
  place-items: center;
}

.login-logo img {
  width: 108px;
  height: 62px;
  max-width: none;
  object-fit: contain;
  transform: scale(1.85);
}

.login-heading {
  margin-bottom: 32px;
}

.login-heading h1 {
  margin: 0 0 7px;
  font-size: 30px;
}

.login-heading p {
  margin: 0;
  color: var(--slate-500);
}

.login-fields {
  display: grid;
  gap: 18px;
}

.login-fields .input {
  height: 48px;
}

.password-input {
  position: relative;
}

.password-input .input {
  padding-right: 64px;
}

.password-input button {
  position: absolute;
  top: 50%;
  right: 13px;
  min-width: 40px;
  min-height: 32px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
  transform: translateY(-50%);
}

.password-input button:hover,
.password-input button:focus-visible {
  color: var(--slate-900);
  text-decoration: underline;
}

.login-help-links {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.login-help-links button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--slate-500);
  font-size: 12px;
}

.login-help-links button:hover,
.login-help-links button:focus-visible {
  color: var(--slate-800);
  text-decoration: underline;
}

.login-help-links span {
  width: 1px;
  background: var(--slate-200);
}

.login-help-message {
  margin: 14px 0 0;
  padding: 10px 12px;
  background: var(--slate-50);
  color: var(--slate-600);
  font-size: 12px;
}

.login-submit {
  width: 100%;
  min-height: 50px;
  margin-top: 24px;
}

.login-signup-link {
  margin: 22px 0 0;
  color: var(--slate-500);
  text-align: center;
}

.login-signup-link a {
  color: var(--primary-600);
  font-weight: 800;
}

@media (max-height: 700px) {
  .login-page {
    padding-top: 34px;
  }

  .login-logo {
    margin-bottom: 24px;
  }
}
</style>
