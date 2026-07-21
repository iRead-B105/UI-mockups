<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormActions from '@/components/teacher/FormActions.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import ProfileImageEditor from '@/components/teacher/ProfileImageEditor.vue'
import SettingsSection from '@/components/teacher/SettingsSection.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'

const router = useRouter()
const { visible: saved, show: showSaved } = useTemporaryNotice()
const photoChanged = ref(false)
const form = reactive({
  name: '이OO',
  organization: 'OO복지센터',
  email: 'ssafy123@ssafy.com',
  gender: '여자',
  phone: '010-1234-5678',
  address: '서울특별시 강남구 테헤란로 212',
})
const savedSnapshot = ref(JSON.stringify(form))
const formChanged = computed(
  () => JSON.stringify(form) !== savedSnapshot.value || photoChanged.value,
)

function markPhotoChanged() {
  photoChanged.value = true
}

function saveProfile() {
  if (!formChanged.value) return
  savedSnapshot.value = JSON.stringify(form)
  photoChanged.value = false
  showSaved()
}
</script>

<template>
  <div class="settings page-stack">
    <PageHeader
      title="교수자 프로필"
      description="교수자 정보를 관리합니다."
    />

    <form id="teacher-profile-form" class="settings-form" @submit.prevent="saveProfile">
      <SettingsSection title="프로필 사진" description="사진을 확인하거나 변경합니다.">
        <ProfileImageEditor
          input-id="teacher-photo"
          label="교수자 사진"
          image-url="/images/teacher-profile.png"
          fallback="이"
          @select="markPhotoChanged"
        />
      </SettingsSection>

      <SettingsSection title="기본 정보" description="이름과 소속 기관을 관리합니다.">
        <div class="form-grid">
          <div class="field field--medium">
            <label for="teacher-name">이름</label>
            <input id="teacher-name" v-model="form.name" class="input" required />
          </div>
          <div class="field field--medium">
            <label for="organization">소속 기관</label>
            <input id="organization" v-model="form.organization" class="input" required />
          </div>
          <div class="field field--short">
            <label for="teacher-gender">성별</label>
            <select id="teacher-gender" v-model="form.gender" class="select">
              <option>여자</option>
              <option>남자</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="연락처" description="상담과 안내에 사용할 연락처입니다.">
        <div class="form-grid">
          <div class="field">
            <label for="teacher-email">이메일</label>
            <input id="teacher-email" v-model="form.email" class="input" type="email" required />
          </div>
          <div class="field field--phone">
            <label for="teacher-phone">연락처</label>
            <input id="teacher-phone" v-model="form.phone" class="input" />
          </div>
          <div class="field form-grid__wide">
            <label for="teacher-address">주소</label>
            <input id="teacher-address" v-model="form.address" class="input" />
          </div>
        </div>
      </SettingsSection>

      <FormActions
        :saved="saved"
        :disabled="!formChanged"
        saved-message="프로필 변경 사항이 저장되었습니다."
        @cancel="router.back()"
      />
    </form>
  </div>
</template>

<style scoped>
.settings {
  max-width: 1020px;
  margin: 0 auto;
}

.settings-form {
  display: grid;
  gap: 2px;
}

.form-grid {
  display: grid;
  max-width: 620px;
  gap: 18px 20px;
  grid-template-columns: minmax(0, 1fr);
}

.form-grid__wide {
  grid-column: 1 / -1;
}

.settings .button:disabled {
  border-color: var(--slate-200);
  background: var(--slate-100);
  color: var(--slate-400);
  cursor: default;
  transform: none;
}
</style>
