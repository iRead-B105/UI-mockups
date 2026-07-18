<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import { trainingSessions } from '@/features/teacher/mockData'

const selectedSessionId = ref(trainingSessions[0]?.id ?? 1)
const selectedSession = computed(() =>
  trainingSessions.find((session) => session.id === selectedSessionId.value),
)

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
      smooth: true,
      data: [98, 126, 84, 151, 114, 148, 102, 128, 164],
      lineStyle: { color: '#0ea5e9', width: 4 },
      itemStyle: { color: '#0ea5e9' },
      areaStyle: { color: 'rgba(14, 165, 233, 0.12)' },
    },
  ],
}
</script>

<template>
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
          <ChartPanel :option="speedChart" height="300px" aria-label="읽기 속도 추이 차트" />
        </section>
      </div>

      <section class="surface training-detail">
        <div class="surface-header">
          <div>
            <h2>{{ selectedSession?.title }}</h2>
            <p>{{ selectedSession?.date }}</p>
          </div>
          <span>{{ selectedSession?.achievement }}%</span>
        </div>
        <div class="training-detail__summary">
          <span>훈련 요약</span>
          <p>{{ selectedSession?.summary }}</p>
        </div>
        <div class="detail-list">
          <article v-for="(label, index) in ['소리 구분', '낱말 읽기', '문장 읽기']" :key="label">
            <div class="detail-list__number">{{ index + 1 }}</div>
            <div>
              <strong>{{ label }}</strong>
              <p>{{ 8 + index * 2 }}개 문항 · {{ 10 + index * 3 }}분 학습</p>
            </div>
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
  padding: 8px 18px 0;
}

.training-detail .surface-header > span {
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
