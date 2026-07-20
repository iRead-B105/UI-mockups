<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { students as mockStudents } from '@/features/teacher/mockData'
import type { Student } from '@/features/teacher/types'

const router = useRouter()
const query = ref('')
const ageFilter = ref('전체 나이')
const periodFilter = ref('전체 기간')
const page = ref(1)
const pageSize = 10
const students = ref(mockStudents.map((student) => ({ ...student })))
const studentPendingDeletion = ref<Student>()

const filteredStudents = computed(() => {
  const periodDays = periodFilter.value === '최근 7일' ? 7 : periodFilter.value === '최근 30일' ? 30 : null
  const today = new Date('2026-07-20T00:00:00')

  return students.value.filter((student) => {
    const normalizedQuery = query.value.trim().toLowerCase()
    const matchesQuery =
      !normalizedQuery ||
      student.name.toLowerCase().includes(normalizedQuery) ||
      student.school.toLowerCase().includes(normalizedQuery)
    const matchesAge = ageFilter.value === '전체 나이' || student.age === Number(ageFilter.value)
    const daysSinceLearning = Math.floor(
      (today.getTime() - new Date(`${student.lastLearningDate}T00:00:00`).getTime()) / 86_400_000,
    )
    const matchesPeriod = periodDays === null || (daysSinceLearning >= 0 && daysSinceLearning <= periodDays)
    return matchesQuery && matchesAge && matchesPeriod
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredStudents.value.length / pageSize)))
const pageStudents = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredStudents.value.slice(start, start + pageSize)
})

watch([query, ageFilter, periodFilter], () => (page.value = 1))
watch(totalPages, () => {
  if (page.value > totalPages.value) page.value = totalPages.value
})

function openStudent(student: Student) {
  router.push(`/teacher/students/${student.id}`)
}

function confirmStudentDeletion() {
  if (!studentPendingDeletion.value) return
  students.value = students.value.filter((student) => student.id !== studentPendingDeletion.value?.id)
  studentPendingDeletion.value = undefined
}
</script>

<template>
  <div class="dashboard">
    <section class="surface student-list">
      <div class="surface-header student-list__header">
        <div>
          <h2>학습자 목록</h2>
          <p>학생별 최근 학습 정보와 관리 메뉴입니다.</p>
        </div>
        <div class="filter-row">
          <label class="search-field">
            <span>⌕</span>
            <input v-model="query" type="search" placeholder="이름 또는 학교 검색" />
          </label>
          <select v-model="ageFilter" class="select" aria-label="나이 선택">
            <option>전체 나이</option>
            <option v-for="age in [6, 7, 8, 9, 10, 11, 12]" :key="age" :value="String(age)">{{ age }}세</option>
          </select>
          <select v-model="periodFilter" class="select" aria-label="기간 선택">
            <option>전체 기간</option>
            <option>최근 7일</option>
            <option>최근 30일</option>
          </select>
          <button class="button" type="button" @click="router.push('/teacher/students/new')">＋ 학생 등록</button>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>이름</th>
              <th>나이</th>
              <th>총 학습 시간</th>
              <th>최근 학습일</th>
              <th>최근 진행한 훈련</th>
              <th>최근 테스트일</th>
              <th>상세 보기</th>
              <th>정보 수정</th>
              <th>학생 삭제</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in pageStudents" :key="student.id">
              <td>
                <button
                  class="student-cell"
                  type="button"
                  title="클릭하여 아동 메인으로 이동"
                  @click="openStudent(student)"
                >
                  <img src="/images/student-profile.png" alt="" />
                  <strong>{{ student.name }}</strong>
                </button>
              </td>
              <td>{{ student.age }}세</td>
              <td>{{ student.totalLearningTime }}</td>
              <td>{{ student.lastLearningDate }}</td>
              <td><span class="training-badge">{{ student.latestTraining }}</span></td>
              <td>{{ student.lastTestDate }}</td>
              <td><button class="table-action" type="button" @click="openStudent(student)">상세 보기</button></td>
              <td><button class="table-action" type="button" @click="router.push(`/teacher/students/${student.id}/edit`)">정보 수정</button></td>
              <td><button class="table-action table-action--danger" type="button" @click="studentPendingDeletion = student">학생 삭제</button></td>
            </tr>
            <tr v-if="pageStudents.length === 0">
              <td colspan="9" class="empty-row">검색 조건에 맞는 학생이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-footer">
        <span>총 {{ filteredStudents.length }}명의 학생</span>
        <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 이동">
          <button type="button" :disabled="page === 1" @click="page--">이전</button>
          <button
            v-for="number in totalPages"
            :key="number"
            :class="{ active: page === number }"
            type="button"
            @click="page = number"
          >{{ number }}</button>
          <button type="button" :disabled="page === totalPages" @click="page++">다음</button>
        </nav>
      </footer>
    </section>

    <ConfirmDialog
      :open="Boolean(studentPendingDeletion)"
      title="학생을 삭제할까요?"
      :message="`${studentPendingDeletion?.name ?? ''} 학생의 목업 정보를 목록에서 삭제합니다.`"
      confirm-label="학생 삭제"
      @cancel="studentPendingDeletion = undefined"
      @confirm="confirmStudentDeletion"
    />
  </div>
</template>

<style scoped>
.dashboard { min-height: calc(100vh - 56px); }
.student-list { display: flex; min-height: calc(100vh - 56px); flex-direction: column; overflow: hidden; }
.student-list__header { align-items: flex-end; }
.student-list__header p { margin: 5px 0 0; color: var(--slate-500); font-size: 13px; }
.filter-row { display: flex; gap: 9px; }
.filter-row .select { width: 118px; }
.search-field { display: flex; width: 224px; height: 40px; align-items: center; gap: 8px; padding: 0 12px; border: 1px solid var(--slate-300); border-radius: var(--radius-sm); background: var(--white); }
.search-field span { color: var(--slate-400); font-size: 20px; }
.search-field input { width: 100%; border: 0; outline: 0; }
.table-scroll { flex: 1; overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 14px 12px; border-bottom: 1px solid var(--slate-200); text-align: left; white-space: nowrap; }
th { background: var(--slate-50); color: var(--slate-500); font-size: 11px; }
tbody tr:hover { background: #fafaff; }
.student-cell { display: flex; align-items: center; gap: 10px; padding: 0; border: 0; background: transparent; color: var(--slate-950); }
.student-cell img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.student-cell:hover strong { color: var(--primary-600); }
.training-badge { padding: 6px 9px; border-radius: 999px; background: #ecfeff; color: #0f766e; font-size: 11px; font-weight: 700; }
.table-action { padding: 5px 8px; border: 0; background: transparent; color: var(--primary-600); font-size: 12px; font-weight: 700; }
.table-action:hover { text-decoration: underline; }
.table-action--danger { color: var(--danger-600); }
.empty-row { padding: 40px; color: var(--slate-500); text-align: center; }
.table-footer { display: flex; align-items: center; justify-content: space-between; min-height: 62px; padding: 14px 20px; color: var(--slate-500); font-size: 12px; }
.pagination { display: flex; align-items: center; gap: 5px; }
.pagination button { min-width: 32px; height: 32px; border: 1px solid var(--slate-200); border-radius: 7px; background: var(--white); }
.pagination button.active { border-color: var(--primary-600); background: var(--primary-600); color: var(--white); }
</style>
