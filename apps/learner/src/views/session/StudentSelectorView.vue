<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iReadHeaderLogo from '../../assets/header/iread-header.png'
import { useLearnerAccessSession } from '../../composables/useLearnerAccessSession'

const router = useRouter()
const {
  state,
  students,
  logout,
  selectStudent,
} = useLearnerAccessSession()

const selectingStudentId = ref<string | null>(null)
const errorMessage = ref('')

const handleStudentSelect = async (studentId: string) => {
  if (selectingStudentId.value) return
  selectingStudentId.value = studentId
  errorMessage.value = ''

  try {
    const student = selectStudent(studentId)
    if (!student) throw new Error('Student not found')
    await new Promise((resolve) => window.setTimeout(resolve, 180))
    await router.push({
      name: 'session-calibration',
      params: { studentId: student.id },
    })
  } catch {
    errorMessage.value = '학생 정보를 불러오지 못했습니다. 다시 선택해 주세요.'
    selectingStudentId.value = null
  }
}

const handleLogout = async () => {
  logout()
  await router.replace({ name: 'login' })
}
</script>

<template>
  <main class="selector-page" data-learner-emotion="calm">
    <header class="session-header">
      <img :src="iReadHeaderLogo" alt="아이리드" />
      <div class="educator-session">
        <span>
          <small>로그인한 교수자</small>
          <strong>{{ state.educatorName }}</strong>
        </span>
        <button type="button" @click="handleLogout">로그아웃</button>
      </div>
    </header>

    <section class="selector-shell" aria-labelledby="selector-title">
      <div class="selector-heading">
        <span class="step-badge">1 / 2</span>
        <h1 id="selector-title">오늘 학습할 학생을 선택해 주세요</h1>
        <p>학생을 선택하면 해당 아동의 시선 보정 단계로 바로 이동합니다.</p>
      </div>

      <p v-if="errorMessage" class="selector-error" role="alert">{{ errorMessage }}</p>

      <ul
        v-if="students.length"
        class="student-list"
        :aria-busy="Boolean(selectingStudentId)"
      >
        <li v-for="student in students" :key="student.id">
          <button
            class="student-card"
            :class="[
              `student-card--${student.avatarTone}`,
              { 'student-card--selected': selectingStudentId === student.id },
            ]"
            type="button"
            :aria-pressed="selectingStudentId === student.id"
            :disabled="Boolean(selectingStudentId)"
            @click="handleStudentSelect(student.id)"
          >
            <span class="student-avatar" aria-hidden="true">
              <svg viewBox="0 0 72 72">
                <circle class="avatar-background" cx="36" cy="36" r="34" />
                <path class="avatar-hair" d="M17 35c0-18 8-28 19-28s19 10 19 28v12H17V35Z" />
                <circle class="avatar-face" cx="36" cy="36" r="19" />
                <path class="avatar-bangs" d="M18 31C21 16 28 9 37 9c10 0 16 8 17 23-6-1-11-5-14-10-5 6-12 9-22 9Z" />
                <circle class="avatar-eye" cx="29" cy="37" r="2.3" />
                <circle class="avatar-eye" cx="43" cy="37" r="2.3" />
                <path class="avatar-smile" d="M31 45c3 3 7 3 10 0" />
                <path class="avatar-shirt" d="M18 68c2-13 8-18 18-18s16 5 18 18H18Z" />
              </svg>
            </span>

            <span class="student-summary">
              <span class="student-name-row">
                <strong>{{ student.name }}</strong>
                <small>{{ student.learnerCode }}</small>
              </span>
              <span class="student-details">
                <span>{{ student.gradeLabel }}</span>
                <span>{{ student.groupLabel }}</span>
                <span>만 {{ student.age }}세</span>
              </span>
              <span class="last-session">{{ student.lastSessionLabel }}</span>
            </span>

            <span class="select-state" aria-hidden="true">
              <svg v-if="selectingStudentId === student.id" viewBox="0 0 40 40">
                <path d="m10 21 7 7 14-16" />
              </svg>
              <svg v-else viewBox="0 0 40 40">
                <path d="m15 9 11 11-11 11" />
              </svg>
            </span>
            <span v-if="selectingStudentId === student.id" class="sr-only">
              선택됨, 시선 보정 화면으로 이동 중
            </span>
          </button>
        </li>
      </ul>

      <div v-else class="empty-state" role="status">
        <strong>표시할 학생이 없습니다.</strong>
        <p>교수자 웹에서 담당 학생 배정을 확인해 주세요.</p>
      </div>

      <aside class="scope-note" aria-label="현재 화면에서 할 수 있는 일">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="19" />
          <path d="M24 21v13M24 14h.01" />
        </svg>
        <p>
          이 화면에서는 학생 선택과 세션 준비만 진행합니다.
          커리큘럼 편집과 학습 분석은 교수자 전용 웹에서 관리합니다.
        </p>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.selector-page {
  min-height: 100dvh;
  overflow-x: hidden;
  background: var(--learner-page-background);
  color: var(--learner-color-text);
  font-family: var(--educator-font);
}

