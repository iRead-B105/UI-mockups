<script setup lang="ts">
// 훈련 세션을 선택해 상세 결과와 읽기 속도 변화를 확인하는 화면입니다.
import { computed, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import { trainingSessions } from '@/features/teacher/mockData'

// 첫 훈련을 기본 선택하며 데이터가 비어 있으면 id 1을 임시 기본값으로 씁니다.
const selectedSessionId = ref(trainingSessions[0]?.id ?? 1)
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
      data: [98, 126, 84, 151, 114, 148, 102, 128, 164],
      lineStyle: { color: '#0ea5e9', width: 4 },
      itemStyle: { color: '#0ea5e9' },
      areaStyle: { color: 'rgba(14, 165, 233, 0.12)' },
    },
  ],
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
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `training-${session.id}-raw-data.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <!-- 왼쪽에는 목록/차트, 오른쪽에는 선택 훈련의 상세 정보를 배치합니다. -->
  <div class="training-history page-stack">
    <header class="page-heading">
      <div>
        <h1>훈련 이력</h1>
        <p>커리큘럼별 학습 결과와 읽기 속도 변화를 확인합니다.</p>
      </div>
      <select class="select period-select" aria-label="조회 기간">
        <option>최근 30일</option>
        <option>최근 3개월</option>
      </select>
    </header>

    <div class="history-grid">
      <div class="history-left">
        <section class="surface session-summary">
          <div class="surface-header"><h2>커리큘럼 로그 목록</h2></div>
          <!-- 훈련 수만큼 버튼을 만들며 클릭한 세션 id를 선택 상태에 저장합니다. -->
          <button
            v-for="session in trainingSessions"
            :key="session.id"
            class="session-row"
            :class="{ active: session.id === selectedSessionId }"
            type="button"
            @click="selectedSessionId = session.id"
          >
            <span>{{ session.date }}</span>
            <strong>{{ session.curriculum }}</strong>
            <b>{{ session.achievement }}%</b>
          </button>
          <p class="session-description">
            항목을 선택하면 해당 훈련의 상세 기록이 오른쪽에 표시됩니다.
          </p>
        </section>

        <section class="surface chart-surface">
          <div class="surface-header">
            <div>
              <h2>읽기 속도 추이</h2>
              <p>분당 정확하게 읽은 단어 수</p>
            </div>
            <span class="trend-up">+18%</span>
          </div>
          <!-- 공통 ChartPanel이 speedChart 설정에 따라 canvas 차트를 그립니다. -->
          <ChartPanel :option="speedChart" height="360px" aria-label="읽기 속도 추이 차트" />
        </section>
      </div>

      <section class="surface training-detail">
        <div class="surface-header">
          <div>
            <h2>{{ selectedSession?.title }}</h2>
            <p>{{ selectedSession?.date }}</p>
          </div>
          <div class="training-detail__actions">
            <span>{{ selectedSession?.achievement }}%</span>
            <button class="button button--secondary button--small" type="button" @click="downloadRawData">
              원천 데이터 다운로드
            </button>
          </div>
        </div>
        <div class="training-detail__summary">
          <span>훈련 요약</span>
          <p>{{ selectedSession?.summary }}</p>
        </div>
        <div class="detail-list">
          <!-- 고정된 세 단계 배열을 반복하고 index로 문항 수, 시간, 달성률 예시를 계산합니다. -->
          <article v-for="(label, index) in ['소리 구분', '낱말 읽기', '문장 읽기']" :key="label">
            <div class="detail-list__number">{{ index + 1 }}</div>
            <div>
              <strong>{{ label }}</strong>
              <p>{{ 8 + index * 2 }}개 문항 · {{ 10 + index * 3 }}분 학습</p>
            </div>
            <!-- 단계별로 8점씩 줄이되 Math.max로 최소 표시값을 50점으로 제한합니다. -->
            <span>{{ Math.max(50, (selectedSession?.achievement ?? 0) - index * 8) }}%</span>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.period-select {
  width: 140px;
}

.history-grid {
  /* 왼쪽 기록 영역과 오른쪽 상세 영역을 두 열로 나눕니다. */
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) minmax(390px, 0.82fr);
}

.history-left {
  display: grid;
  gap: 20px;
}

.session-summary,
.chart-surface,
.training-detail {
  overflow: hidden;
}

.session-row {
  /* 날짜, 커리큘럼명, 달성률을 고정/유동/고정의 세 열로 맞춥니다. */
  display: grid;
  width: calc(100% - 36px);
  align-items: center;
  gap: 16px;
  margin: 10px 18px;
  padding: 13px 14px;
  border: 1px solid var(--slate-200);
  border-radius: 9px;
  background: var(--white);
  color: var(--slate-600);
  text-align: left;
  grid-template-columns: 132px 1fr 52px;
}

.session-row.active,
.session-row:hover {
  /* 선택된 세션과 마우스를 올린 세션을 같은 방식으로 강조합니다. */
  border-color: var(--primary-500);
  background: var(--primary-50);
}

.session-row span {
  font-size: 12px;
}

.session-row b {
  color: var(--primary-700);
  text-align: right;
}

.session-description {
  margin: 14px 18px 18px;
  color: var(--slate-500);
  font-size: 12px;
}

.surface-header p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.trend-up {
  color: var(--success-600);
  font-weight: 800;
}

.chart-surface :deep(.chart-panel) {
  /* 자식 차트 컴포넌트 내부 요소에 scoped 바깥에서 여백을 적용합니다. */
  padding: 8px 18px 0;
}

.training-detail__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.training-detail__actions > span {
  color: var(--primary-600);
  font-size: 22px;
  font-weight: 800;
}

.training-detail__summary {
  margin: 18px;
  padding: 18px;
  border-radius: 10px;
  background: var(--slate-50);
}

.training-detail__summary span {
  color: var(--primary-600);
  font-size: 12px;
  font-weight: 800;
}

.training-detail__summary p {
  margin: 7px 0 0;
  color: var(--slate-600);
}

.detail-list {
  display: grid;
  gap: 12px;
  padding: 0 18px 20px;
}

.detail-list article {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--slate-200);
  border-radius: 10px;
  grid-template-columns: 36px 1fr auto;
}

.detail-list__number {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 9px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 800;
}

.detail-list p {
  margin: 3px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.detail-list article > span {
  color: var(--primary-700);
  font-weight: 800;
}
</style>
