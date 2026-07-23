<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FormActions from '@/components/teacher/FormActions.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import ProfileImageEditor from '@/components/teacher/ProfileImageEditor.vue'
import SettingsSection from '@/components/teacher/SettingsSection.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import type { Student } from '@/features/teacher/types'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialValue?: Student
}>()

const router = useRouter()
const { visible: saved, show: showSaved } = useTemporaryNotice()
const photoChanged = ref(false)
const deleteDialogOpen = ref(false)

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
  lastLearningDate: '',
  lastTestDate: '',
  totalLearningTime: '0시간',
  latestTraining: '-',
  lastAccess: '-',
  learningStartDate: '',
  weeklyAttendance: '0%',
}

const form = reactive<Student>({ ...(props.initialValue ?? emptyStudent) })
const savedSnapshot = ref(JSON.stringify(form))
const title = computed(() => (props.mode === 'create' ? '새 아동 등록' : '아동 정보 관리'))
const description = computed(() =>
  props.mode === 'create'
    ? '아동과 보호자 정보를 입력합니다.'
    : '아동과 보호자 정보를 수정합니다.',
)
const studentInitial = computed(() => form.name.trim().charAt(0) || '학')
const formChanged = computed(
  () => JSON.stringify(form) !== savedSnapshot.value || photoChanged.value,
)
const requiredFieldsEntered = computed(
  () =>
    Boolean(form.name.trim()) &&
    Boolean(form.birthDate) &&
    Boolean(form.school.trim()) &&
    Boolean(form.guardianName.trim()) &&
    Boolean(form.guardianPhone.trim()),
)
const canSubmit = computed(() => formChanged.value && requiredFieldsEntered.value)

function markPhotoChanged() {
  photoChanged.value = true
}

function submitForm() {
  if (!canSubmit.value) return

  savedSnapshot.value = JSON.stringify(form)
  photoChanged.value = false
  showSaved()

  if (props.mode === 'create') {
    window.setTimeout(() => router.push('/teacher/dashboard'), 700)
  }
}

function confirmStudentDeletion() {
  deleteDialogOpen.value = false
  router.push('/teacher/dashboard')
}
</script>

<template>
  <form class="student-form page-stack" @submit.prevent="submitForm">
    <PageHeader :title="title" :description="description" />

    <SettingsSection title="아동 기본 정보" description="학습 관리에 사용하는 정보입니다.">
      <ProfileImageEditor
        input-id="student-photo"
        label="프로필 사진"
        :image-url="initialValue?.profileImage"
        :fallback="studentInitial"
        button-label="사진 선택"
        @select="markPhotoChanged"
      />

      <div class="form-grid section-fields">
        <div class="field field--medium">
          <label for="student-name">아동명</label>
          <input id="student-name" v-model="form.name" class="input" required placeholder="아동 이름" />
        </div>
        <div class="field field--date">
          <label for="student-birth">생년월일</label>
          <input id="student-birth" v-model="form.birthDate" class="input" required type="date" />
        </div>
        <div class="field field--short">
          <label for="student-gender">성별</label>
          <select id="student-gender" v-model="form.gender" class="select">
            <option>남자</option>
            <option>여자</option>
          </select>
        </div>
        <div class="field field--phone">
          <label for="student-phone">아동 연락처</label>
          <input id="student-phone" v-model="form.phone" class="input" placeholder="010-0000-0000" />
        </div>
        <div class="field form-grid__wide">
          <label for="student-school">학교명</label>
          <input id="student-school" v-model="form.school" class="input" required placeholder="학교명" />
        </div>
      </div>
    </SettingsSection>

    <SettingsSection title="보호자 정보" description="상담에 사용할 보호자 연락처입니다.">
      <div class="form-grid">
        <div class="field field--medium">
          <label for="guardian-name">보호자명</label>
          <input id="guardian-name" v-model="form.guardianName" class="input" required placeholder="보호자 이름" />
        </div>
        <div class="field field--short">
          <label for="guardian-relation">관계</label>
          <select id="guardian-relation" v-model="form.guardianRelation" class="select">
            <option>어머니</option>
            <option>아버지</option>
            <option>조부모</option>
            <option>기타</option>
          </select>
        </div>
        <div class="field field--phone">
          <label for="guardian-phone">보호자 연락처</label>
          <input id="guardian-phone" v-model="form.guardianPhone" class="input" required placeholder="010-0000-0000" />
        </div>
        <div class="field">
          <label for="guardian-email">보호자 이메일</label>
          <input id="guardian-email" v-model="form.guardianEmail" class="input" type="email" placeholder="example@email.com" />
        </div>
        <div class="field form-grid__wide">
          <label for="address">주소</label>
          <input id="address" v-model="form.address" class="input" placeholder="주소를 입력하세요" />
        </div>
      </div>
    </SettingsSection>

    <FormActions
      :saved="saved"
      :disabled="!canSubmit"
      :save-label="mode === 'create' ? '아동 등록' : '변경 사항 저장'"
      :saved-message="mode === 'create' ? '아동 정보가 저장되었습니다.' : '변경 사항이 저장되었습니다.'"
      @cancel="router.back()"
    />

    <section v-if="mode === 'edit'" class="danger-zone" aria-label="아동 삭제">
      <div>
        <h2>아동 삭제</h2>
        <p>아동 목록에서 제외하고 연결된 학습 기록에 더 이상 접근할 수 없게 됩니다.</p>
      </div>
      <button class="button button--danger button--small" type="button" @click="deleteDialogOpen = true">
        아동 삭제
      </button>
    </section>

    <ConfirmDialog
      :open="deleteDialogOpen"
      title="아동을 삭제할까요?"
      :message="`${form.name} 아동을 목록에서 삭제합니다. 목업에서는 실제 데이터가 삭제되지 않습니다.`"
      confirm-label="아동 삭제"
      @cancel="deleteDialogOpen = false"
      @confirm="confirmStudentDeletion"
    />
  </form>
</template>

<style scoped>
.student-form {
  max-width: 1020px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  max-width: 620px;
  gap: 18px 20px;
  grid-template-columns: minmax(0, 1fr);
}

.section-fields {
  padding-top: 20px;
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.danger-zone {
  display: flex;
  min-height: 82px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 0;
  border-top: 1px solid #fecaca;
  border-bottom: 1px solid #fecaca;
}

.danger-zone h2 {
  margin: 0;
  color: var(--slate-800);
  font-size: 15px;
}

.danger-zone p {
  margin: 3px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.student-form .button:disabled {
  border-color: var(--slate-200);
  background: var(--slate-100);
  color: var(--slate-400);
  cursor: default;
  transform: none;
}
</style>
