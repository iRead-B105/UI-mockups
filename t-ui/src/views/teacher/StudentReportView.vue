<script setup lang="ts">
// 선택 기간의 학습 데이터를 여러 차트와 요약 카드로 구성해 보고서 형태로 보여 줍니다.
import { ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'

// 기간, 보고서 생성·수정 상태, 메모처럼 변경 가능한 화면 값을 ref로 관리합니다.
const startDate = ref('2026-06-15')
const endDate = ref('2026-07-15')
const generated = ref(false)
const editing = ref(true)
const { visible: reportSaved, show: showReportSaved } = useTemporaryNotice()
const { visible: memoSaved, show: showMemoSaved } = useTemporaryNotice()
const memo = ref(
  '학생은 최근 4주 동안 읽기 정확도와 유창성에서 꾸준한 향상을 보였습니다. 다음 학습에서는 낯선 낱말의 의미를 문맥으로 추론하는 활동을 강화할 예정입니다.',
)

// 정확도와 유창성 두 지표의 시간에 따른 변화를 비교하는 선 그래프 설정입니다.
const trendChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['읽기 정확도', '읽기 유창성'], top: 8 },
  grid: { left: 48, right: 28, top: 48, bottom: 36 },
  xAxis: { type: 'category', data: ['6/15', '6/20', '6/25', '6/30', '7/5', '7/10', '7/15'] },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
  series: [
    {
      name: '읽기 정확도',
      type: 'line',
      smooth: true,
      data: [54, 60, 64, 68, 72, 78, 84],
      lineStyle: { width: 4, color: '#4f46e5' },
      itemStyle: { color: '#4f46e5' },
    },
    {
      name: '읽기 유창성',
      type: 'line',
      smooth: true,
      data: [42, 49, 56, 61, 66, 70, 76],
      lineStyle: { width: 3, color: '#0ea5e9' },
      itemStyle: { color: '#0ea5e9' },
    },
  ],
}

// 읽기 영역별 현재 점수를 가로 막대로 비교하는 차트 설정입니다.
const domainChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 76, right: 24, top: 18, bottom: 24 },
  xAxis: { type: 'value', max: 100 },
  yAxis: { type: 'category', data: ['음운 인식', '파닉스', '유창성', '어휘', '이해력'] },
  series: [
    {
      type: 'bar',
      data: [82, 76, 71, 64, 58],
      itemStyle: { color: '#14b8a6', borderRadius: [0, 6, 6, 0] },
      label: { show: true, position: 'right', formatter: '{c}점' },
    },
  ],
}

// 최근 4주의 학습 시간을 세로 막대로 보여 주는 차트 설정입니다.
const activityChart: EChartsOption = {
  tooltip: { trigger: 'axis' },
  grid: { left: 48, right: 24, top: 24, bottom: 36 },
  xAxis: { type: 'category', data: ['1주', '2주', '3주', '4주'] },
  yAxis: { type: 'value', name: '분' },
  series: [
    {
      type: 'bar',
      data: [82, 104, 126, 138],
      itemStyle: { color: '#f59e0b', borderRadius: [7, 7, 0, 0] },
    },
  ],
}

function handleReportAction() {
  if (generated.value && !editing.value) {
    editing.value = true
    return
  }
  generated.value = true
  editing.value = false
}

function printReport() {
  // 브라우저의 기본 인쇄 창을 열며 @media print CSS가 인쇄용 모양을 적용합니다.
  window.print()
}
</script>

