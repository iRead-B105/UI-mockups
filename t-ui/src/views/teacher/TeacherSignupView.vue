<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const previewUrl = ref('/images/teacher-profile.png')
const errorMessage = ref('')
const form = reactive({
  loginId: '',
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  organization: '',
})

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function signup() {
  if (form.password !== form.passwordConfirm) {
    errorMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }
  router.push('/login')
}
</script>

<template>
  <main class="signup-page">
    <header class="signup-header">
      <RouterLink to="/login" aria-label="로그인으로 이동"><img src="/images/iread-logo.png" alt="iRead" /></RouterLink>
      <p>이미 계정이 있으신가요? <RouterLink to="/login">로그인</RouterLink></p>
    </header>

    <form class="signup-card surface" @submit.prevent="signup">
      <div class="signup-heading">
        <span>교수자 계정</span>
        <h1>회원가입</h1>
        <p>iRead 교수자 서비스를 이용하기 위한 정보를 입력해 주세요.</p>
      </div>

      <section class="signup-photo">
        <img :src="previewUrl" alt="프로필 사진 미리보기" />
        <div>
          <h2>프로필 사진</h2>
          <p>학생과 보호자에게 표시될 사진입니다.</p>
          <label class="button button--secondary" for="signup-photo">사진 선택</label>
          <input id="signup-photo" hidden type="file" accept="image/*" @change="selectImage" />
        </div>
      </section>

      <section class="signup-fields">
        <div class="field">
          <label for="signup-id">아이디</label>
          <input id="signup-id" v-model="form.loginId" class="input" required placeholder="로그인에 사용할 아이디" />
        </div>
        <div class="field">
          <label for="signup-email">이메일</label>
          <input id="signup-email" v-model="form.email" class="input" required type="email" placeholder="example@email.com" />
        </div>
        <div class="field">
          <label for="signup-password">비밀번호</label>
          <input id="signup-password" v-model="form.password" class="input" required minlength="8" type="password" placeholder="8자 이상 입력" />
        </div>
        <div class="field">
          <label for="signup-password-confirm">비밀번호 확인</label>
          <input id="signup-password-confirm" v-model="form.passwordConfirm" class="input" required type="password" placeholder="비밀번호 다시 입력" />
        </div>
        <div class="field">
          <label for="signup-name">이름</label>
          <input id="signup-name" v-model="form.name" class="input" required placeholder="교수자 이름" />
        </div>
        <div class="field">
          <label for="signup-organization">소속기관</label>
          <input id="signup-organization" v-model="form.organization" class="input" required placeholder="소속 기관명" />
        </div>
      </section>

      <p v-if="errorMessage" class="signup-error" role="alert">{{ errorMessage }}</p>
      <footer>
        <RouterLink class="button button--secondary" to="/login">취소</RouterLink>
        <button class="button" type="submit">회원가입</button>
      </footer>
    </form>
  </main>
</template>

<style scoped>
.signup-page { min-height: 100vh; padding: 28px 48px 64px; background: linear-gradient(180deg, #eef2ff 0, var(--slate-50) 300px); }
.signup-header { display: flex; max-width: 1040px; height: 58px; align-items: center; justify-content: space-between; margin: 0 auto 28px; }
.signup-header > a { display: grid; width: 116px; height: 58px; overflow: hidden; place-items: center; }
.signup-header img { width: 96px; height: 56px; max-width: none; object-fit: contain; transform: scale(1.85); }
.signup-header p { margin: 0; color: var(--slate-500); font-size: 13px; }
.signup-header p a { color: var(--primary-600); font-weight: 800; }
.signup-card { max-width: 900px; margin: 0 auto; padding: 38px 46px 32px; }
.signup-heading { padding-bottom: 26px; border-bottom: 1px solid var(--slate-200); }
.signup-heading span { color: var(--primary-600); font-size: 12px; font-weight: 900; letter-spacing: .08em; }
.signup-heading h1 { margin: 8px 0 4px; font-size: 28px; }
.signup-heading p { margin: 0; color: var(--slate-500); }
.signup-photo { display: flex; align-items: center; gap: 22px; padding: 28px 0; border-bottom: 1px solid var(--slate-200); }
.signup-photo img { width: 108px; height: 108px; border: 5px solid var(--white); border-radius: 50%; box-shadow: 0 0 0 1px var(--slate-200); object-fit: cover; }
.signup-photo h2 { margin: 0 0 3px; font-size: 16px; }
.signup-photo p { margin: 0 0 12px; color: var(--slate-500); font-size: 12px; }
.signup-fields { display: grid; gap: 20px; padding: 28px 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.signup-fields .input { height: 46px; }
.signup-error { padding: 10px 13px; border-radius: 8px; background: #fff1f2; color: var(--danger-600); font-size: 12px; }
.signup-card footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 22px; border-top: 1px solid var(--slate-200); }
</style>
