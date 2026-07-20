<script setup lang="ts">
// 학생의 최근 학습 현황, 학습 로그, 교수자 메모를 한 화면에 요약합니다.
import { ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import { learningLogs } from '@/features/teacher/mockData'

// ref로 감싼 메모는 textarea의 v-model과 연결되어 입력할 때마다 값이 갱신됩니다.
const note = ref(
  '김OO 학생은 글자와 소리의 대응이 빠르게 향상되고 있습니다. 받침이 포함된 문장을 읽을 때 속도가 흔들리는 경향이 있어 반복 연습이 필요합니다.',
)
// 재사용 기능의 visible/show를 이 화면에서 이해하기 쉬운 saved/showSaved 이름으로 바꿔 받습니다.
const { visible: saved, show: showSaved } = useTemporaryNotice()

// ECharts가 선 그래프를 그릴 때 사용할 축, 데이터, 색상 설정 객체입니다.
const levelChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 42, right: 22, top: 30, bottom: 34 },
  xAxis: { type: 'category', data: ['5/1', '5/8', '5/15', '5/22', '5/29', '6/5', '6/12'] },
  yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    {
      name: '읽기 수준',
      type: 'line',
      // 각 측정 지점을 직선으로 연결합니다.
      smooth: false,
      data: [42, 51, 49, 63, 68, 72, 78],
      lineStyle: { width: 4, color: '#4f46e5' },
      itemStyle: { color: '#4f46e5' },
      areaStyle: { color: 'rgba(79, 70, 229, 0.12)' },
    },
  ],
}
</script>

<template>
  <!-- 상단 두 카드와 하단 전체 너비 메모를 CSS Grid로 배치합니다. -->
  <div class="overview-grid">
    <section class="surface overview-card chart-card">
      <div class="surface-header">
        <div>
          <h2>정확도 개선 추이</h2>
          <p>최근 6주 동안의 읽기 정확도 변화입니다.</p>
        </div>
        <span class="positive">+12%</span>
      </div>
      <!-- 공통 ChartPanel에 설정 객체를 전달해 실제 차트를 그립니다. -->
      <ChartPanel :option="levelChart" height="360px" aria-label="읽기 정확도 개선 추이" />
    </section>

    <section class="surface overview-card learning-log">
      <div class="surface-header">
        <div>
          <h2>최근 학습 기록</h2>
          <p>오늘 진행된 학습 활동입니다.</p>
        </div>
      </div>
      <ul>
        <!-- 로그를 반복하며 날짜와 활동명을 합친 고유 key로 각 행을 구별합니다. -->
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
      <SaveToast :visible="saved" :show-icon="false" />
      <div class="surface-header">
        <div>
          <h2>학생 특징 메모</h2>
          <p>학생의 학습 특성을 기록하세요.</p>
        </div>
      </div>
      <div class="student-note__content">
        <!-- 입력 내용과 note를 양방향 연결하고 클릭하면 임시 저장 알림을 띄웁니다. -->
        <textarea v-model="note" class="textarea"></textarea>
        <button class="button" type="button" @click="showSaved">메모 저장</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.overview-grid {
  /* 왼쪽 차트가 오른쪽 기록 카드보다 넓도록 1.35:0.85 비율로 나눕니다. */
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
  /* :deep은 scoped 경계를 넘어 자식 ChartPanel 내부 요소에 여백을 적용합니다. */
  padding: 10px 18px 0;
}

.learning-log ul {
  display: grid;
  margin: 0;
  padding: 16px 22px 22px;
  list-style: none;
}

.learning-log li {
  /* 점, 로그 설명, 점수를 3열로 정렬합니다. */
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
  /* 첫 열부터 마지막 열까지 차지해 두 카드 아래 전체 너비로 표시합니다. */
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
