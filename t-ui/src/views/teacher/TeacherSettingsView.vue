<script setup lang="ts">
// 교수자 사진과 기본 정보를 수정하는 설정 화면입니다.
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const saved = ref(false)
const previewUrl = ref('/images/teacher-profile.png')
// reactive 객체의 각 속성은 아래 입력 요소의 v-model과 연결됩니다.
const form = reactive({
  name: '이OO',
  organization: 'OO복지센터',
  email: 'ssafy123@ssafy.com',
  gender: '여자',
  phone: '010-1234-5678',
  address: '서울특별시 강남구 테헤란로 212',
})

function selectImage(event: Event) {
  // 사용자가 선택한 첫 이미지 파일을 찾아 브라우저 안에서만 쓰는 미리보기 URL을 만듭니다.
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  // 이전 임시 주소가 있다면 먼저 해제하여 메모리 낭비를 막습니다.
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function saveProfile() {
  // 목업이므로 서버 전송 대신 저장 안내를 보이게 하는 상태만 변경합니다.
  saved.value = true
}
</script>

<template>
  <!-- page-stack은 공통 CSS에서 화면 섹션 사이의 세로 간격을 담당합니다. -->
  <div class="settings page-stack">
    <header class="page-heading">
      <div>
        <h1>교수자 프로필</h1>
        <p>학생과 보호자에게 표시되는 교수자 정보를 관리합니다.</p>
      </div>
    </header>

    <div v-if="saved" class="status-message">프로필 변경 사항이 목업 데이터에 저장되었습니다.</div>

    <!-- prevent는 폼 제출 시 브라우저 새로고침을 막고 Vue 함수만 실행합니다. -->
    <form class="surface settings-card" @submit.prevent="saveProfile">
      <div class="settings-photo">
        <span class="section-kicker">프로필 사진</span>
        <!-- :src는 previewUrl 값이 바뀌면 이미지 주소도 자동으로 바꿉니다. -->
        <img :src="previewUrl" alt="교수자 프로필 미리보기" />
        <label class="button button--secondary" for="teacher-photo">사진 변경</label>
        <input id="teacher-photo" hidden type="file" accept="image/*" @change="selectImage" />
        <p>JPG 또는 PNG 형식의 정사각형 이미지를 권장합니다.</p>
      </div>

      <div class="settings-fields">
        <div class="settings-fields__heading">
          <span class="section-kicker">기본 정보</span>
          <h2>프로필 정보</h2>
          <p>상담과 학습 안내에 사용할 정보를 입력해 주세요.</p>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="teacher-name">이름</label
            ><input id="teacher-name" v-model="form.name" class="input" required />
          </div>
          <div class="field">
            <label for="organization">소속 기관</label
            ><input id="organization" v-model="form.organization" class="input" required />
          </div>
          <div class="field form-grid__wide">
            <label for="teacher-email">이메일</label
            ><input id="teacher-email" v-model="form.email" class="input" type="email" required />
          </div>
          <div class="field">
            <label for="teacher-gender">성별</label
            ><select id="teacher-gender" v-model="form.gender" class="select">
              <option>여자</option>
              <option>남자</option>
            </select>
          </div>
          <div class="field">
            <label for="teacher-phone">연락처</label
            ><input id="teacher-phone" v-model="form.phone" class="input" />
          </div>
          <div class="field form-grid__wide">
            <label for="teacher-address">주소</label
            ><input id="teacher-address" v-model="form.address" class="input" />
          </div>
        </div>
      </div>

      <footer class="settings-actions">
        <button class="button button--secondary" type="button" @click="router.back()">취소</button>
        <button class="button" type="submit">변경 사항 저장</button>
      </footer>
    </form>
  </div>
</template>

<style scoped>
.settings {
  max-width: 1120px;
  margin: 0 auto;
}

.settings-card {
  /* 왼쪽 사진 영역 320px과 오른쪽 입력 영역으로 나눕니다. */
  display: grid;
  overflow: hidden;
  grid-template-columns: 320px 1fr;
}

.settings-photo {
  /* 사진과 버튼, 안내 문구를 위에서 아래로 쌓습니다. */
  display: flex;
  min-height: 590px;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  padding: 40px 30px;
  border-right: 1px solid var(--slate-200);
  background: linear-gradient(180deg, var(--slate-50), var(--white));
}

.settings-photo img {
  /* 원본 비율을 유지하면서 원형 영역을 가득 채웁니다. */
  width: 210px;
  height: 210px;
  margin-top: 12px;
  border: 7px solid var(--white);
  border-radius: 50%;
  object-fit: cover;
  box-shadow:
    0 0 0 1px var(--slate-200),
    0 16px 40px rgba(15, 23, 42, 0.12);
}

.settings-photo p {
  max-width: 210px;
  color: var(--slate-500);
  font-size: 12px;
  text-align: center;
}

.section-kicker {
  color: var(--primary-600);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.settings-fields {
  padding: 40px;
}

.settings-fields__heading h2 {
  margin: 8px 0 5px;
  font-size: 22px;
}

.settings-fields__heading p {
  margin-bottom: 30px;
  color: var(--slate-500);
}

.form-grid {
  /* 기본 입력 필드는 같은 크기의 두 열로 정렬합니다. */
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.settings-actions {
  /* 양쪽 영역 아래 전체 폭을 차지하는 버튼 줄을 만듭니다. */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 24px;
  border-top: 1px solid var(--slate-200);
  background: var(--slate-50);
  grid-column: 1 / -1;
}
</style>