.session-header {
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--learner-space-6);
  padding: var(--learner-space-3) clamp(24px, 5vw, 72px);
  border-bottom: 1px solid rgb(23 38 80 / 10%);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--learner-shadow-small);
}

.session-header > img {
  width: clamp(180px, 18vw, 260px);
  height: 64px;
  object-fit: contain;
  transform: scale(1.7);
}

.educator-session {
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
}

.educator-session > span {
  display: grid;
  text-align: right;
}

.educator-session small {
  color: var(--learner-color-text-soft);
  font-size: 13px;
  font-weight: 650;
}

.educator-session strong {
  font-size: 17px;
  font-weight: 800;
}

.educator-session button {
  min-height: var(--learner-control-height-small);
  padding: 0 var(--learner-space-4);
  border: 2px solid #c9d5e6;
  border-radius: var(--learner-radius-small);
  background: var(--learner-color-surface);
  color: var(--learner-color-text);
  cursor: pointer;
  font-weight: 750;
}

.selector-shell {
  width: min(1100px, calc(100% - 48px));
  margin: 0 auto;
  padding: clamp(40px, 6vw, 72px) 0;
}

.selector-heading {
  display: grid;
  justify-items: center;
  margin-bottom: var(--learner-space-8);
  text-align: center;
}

.step-badge {
  margin-bottom: var(--learner-space-3);
  padding: var(--learner-space-2) var(--learner-space-4);
  border-radius: var(--learner-radius-pill);
  background: var(--learner-color-primary);
  color: var(--learner-color-text-inverse);
  font-size: 15px;
  font-weight: 850;
}

.selector-heading h1 {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: var(--learner-font-weight-heavy);
  line-height: 1.25;
  word-break: keep-all;
}

.selector-heading p {
  margin: var(--learner-space-3) 0 0;
  color: var(--learner-color-text-soft);
  font-size: 18px;
  font-weight: 650;
  line-height: 1.6;
  word-break: keep-all;
}

.selector-error {
  margin: 0 0 var(--learner-space-4);
  padding: var(--learner-space-4);
  border: 2px solid color-mix(in srgb, var(--learner-color-error) 55%, white);
  border-radius: var(--learner-radius-small);
  background: color-mix(in srgb, var(--learner-color-error) 10%, white);
  color: #a63840;
  font-weight: 750;
}

.student-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--learner-space-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.student-card {
  width: 100%;
  min-height: 320px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  gap: var(--learner-space-4);
  padding: var(--learner-space-6);
  border: 3px solid #dbe4ef;
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 94%);
  color: var(--learner-color-text);
  box-shadow: var(--learner-shadow-small);
  cursor: pointer;
  text-align: left;
  transition:
    transform var(--learner-duration-fast) var(--learner-easing-standard),
    border-color var(--learner-duration-fast),
    box-shadow var(--learner-duration-fast);
}

.student-card:hover:not(:disabled) {
  transform: translateY(-4px);
  border-color: var(--learner-color-primary-light);
  box-shadow: var(--learner-shadow-card);
}

.student-card--selected {
  border-color: var(--learner-color-success);
  background: #f4fff6;
  box-shadow: 0 0 0 5px rgb(76 175 104 / 16%), var(--learner-shadow-card);
}

