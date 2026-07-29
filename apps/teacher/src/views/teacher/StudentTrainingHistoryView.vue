<script setup lang="ts">
// 훈련 세션을 선택해 상세 결과와 읽기 속도 변화를 확인하는 화면입니다.
import { computed, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import { trainingSessions } from '@/features/teacher/mockData'

// 첫 훈련을 기본 선택하며 데이터가 비어 있으면 id 1을 임시 기본값으로 씁니다.
const selectedSessionId = ref(trainingSessions[0]?.id ?? 1)
const period = ref('최근 30일')
// 선택 id가 바뀔 때 해당 훈련 객체를 다시 찾아 오른쪽 상세 내용도 갱신합니다.
const selectedSession = computed(() =>
  trainingSessions.find((session) => session.id === selectedSessionId.value),
)

// 날짜별 분당 읽은 단어 수를 선 그래프로 표현하는 ECharts 설정입니다.
const speedChart: EChartsOption = {
  tooltip: { trigger: 'axis', valueFormatter: (value) => `${value}단어/분` },
  grid: { left: 48, right: 24, top: 28, bottom: 34 },
  xAxis: {
    type: 'category',
    data: ['5/1', '5/5', '5/8', '5/12', '5/15', '5/19', '5/22', '5/26', '5/29'],
  },
  yAxis: { type: 'value', min: 60, max: 180 },
  series: [
    {
      name: '읽기 속도',
      type: 'line',
      smooth: false,
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 5,
      data: [98, 126, 84, 151, 114, 148, 102, 128, 164],
      lineStyle: { color: '#0ea5e9', width: 3 },
      itemStyle: { color: '#0ea5e9' },
    },
  ],
}

function formatSessionDate(value: string) {
  const [date = '', time = ''] = value.split(' ')
  const [, month = '01', day = '01'] = date.split('-')
  return `${Number(month)}월 ${Number(day)}일 ${time}`
}

function getLearningStatus(score: number) {
  if (score >= 80) return '양호'
  if (score >= 60) return '보완 필요'
  return '재학습 권장'
}

function downloadRawData() {
  const session = selectedSession.value
  if (!session) return
  const rows = [
    ['항목', '값'],
    ['훈련명', session.title],
    ['학습일', session.date],
    ['진행률', `${session.achievement}%`],
    ['훈련 요약', session.summary],
    ['소리 구분 정확도', `${session.achievement}%`],
    ['낱말 읽기 정확도', `${Math.max(50, session.achievement - 8)}%`],
    ['문장 읽기 정확도', `${Math.max(50, session.achievement - 16)}%`],
  ]
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `training-${session.id}-raw-data.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function downloadJsonData() {
  const session = selectedSession.value
  if (!session) return

  const activities = ['소리 구분', '낱말 읽기', '문장 읽기'].map((name, index) => {
    const accuracy = Math.max(50, session.achievement - index * 8)
    return {
      name,
      questionCount: 8 + index * 2,
      durationMinutes: 10 + index * 3,
      accuracy,
      status: getLearningStatus(accuracy),
    }
  })
  const json = JSON.stringify(
    {
      trainingId: session.id,
      title: session.title,
      curriculum: session.curriculum,
      completedAt: session.date,
      achievement: session.achievement,
      status: getLearningStatus(session.achievement),
      summary: session.summary,
      activities,
    },
    null,
    2,
  )
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `training-${session.id}-raw-data.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="training-history page-stack">
    <PageHeader title="훈련 이력" description="훈련 결과와 읽기 속도 변화를 확인합니다.">
      <template #actions>
        <div class="header-history-controls" aria-label="이력 조회 조건">
          <label for="training-period">조회 기간</label>
          <select id="training-period" v-model="period" class="select">
            <option>최근 30일</option>
            <option>최근 3개월</option>
          </select>
          <span>{{ period }} · 훈련 {{ trainingSessions.length }}건</span>
        </div>
      </template>
    </PageHeader>

    <div class="training-workspace">
      <div class="training-main">
        <section class="session-history">
          <header class="section-heading">
            <div>
              <h2>훈련 기록</h2>
            </div>
          </header>

          <div class="session-table">
            <div class="session-table__head">
              <span>학습일</span><span>커리큘럼</span><span>결과</span>
            </div>
            <button
              v-for="session in trainingSessions"
              :key="session.id"
              class="session-row"
              :class="{ active: session.id === selectedSessionId }"
              type="button"
              @click="selectedSessionId = session.id"
            >
              <span>{{ formatSessionDate(session.date) }}</span>
              <strong>{{ session.curriculum }}</strong>
              <span class="session-result">
                <b>{{ session.achievement }}%</b>
                <small>{{ getLearningStatus(session.achievement) }}</small>
              </span>
            </button>
          </div>
        </section>

        <section class="speed-trend">
          <header class="section-heading">
            <div>
              <h2>읽기 속도 추이</h2>
              <p>분당 정확하게 읽은 단어 수</p>
            </div>
            <div class="trend-summary">
              <strong>+18%</strong>
              <span>기간 시작 대비</span>
            </div>
          </header>
          <ChartPanel :option="speedChart" height="250px" aria-label="읽기 속도 추이 차트" />
        </section>
      </div>

      <aside class="training-detail">
        <header class="detail-heading">
          <div>
            <span>선택한 훈련</span>
            <h2>{{ selectedSession?.title }}</h2>
            <p>{{ formatSessionDate(selectedSession?.date ?? '') }}</p>
          </div>
          <div class="detail-score">
            <strong>{{ selectedSession?.achievement }}%</strong>
            <span>{{ getLearningStatus(selectedSession?.achievement ?? 0) }}</span>
          </div>
        </header>

        <div class="training-summary">
          <span>훈련 요약</span>
          <p>{{ selectedSession?.summary }}</p>
        </div>

        <div class="detail-list">
          <article v-for="(label, index) in ['소리 구분', '낱말 읽기', '문장 읽기']" :key="label">
            <div>
              <strong>{{ label }}</strong>
              <p>{{ 8 + index * 2 }}개 문항 · {{ 10 + index * 3 }}분 학습</p>
            </div>
            <span>
              <b>{{ Math.max(50, (selectedSession?.achievement ?? 0) - index * 8) }}%</b>
              <small>{{
                getLearningStatus(Math.max(50, (selectedSession?.achievement ?? 0) - index * 8))
              }}</small>
            </span>
          </article>
        </div>

        <div class="download-actions">
          <button class="download-button" type="button" @click="downloadRawData">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v3h14v-3" />
            </svg>
            <span>CSV 저장</span>
          </button>
          <button class="download-button" type="button" @click="downloadJsonData">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 3h7l4 4v14H7zM14 3v5h4m-7 4-2 2 2 2m4-4 2 2-2 2" />
            </svg>
            <span>JSON 저장</span>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.training-history {
  gap: 18px;
  container-type: inline-size;
}
.header-history-controls {
  display: flex;
  align-items: center;
  gap: 9px;
}
.header-history-controls label {
  color: var(--slate-600);
  font-size: 11px;
  font-weight: 700;
}
.header-history-controls .select {
  width: 132px;
}
.header-history-controls span {
  margin-left: 3px;
  padding-left: 12px;
  border-left: 1px solid var(--slate-200);
  color: var(--slate-500);
  font-size: 11px;
  white-space: nowrap;
}
.training-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(380px, 0.88fr);
}
.training-main {
  min-width: 0;
  padding: 2px 24px 18px 0;
}
.training-detail {
  min-width: 0;
  padding: 2px 0 18px 24px;
  border-left: 1px solid var(--slate-200);
}
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.section-heading h2 {
  margin: 0;
  font-size: 17px;
}
.section-heading p {
  margin: 5px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}
.session-table {
  margin-top: 12px;
}
.session-table__head,
.session-row {
  display: grid;
  align-items: center;
  gap: 14px;
  grid-template-columns: 120px minmax(0, 1fr) 88px;
}
.session-table__head {
  padding: 9px 12px;
  border-bottom: 1px solid var(--slate-300);
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 600;
}
.session-row {
  position: relative;
  width: 100%;
  min-height: 58px;
  padding: 10px 12px;
  border: 0;
  border-bottom: 1px solid var(--slate-200);
  background: transparent;
  color: var(--slate-600);
  text-align: left;
}
.session-row::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 0;
  width: 3px;
  background: transparent;
  content: '';
}
.session-row:hover {
  background: var(--slate-50);
}
.session-row.active::before {
  background: var(--primary-600);
}
.session-row > span:first-child {
  font-size: 12px;
}
.session-row strong {
  color: var(--slate-800);
  font-size: 13px;
}
.session-result {
  display: grid;
  justify-items: end;
  gap: 1px;
}
.session-result b {
  color: var(--slate-800);
  font-size: 13px;
}
.session-result small {
  color: var(--slate-500);
  font-size: 12px;
}
.speed-trend {
  margin-top: 30px;
}
.trend-summary {
  display: grid;
  justify-items: end;
  gap: 1px;
}
.trend-summary strong {
  color: var(--slate-900);
  font-size: 18px;
}
.trend-summary span {
  color: var(--slate-500);
  font-size: 12px;
}
.speed-trend :deep(.chart-panel) {
  padding-top: 3px;
}
.detail-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 10px;
}
.detail-heading > div:first-child > span {
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 600;
}
.detail-heading h2 {
  margin: 5px 0 0;
  font-size: 18px;
  line-height: 1.4;
}
.detail-heading p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}
.detail-score {
  display: grid;
  flex: 0 0 auto;
  justify-items: end;
  gap: 1px;
}
.detail-score strong {
  color: var(--slate-900);
  font-size: 20px;
}
.detail-score span {
  color: var(--slate-500);
  font-size: 12px;
}
.training-summary {
  padding: 14px 0 8px;
}
.training-summary > span {
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 600;
}
.training-summary p {
  margin: 6px 0 0;
  color: var(--slate-700);
  font-size: 13px;
  line-height: 1.6;
}
.detail-list {
  display: grid;
}
.detail-list article {
  display: grid;
  min-height: 66px;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--slate-200);
  grid-template-columns: minmax(0, 1fr) auto;
}
.detail-list strong {
  color: var(--slate-800);
  font-size: 13px;
}
.detail-list p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}
.detail-list article > span {
  display: grid;
  justify-items: end;
  gap: 1px;
}
.detail-list article > span b {
  color: var(--slate-800);
  font-size: 13px;
}
.detail-list article > span small {
  color: var(--slate-500);
  font-size: 12px;
}
.download-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}
.download-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  border: 1px solid var(--slate-300);
  border-radius: 7px;
  background: var(--white);
  color: var(--primary-700);
  font-size: 12px;
  font-weight: 700;
}
.download-button:hover {
  border-color: var(--primary-400);
  background: var(--primary-50);
}
.download-button:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
.download-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

@container (max-width: 1000px) {
  .training-workspace {
    grid-template-columns: 1fr;
  }
  .training-main {
    padding-right: 0;
  }
  .training-detail {
    padding: 30px 0 18px;
    border-left: 0;
  }
}
</style>
