<script setup lang="ts">
import { ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import { learningLogs } from '@/features/teacher/mockData'

const note = ref(
  '김OO 학생은 글자와 소리의 대응이 빠르게 향상되고 있습니다. 받침이 포함된 문장을 읽을 때 속도가 흔들리는 경향이 있어 반복 연습이 필요합니다.',
)
const { visible: saved, show: showSaved } = useTemporaryNotice()

const levelChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 22, top: 30, bottom: 34 },
  xAxis: { type: 'category', data: ['5/1', '5/8', '5/15', '5/22', '5/29', '6/5', '6/12'] },
  yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    {
      name: '읽기 수준',
      type: 'line',
      smooth: true,
      data: [42, 51, 49, 63, 68, 72, 78],
      lineStyle: { width: 4, color: '#4f46e5' },
      itemStyle: { color: '#4f46e5' },
      areaStyle: { color: 'rgba(79, 70, 229, 0.12)' },
    },
  ],
}
</script>

<template>
  <div class="overview-grid">
    <section class="surface overview-card chart-card">
      <div class="surface-header">
        <div>
          <h2>정확도 개선 추이</h2>
          <p>최근 6주 동안의 읽기 정확도 변화입니다.</p>
        </div>
        <span class="positive">+12%</span>
      </div>
      <ChartPanel :option="levelChart" height="300px" aria-label="읽기 정확도 개선 추이" />
    </section>

    <section class="surface overview-card learning-log">
      <div class="surface-header">
        <div>
          <h2>최근 학습 기록</h2>
          <p>오늘 진행된 학습 활동입니다.</p>
        </div>
      </div>
      <ul>
        <li v-for="log in learningLogs" :key="`${log[0]}-${log[1]}`">
          <span class="log-dot"></span>
          <div>
            <strong>{{ log[1] }}</strong>
            <p>{{ log[0] }} · {{ log[2] }}</p>
          </div>
          <b>{{ log[3] }}</b>
        </li>
      </ul>
    </section>

    <section class="surface student-note">
      <SaveToast :visible="saved" />
      <div class="surface-header">
        <div>
          <h2>학생 특징 및 교수자 메모</h2>
          <p>다른 교수자와 공유할 학생의 학습 특성을 기록하세요.</p>
        </div>
      </div>
      <div class="student-note__content">
        <textarea v-model="note" class="textarea"></textarea>
        <button class="button" type="button" @click="showSaved">메모 저장</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.85fr);
}

.overview-card {
  overflow: hidden;
}

.surface-header p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.positive {
  padding: 6px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 800;
}

.chart-card :deep(.chart-panel) {
  padding: 10px 18px 0;
}

.learning-log ul {
  display: grid;
  margin: 0;
  padding: 16px 22px 22px;
  list-style: none;
}

.learning-log li {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid var(--slate-100);
  grid-template-columns: 10px 1fr auto;
}

.learning-log li:last-child {
  border-bottom: 0;
}

.learning-log p {
  margin: 3px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.learning-log b {
  color: var(--primary-600);
}

.log-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-500);
}

.student-note {
  position: relative;
  grid-column: 1 / -1;
}

.student-note__content {
  display: grid;
  justify-items: end;
  gap: 12px;
  padding: 22px;
}

.student-note .textarea {
  min-height: 160px;
}

</style>
