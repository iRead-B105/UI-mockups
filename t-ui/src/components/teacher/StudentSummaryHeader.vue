<script setup lang="ts">
import { useRouter } from 'vue-router'
import { selectedStudent } from '@/features/teacher/mockData'

const router = useRouter()

function deleteStudent() {
  if (window.confirm('목업에서 이 학생을 삭제 처리할까요?')) {
    window.alert('목업 환경에서는 실제 데이터가 삭제되지 않습니다.')
  }
}
</script>

<template>
  <section class="student-summary surface">
    <img src="/images/student-profile.png" :alt="selectedStudent.name" />
    <dl>
      <div>
        <dt>이름</dt>
        <dd>{{ selectedStudent.name }}</dd>
      </div>
      <div>
        <dt>학교</dt>
        <dd>{{ selectedStudent.school }}</dd>
      </div>
      <div>
        <dt>보호자</dt>
        <dd>{{ selectedStudent.guardianName }}</dd>
      </div>
      <div>
        <dt>학습 시작일</dt>
        <dd>{{ selectedStudent.learningStartDate }}</dd>
      </div>
      <div>
        <dt>최근 학습일</dt>
        <dd>{{ selectedStudent.lastTestDate }}</dd>
      </div>
      <div>
        <dt>이번 주 출석률</dt>
        <dd>{{ selectedStudent.weeklyAttendance }}</dd>
      </div>
    </dl>
    <div class="student-summary__actions">
      <button
        class="button button--secondary button--small"
        type="button"
        @click="router.push('/teacher/students/1/edit')"
      >
        정보 수정
      </button>
      <button class="button button--danger button--small" type="button" @click="deleteStudent">
        학생 삭제
      </button>
    </div>
  </section>
</template>

<style scoped>
.student-summary {
  display: grid;
  min-height: 146px;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  grid-template-columns: 88px 1fr 106px;
}

.student-summary > img {
  width: 82px;
  height: 82px;
  border: 4px solid var(--primary-50);
  border-radius: 50%;
  object-fit: cover;
}

.student-summary dl {
  display: grid;
  margin: 0;
  gap: 18px 24px;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
}

.student-summary dl div {
  min-width: 0;
}

.student-summary dt {
  margin-bottom: 5px;
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
}

.student-summary dd {
  overflow: hidden;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-summary__actions {
  display: grid;
  gap: 8px;
}
</style>
