<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MetricCard from '@/components/common/MetricCard.vue'
import { students } from '@/features/teacher/mockData'

const router = useRouter()
const query = ref('')
const ageFilter = ref('전체 나이')
const periodFilter = ref('전체 기간')
const page = ref(1)

const filteredStudents = computed(() => {
  return students.filter((student) => {
    const matchesQuery = student.name.includes(query.value) || student.school.includes(query.value)
    const matchesAge = ageFilter.value === '전체 나이' || student.age === Number(ageFilter.value)
    return matchesQuery && matchesAge
  })
})
</script>

<template>
  <div class="dashboard page-stack">
    <header class="page-heading">
      <div>
        <h1>안녕하세요, 이OO 선생님</h1>
        <p>담당 학생의 학습 현황과 오늘 확인할 내용을 한눈에 살펴보세요.</p>
      </div>
      <button class="button" type="button" @click="router.push('/teacher/students/new')">
        ＋ 학생 등록
      </button>
    </header>

    <section class="metrics-grid">
      <MetricCard label="전체 학생 수" value="28명" description="지난달보다 2명 증가">♙</MetricCard>
      <MetricCard label="오늘 학습 예정" value="15명" description="오전 8명 · 오후 7명" tone="sky"
        >◷</MetricCard
      >
      <MetricCard label="이번 주 완료율" value="68%" description="목표까지 12% 남음" tone="warning"
        >↗</MetricCard
      >
    </section>

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
          <select v-model="ageFilter" class="select">
            <option>전체 나이</option>
            <option value="10">10세</option>
            <option value="12">12세</option>
          </select>
          <select v-model="periodFilter" class="select">
            <option>전체 기간</option>
            <option>최근 7일</option>
            <option>최근 30일</option>
          </select>
        </div>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" aria-label="전체 학생 선택" /></th>
              <th>이름</th>
              <th>나이</th>
              <th>최근 테스트일</th>
              <th>총 학습 시간</th>
              <th>최근 진행한 훈련</th>
              <th>최근 접속</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td><input type="checkbox" :aria-label="`${student.name} 선택`" /></td>
              <td>
                <div class="student-cell">
                  <img src="/images/student-profile.png" alt="" />
                  <strong>{{ student.name }}</strong>
                </div>
              </td>
              <td>{{ student.age }}세</td>
              <td>{{ student.lastTestDate }}</td>
              <td>{{ student.totalLearningTime }}</td>
              <td>
                <span class="training-badge">{{ student.latestTraining }}</span>
              </td>
              <td>{{ student.lastAccess }}</td>
              <td>
                <div class="row-actions">
                  <button
                    class="button button--secondary button--small"
                    @click="router.push(`/teacher/students/${student.id}`)"
                  >
                    상세 보기
                  </button>
                  <button
                    class="button button--secondary button--small"
                    @click="router.push(`/teacher/students/${student.id}/edit`)"
                  >
                    정보 수정
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="8" class="empty-row">검색 조건에 맞는 학생이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-footer">
        <span>총 {{ filteredStudents.length }}명의 학생</span>
        <nav class="pagination" aria-label="페이지 이동">
          <button type="button" :disabled="page === 1" @click="page = Math.max(1, page - 1)">
            이전
          </button>
          <button
            v-for="number in [1, 2, 3]"
            :key="number"
            :class="{ active: page === number }"
            type="button"
            @click="page = number"
          >
            {{ number }}
          </button>
          <span>…</span>
          <button type="button" @click="page += 1">다음</button>
        </nav>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1240px;
  margin: 0 auto;
}

.metrics-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.student-list {
  overflow: hidden;
}

.student-list__header p {
  margin: 5px 0 0;
  color: var(--slate-500);
  font-size: 13px;
}

.filter-row {
  display: flex;
  gap: 10px;
}

.filter-row .select {
  width: 126px;
}

.search-field {
  display: flex;
  width: 240px;
  height: 40px;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-sm);
  background: var(--white);
}

.search-field span {
  color: var(--slate-400);
  font-size: 20px;
}

.search-field input {
  width: 100%;
  border: 0;
  outline: 0;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--slate-200);
  text-align: left;
  white-space: nowrap;
}

th {
  background: var(--slate-50);
  color: var(--slate-500);
  font-size: 12px;
}

tbody tr:hover {
  background: #fafaff;
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-cell img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.training-badge {
  padding: 6px 9px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

.row-actions {
  display: flex;
  gap: 6px;
}

.empty-row {
  padding: 40px;
  color: var(--slate-500);
  text-align: center;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: var(--slate-500);
  font-size: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
}

.pagination button {
  min-width: 32px;
  height: 32px;
  border: 1px solid var(--slate-200);
  border-radius: 7px;
  background: var(--white);
}

.pagination button.active {
  border-color: var(--primary-600);
  background: var(--primary-600);
  color: var(--white);
}
</style>
