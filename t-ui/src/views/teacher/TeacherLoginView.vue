<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ loginId: '', password: '' })
const helpMessage = ref('')

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
  <main class="auth-page">
    <section class="auth-visual">
      <div class="auth-visual__brand">
        <img src="/images/iread-logo.png" alt="iRead" />
      </div>
      <div>
        <span class="auth-kicker">iRead Teacher</span>
        <h1>학생의 읽기 성장을<br />한눈에 관리하세요.</h1>
        <p>학습 현황부터 커리큘럼, 보고서까지 교수자에게 필요한 정보를 모았습니다.</p>
      </div>
      <div class="auth-visual__feature">
        <span>01</span><p><strong>맞춤 커리큘럼</strong>학생별 성취도에 맞는 훈련 관리</p>
        <span>02</span><p><strong>학습 변화 분석</strong>읽기 정확도와 유창성 추이 확인</p>
      </div>
    </section>

    <section class="auth-form-panel">
      <form class="auth-card" @submit.prevent="login">
        <div class="auth-card__mobile-logo"><img src="/images/iread-logo.png" alt="iRead" /></div>
        <span class="auth-kicker">교수자 전용</span>
        <h2>로그인</h2>
        <p class="auth-card__description">교수자 계정으로 로그인해 주세요.</p>

        <div class="field">
          <label for="login-id">아이디</label>
          <input id="login-id" v-model="form.loginId" class="input" required placeholder="아이디 입력" />
        </div>
        <div class="field">
          <label for="login-password">비밀번호</label>
          <input
            id="login-password"
            v-model="form.password"
            class="input"
            required
            type="password"
            placeholder="비밀번호 입력"
          />
        </div>

        <div class="auth-help-links">
          <button type="button" @click="showHelp('id')">아이디 찾기</button>
          <span></span>
          <button type="button" @click="showHelp('password')">비밀번호 찾기</button>
        </div>
        <p v-if="helpMessage" class="auth-help-message" role="status">{{ helpMessage }}</p>

        <button class="button auth-submit" type="submit">로그인</button>
        <p class="auth-signup-link">아직 계정이 없으신가요? <RouterLink to="/signup">회원가입</RouterLink></p>
      </form>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: 100vh;
  background: var(--white);
  grid-template-columns: minmax(460px, 0.95fr) minmax(520px, 1.05fr);
}
.auth-visual {
  position: relative;
  display: flex;
  min-height: 100vh;
  justify-content: space-between;
  flex-direction: column;
  padding: 52px 70px 64px;
  overflow: hidden;
  background: linear-gradient(145deg, #312e81 0%, #4f46e5 58%, #0284c7 120%);
  color: var(--white);
}
.auth-visual::after {
  position: absolute;
  right: -160px;
  bottom: 80px;
  width: 430px;
  height: 430px;
  border: 74px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  content: '';
}
.auth-visual__brand { display: grid; width: 120px; height: 62px; overflow: hidden; place-items: center; }
.auth-visual__brand img { width: 100px; height: 58px; max-width: none; filter: brightness(0) invert(1); object-fit: contain; transform: scale(1.85); }
.auth-kicker { color: #c7d2fe; font-size: 12px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
.auth-visual h1 { margin: 14px 0 18px; font-size: 42px; line-height: 1.25; }
.auth-visual > div > p { max-width: 520px; color: #e0e7ff; font-size: 16px; }
.auth-visual__feature { position: relative; z-index: 1; display: grid; max-width: 500px; align-items: start; gap: 16px 12px; grid-template-columns: 34px 1fr; }
.auth-visual__feature > span { display: grid; width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,.15); font-size: 11px; font-weight: 800; place-items: center; }
.auth-visual__feature p { display: grid; margin: 0; color: #e0e7ff; font-size: 12px; }
.auth-visual__feature strong { margin-bottom: 2px; color: var(--white); font-size: 14px; }
.auth-form-panel { display: grid; padding: 64px; place-items: center; }
.auth-card { width: min(410px, 100%); }
.auth-card__mobile-logo { display: none; }
.auth-card .auth-kicker { color: var(--primary-600); }
.auth-card h2 { margin: 9px 0 5px; font-size: 30px; }
.auth-card__description { margin-bottom: 32px; color: var(--slate-500); }
.auth-card .field { margin-bottom: 18px; }
.auth-card .input { height: 48px; }
.auth-help-links { display: flex; justify-content: flex-end; gap: 10px; }
.auth-help-links button { padding: 0; border: 0; background: transparent; color: var(--slate-500); font-size: 12px; }
.auth-help-links span { width: 1px; background: var(--slate-200); }
.auth-help-message { margin: 14px 0 0; padding: 10px 12px; border-radius: 8px; background: var(--slate-50); color: var(--slate-500); font-size: 12px; }
.auth-submit { width: 100%; min-height: 50px; margin-top: 25px; }
.auth-signup-link { margin: 22px 0 0; color: var(--slate-500); text-align: center; }
.auth-signup-link a { color: var(--primary-600); font-weight: 800; }
</style>