.student-card:disabled {
  cursor: wait;
}

.student-card:disabled:not(.student-card--selected) {
  opacity: .58;
}

.student-avatar {
  width: 108px;
  height: 108px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  box-shadow: var(--learner-shadow-small);
}

.student-avatar svg {
  width: 100%;
  height: 100%;
}

.avatar-background {
  fill: #ffd8cd;
}

.student-card--blue .avatar-background {
  fill: #cce8ff;
}

.student-card--green .avatar-background {
  fill: #d6f1d2;
}

.avatar-hair,
.avatar-bangs {
  fill: #5f3b2f;
}

.avatar-face {
  fill: #ffd3ad;
}

.avatar-eye {
  fill: #33251f;
}

.avatar-smile {
  fill: none;
  stroke: #dd5b5b;
  stroke-width: 2.7;
  stroke-linecap: round;
}

.avatar-shirt {
  fill: #f07872;
}

.student-card--blue .avatar-shirt {
  fill: #5f88e8;
}

.student-card--green .avatar-shirt {
  fill: #58aa67;
}

.student-summary {
  width: 100%;
  display: grid;
  align-content: start;
  gap: var(--learner-space-3);
}

.student-name-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--learner-space-2);
}

.student-name-row strong {
  font-family: var(--learner-font-display);
  font-size: 28px;
  font-weight: var(--learner-font-weight-heavy);
}

.student-name-row small {
  color: var(--learner-color-text-soft);
  font-size: 13px;
  font-weight: 700;
}

.student-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--learner-space-2);
}

.student-details span {
  padding: 5px 10px;
  border-radius: var(--learner-radius-pill);
  background: #eef3f9;
  color: #465a77;
  font-size: 14px;
  font-weight: 750;
}

.last-session {
  color: var(--learner-color-text-soft);
  font-size: 15px;
  font-weight: 650;
  text-align: center;
}

.select-state {
  width: var(--learner-control-height-small);
  height: var(--learner-control-height-small);
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #e8efff;
  color: var(--learner-color-primary);
}

.student-card--selected .select-state {
  background: var(--learner-color-success);
  color: #fff;
}

.select-state svg {
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.scope-note {
  max-width: 820px;
  display: flex;
  align-items: center;
  gap: var(--learner-space-4);
  margin: var(--learner-space-8) auto 0;
  padding: var(--learner-space-4) var(--learner-space-5);
  border: 2px solid #cbdced;
  border-radius: var(--learner-radius-medium);
  background: rgb(255 255 255 / 70%);
  color: var(--learner-color-text-soft);
}

.scope-note svg {
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--learner-color-primary);
  stroke-width: 3;
  stroke-linecap: round;
}

.scope-note p {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.6;
  word-break: keep-all;
}

.empty-state {
  padding: var(--learner-space-12);
  border: 3px dashed #cbd8e6;
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 72%);
  text-align: center;
}

.empty-state strong {
  font-size: 24px;
}

.empty-state p {
  margin: var(--learner-space-2) 0 0;
  color: var(--learner-color-text-soft);
}

@media (max-width: 880px) {
  .student-list {
    grid-template-columns: 1fr;
  }

  .student-card {
    min-height: 0;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto;
    align-items: center;
    text-align: left;
  }

  .student-name-row,
  .student-details {
    justify-content: flex-start;
  }

  .last-session {
    text-align: left;
  }
}

@media (max-width: 620px) {
  .session-header {
    align-items: flex-start;
    padding-inline: var(--learner-space-4);
  }

  .session-header > img {
    width: 150px;
  }

  .educator-session > span {
    display: none;
  }

  .selector-shell {
    width: min(100% - 32px, 1100px);
    padding-block: var(--learner-space-8);
  }

  .student-card {
    grid-template-columns: 82px 1fr;
    padding: var(--learner-space-4);
  }

  .student-avatar {
    width: 82px;
    height: 82px;
  }

  .select-state {
    grid-column: 1 / -1;
    width: 100%;
    border-radius: var(--learner-radius-small);
  }

  .scope-note {
    align-items: flex-start;
  }
}
</style>
