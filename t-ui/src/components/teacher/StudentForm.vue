<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Student } from '@/features/teacher/types'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialValue?: Student
}>()

const router = useRouter()
const saved = ref(false)
const previewUrl = ref('/images/student-profile.png')

const emptyStudent: Student = {
  id: 0,
  name: '',
  age: 0,
  birthDate: '',
  gender: '남자',
  phone: '',
  school: '',
  guardianName: '',
  guardianRelation: '어머니',
  guardianPhone: '',
  guardianEmail: '',
  address: '',
  lastTestDate: '',
  totalLearningTime: '0시간',
  latestTraining: '-',
  lastAccess: '-',
  learningStartDate: '',
  weeklyAttendance: '0%',
}

const form = reactive<Student>({ ...(props.initialValue ?? emptyStudent) })
const title = computed(() => (props.mode === 'create' ? '새 학생 등록' : '학생 정보 수정'))
const description = computed(() =>
  props.mode === 'create'
    ? '학습자와 보호자 정보를 입력해 교수자 관리 목록에 추가합니다.'
    : '변경이 필요한 정보를 수정한 뒤 저장해 주세요.',
)

function selectImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

function submitForm() {
  saved.value = true
  window.setTimeout(() => {
    router.push(props.mode === 'create' ? '/teacher/dashboard' : '/teacher/students/1')
  }, 700)
}
</script>

<template>
  <form class="student-form page-stack" @submit.prevent="submitForm">
    <header class="page-heading">
      <div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <span class="form-badge">필수 항목을 확인해 주세요</span>
    </header>

    <div v-if="saved" class="status-message">
      정보가 목업 데이터에 저장되었습니다. 화면을 이동합니다.
    </div>

    <section class="surface form-section student-section">
      <div class="form-section__heading">
        <span>01</span>
        <div>
          <h2>학생 정보</h2>
          <p>학생의 기본 정보와 학교 정보를 입력합니다.</p>
        </div>
      </div>

      <div class="student-section__body">
        <div class="photo-uploader">
          <img :src="previewUrl" alt="학생 프로필 미리보기" />
          <label class="button button--secondary" for="student-photo">사진 선택</label>
          <input id="student-photo" type="file" accept="image/*" hidden @change="selectImage" />
          <small>JPG 또는 PNG, 최대 5MB</small>
        </div>

        <div class="form-grid">
          <div class="field">
            <label for="student-name">학생명</label>
            <input
              id="student-name"
              v-model="form.name"
              class="input"
              required
              placeholder="학생 이름"
            />
          </div>
          <div class="field">
            <label for="student-birth">생년월일</label>
            <input id="student-birth" v-model="form.birthDate" class="input" required type="date" />
          </div>
          <div class="field">
            <label for="student-gender">성별</label>
            <select id="student-gender" v-model="form.gender" class="select">
              <option>남자</option>
              <option>여자</option>
            </select>
          </div>
          <div class="field">
            <label for="student-phone">학생 연락처</label>
            <input
              id="student-phone"
              v-model="form.phone"
              class="input"
              placeholder="010-0000-0000"
            />
          </div>
          <div class="field form-grid__wide">
            <label for="student-school">학교명</label>
            <input
              id="student-school"
              v-model="form.school"
              class="input"
              required
              placeholder="학교명"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="surface form-section">
      <div class="form-section__heading">
        <span>02</span>
        <div>
          <h2>보호자 정보</h2>
          <p>학습 안내와 상담에 사용할 보호자 연락처입니다.</p>
        </div>
      </div>

      <div class="form-grid form-section__fields">
        <div class="field">
          <label for="guardian-name">보호자명</label>
          <input
            id="guardian-name"
            v-model="form.guardianName"
            class="input"
            required
            placeholder="보호자 이름"
          />
        </div>
        <div class="field">
          <label for="guardian-relation">관계</label>
          <select id="guardian-relation" v-model="form.guardianRelation" class="select">
            <option>어머니</option>
            <option>아버지</option>
            <option>조부모</option>
            <option>기타</option>
          </select>
        </div>
        <div class="field">
          <label for="guardian-phone">보호자 연락처</label>
          <input
            id="guardian-phone"
            v-model="form.guardianPhone"
            class="input"
            required
            placeholder="010-0000-0000"
          />
        </div>
        <div class="field">
          <label for="guardian-email">보호자 이메일</label>
          <input
            id="guardian-email"
            v-model="form.guardianEmail"
            class="input"
            type="email"
            placeholder="example@email.com"
          />
        </div>
        <div class="field form-grid__wide">
          <label for="address">주소</label>
          <input
            id="address"
            v-model="form.address"
            class="input"
            placeholder="주소를 입력하세요"
          />
        </div>
      </div>
    </section>

    <footer class="form-actions">
      <button class="button button--secondary" type="button" @click="router.back()">취소</button>
      <button class="button" type="submit">
        {{ mode === 'create' ? '학생 등록' : '변경 사항 저장' }}
      </button>
    </footer>
  </form>
</template>

<style scoped>
.student-form {
  max-width: 1160px;
  margin: 0 auto;
}

.form-badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-size: 12px;
  font-weight: 700;
}

.form-section {
  padding: 24px;
}

.form-section__heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--slate-200);
}

.form-section__heading > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 10px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 800;
}

.form-section__heading h2 {
  margin: 0 0 3px;
  font-size: 17px;
}

.form-section__heading p {
  margin: 0;
  color: var(--slate-500);
  font-size: 13px;
}

.student-section__body {
  display: grid;
  align-items: start;
  gap: 42px;
  padding-top: 28px;
  grid-template-columns: 220px 1fr;
}

.photo-uploader {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--slate-50);
}

.photo-uploader img {
  width: 148px;
  height: 148px;
  border: 5px solid var(--white);
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--slate-200);
}

.photo-uploader small {
  color: var(--slate-400);
  font-size: 11px;
}

.form-grid {
  display: grid;
  gap: 18px 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.form-section__fields {
  padding-top: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: 20px;
}
</style>