<template>
  <!-- print-hidden 클래스가 있는 조작 버튼과 필터는 인쇄 결과에서 제외됩니다. -->
  <div class="report page-stack">
    <header class="page-heading print-hidden">
      <div>
        <h1>학습 보고서</h1>
        <p>선택한 기간의 학습 기록과 변화 추이를 종합해 제공합니다.</p>
      </div>
    </header>

    <section class="surface report-filter print-hidden">
      <div class="field">
        <label for="start-date">시작일</label
        ><input id="start-date" v-model="startDate" class="input" type="date" :disabled="!editing" />
      </div>
      <span>부터</span>
      <div class="field">
        <label for="end-date">종료일</label
        ><input id="end-date" v-model="endDate" class="input" type="date" :disabled="!editing" />
      </div>
      <div class="report-actions">
        <button class="button" type="button" @click="handleReportAction">
          {{ generated && !editing ? '보고서 수정' : '보고서 생성' }}
        </button>
        <template v-if="generated && !editing">
          <button class="button button--secondary" type="button" @click="showReportSaved">보고서 저장</button>
          <button class="button button--secondary" type="button" @click="printReport">출력</button>
        </template>
      </div>
    </section>

    <div v-if="reportSaved" class="status-message print-hidden">보고서가 저장되었습니다.</div>

    <template v-if="generated">
    <section class="surface report-cover">
      <div>
        <span>iRead Learning Report</span>
        <h1>김OO 학생 학습 보고서</h1>
        <p>{{ startDate }} ~ {{ endDate }}</p>
      </div>
      <img src="/images/student-profile.png" alt="김OO" />
    </section>

    <section class="report-metrics">
      <article class="surface">
        <span>총 학습 시간</span><strong>13시간 20분</strong><small>이전 기간보다 18% 증가</small>
      </article>
      <article class="surface">
        <span>학습 완료율</span><strong>88%</strong><small>목표 80% 달성</small>
      </article>
      <article class="surface">
        <span>읽기 정확도</span><strong>84점</strong><small>12점 향상</small>
      </article>
      <article class="surface">
        <span>출석률</span><strong>92%</strong><small>총 12회 학습</small>
      </article>
    </section>

    <section class="surface report-section">
      <div class="surface-header">
        <div>
          <h2>학습 변화 추이</h2>
          <p>읽기 정확도와 유창성의 기간별 변화</p>
        </div>
      </div>
      <!-- 차트 설정은 props로 전달하고 접근성 문구로 차트 의미를 함께 제공합니다. -->
      <ChartPanel :option="trendChart" height="360px" aria-label="학습 변화 추이 차트" />
    </section>

    <div class="report-chart-grid">
      <section class="surface report-section">
        <div class="surface-header">
          <div>
            <h2>영역별 성취도</h2>
            <p>읽기 영역별 현재 수준</p>
          </div>
        </div>
        <ChartPanel :option="domainChart" height="320px" aria-label="영역별 성취도 차트" />
      </section>
      <section class="surface report-section">
        <div class="surface-header">
          <div>
            <h2>주간 학습 시간</h2>
            <p>최근 4주 학습 참여도</p>
          </div>
        </div>
        <ChartPanel :option="activityChart" height="320px" aria-label="주간 학습 시간 차트" />
      </section>
    </div>

    <section class="surface pattern-section">
      <div class="surface-header">
        <div>
          <h2>개선된 패턴과 어려워하는 패턴</h2>
          <p>학습 결과를 바탕으로 정리한 교수자 참고 정보</p>
        </div>
      </div>
      <div class="pattern-grid">
        <article>
          <span class="pattern-icon pattern-icon--good">✓</span>
          <div>
            <h3>개선된 패턴</h3>
            <p>받침 소리를 분리해 읽는 정확도가 향상되었습니다.</p>
            <p>짧은 문장을 일정한 속도로 읽을 수 있습니다.</p>
          </div>
        </article>
        <article>
          <span class="pattern-icon pattern-icon--warn">!</span>
          <div>
            <h3>추가 지도가 필요한 패턴</h3>
            <p>낯선 어휘를 만났을 때 첫 음절을 추측하는 경향이 있습니다.</p>
            <p>긴 문장에서 핵심 정보를 찾는 연습이 필요합니다.</p>
          </div>
        </article>
      </div>
    </section>

    <section class="surface report-memo">
      <!-- useTemporaryNotice의 memoSaved가 true인 동안만 저장 완료 토스트가 보입니다. -->
      <SaveToast :visible="memoSaved" />
      <div class="surface-header">
        <div>
          <h2>교수자 메모</h2>
          <p>보고서에 함께 저장할 상담 및 지도 내용을 작성하세요.</p>
        </div>
      </div>
      <div class="report-memo__content">
        <textarea v-model="memo" class="textarea"></textarea>
        <button class="button print-hidden" type="button" @click="showMemoSaved">메모 저장</button>
      </div>
    </section>
    </template>
  </div>
</template>

<style scoped>
.report {
  width: 100%;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.report-filter {
  /* 시작일, 종료일, 불러오기 버튼을 한 줄 아래 기준으로 정렬합니다. */
  display: flex;
  align-items: end;
  gap: 14px;
  padding: 18px 20px;
}

.report-filter .field {
  width: 180px;
}

.report-filter > span {
  padding-bottom: 10px;
  color: var(--slate-500);
}

.report-filter .report-actions {
  margin-left: auto;
}

.report-cover {
  /* 보고서 표지는 좌우 정렬과 그라데이션 배경으로 문서 표지처럼 표현합니다. */
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: space-between;
  padding: 30px 36px;
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #0ea5e9 120%);
  color: var(--white);
}

.report-cover span {
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.report-cover h1 {
  margin: 10px 0 6px;
  font-size: 28px;
}

.report-cover p {
  margin: 0;
  color: #e0e7ff;
}

.report-cover img {
  width: 112px;
  height: 112px;
  border: 5px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  object-fit: cover;
}

.report-metrics {
  /* 네 핵심 지표를 같은 너비의 네 열로 나란히 표시합니다. */
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr);
}

.report-metrics article {
  display: grid;
  gap: 5px;
  padding: 20px;
}

.report-metrics span,
.report-metrics small {
  color: var(--slate-500);
  font-size: 12px;
}

.report-metrics strong {
  font-size: 23px;
}

.report-section,
.pattern-section,
.report-memo {
  overflow: hidden;
}

.report-memo {
  position: relative;
}

.surface-header p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.report-section :deep(.chart-panel) {
  /* scoped CSS 범위를 넘어 재사용 차트 컴포넌트 내부에 여백을 줍니다. */
  padding: 10px 18px 0;
}

.report-chart-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pattern-grid {
  /* 개선된 패턴과 어려운 패턴 카드를 같은 너비로 비교합니다. */
  display: grid;
  gap: 18px;
  padding: 22px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pattern-grid article {
  display: flex;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--slate-200);
  border-radius: 10px;
}

.pattern-grid h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.pattern-grid p {
  margin: 6px 0;
  color: var(--slate-600);
}

.pattern-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 10px;
  font-weight: 900;
}

.pattern-icon--good {
  background: #dcfce7;
  color: #166534;
}

.pattern-icon--warn {
  background: #ffedd5;
  color: #c2410c;
}

.report-memo__content {
  display: grid;
  justify-items: end;
  gap: 12px;
  padding: 22px;
}

.report-memo .textarea {
  width: 100%;
  min-height: 180px;
}

@media print {
  /* 인쇄 시 화면용 최대 너비를 해제하여 종이 폭을 충분히 사용합니다. */
  .report {
    max-width: none;
  }
}
</style>
