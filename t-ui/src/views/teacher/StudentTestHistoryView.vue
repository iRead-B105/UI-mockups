<script setup lang="ts">
// 검사 날짜를 고르고 두 검사 결과를 비교하며 내부 검사 해석 메모를 기록하는 화면입니다.
import { computed, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import HistoryToolbar from '@/components/teacher/HistoryToolbar.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'

// 입력 요소와 연결할 값은 ref로 만들어 변경 사항이 화면에 즉시 반영되게 합니다.
const testDate = ref('2026-07-14')
const comparison = ref('2026-06-21')
const secondaryComparison = ref('2026-05-30')
const comparisonCount = ref(1)
const teacherComment = ref(
  '김OO 학생은 읽기 정확도와 시선 유지 시간이 향상되었습니다. 낯선 낱말의 첫소리를 추론하는 연습을 다음 커리큘럼에 포함해 주세요.',
)
const { visible: commentSaved, show: showCommentSaved } = useTemporaryNotice()

// computed를 사용해 관련 값이 바뀔 때 차트 설정도 다시 만들 수 있게 합니다.
const testChart = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis', valueFormatter: (value) => `${value}점` },
  legend: {
    data: [
      '선택 검사',
      '비교 검사',
      ...(comparisonCount.value > 1 ? ['추가 비교'] : []),
      '검사 평균',
    ],
    top: 4,
  },
  grid: { left: 52, right: 24, top: 50, bottom: 52 },
  xAxis: {
    type: 'category',
    data: ['시선 고정', '시선 도약', '읽기 속도', '정답률', '풀이 속도', '유창성'],
    axisLabel: { interval: 0, rotate: 16 },
  },
  yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}점' } },
  series: [
    {
      name: '선택 검사',
      type: 'bar',
      data: [18, 28, 65, 54, 24, 76],
      itemStyle: { color: '#4f46e5' },
    },
    {
      name: '비교 검사',
      type: 'bar',
      data: [35, 46, 48, 68, 50, 58],
      itemStyle: { color: '#cbd5e1' },
    },
    ...(comparisonCount.value > 1
      ? [{
          name: '추가 비교',
          type: 'bar' as const,
          data: [42, 51, 44, 61, 55, 52],
          itemStyle: { color: '#e2e8f0' },
        }]
      : []),
    {
      name: '검사 평균',
      type: 'line',
      smooth: false,
      data: [28, 39, 56, 61, 42, 66],
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#f59e0b', width: 2 },
      itemStyle: { color: '#f59e0b' },
      z: 5,
    },
  ],
}))
</script>

<template>
  <div class="test-history page-stack">
    <PageHeader
      title="테스트 이력"
      description="검사 결과를 비교하고 교수자용 해석 메모를 기록합니다."
    />

    <HistoryToolbar>
      <div class="field date-field">
        <label for="test-date">선택 검사</label>
        <input id="test-date" v-model="testDate" class="input" type="date" />
      </div>
      <div class="field date-field">
        <label for="comparison-date">비교 검사 1</label>
        <input id="comparison-date" v-model="comparison" class="input" type="date" />
      </div>
      <div v-if="comparisonCount > 1" class="field date-field">
        <label for="comparison-date-2">비교 검사 2</label>
        <input id="comparison-date-2" v-model="secondaryComparison" class="input" type="date" />
      </div>
      <button
        class="button button--secondary add-comparison"
        type="button"
        :disabled="comparisonCount >= 2"
        @click="comparisonCount++"
      >
        비교 검사 추가
      </button>
      <template #status>선택 검사 1건 · 비교 기준 {{ comparisonCount }}건</template>
    </HistoryToolbar>

    <div class="test-results">
      <section class="result-chart">
        <header class="section-heading">
          <div>
            <h2>영역별 환산 점수</h2>
            <p>100점 기준으로 환산한 비교 결과입니다.</p>
          </div>
        </header>
        <ChartPanel :option="testChart" height="320px" aria-label="영역별 검사 결과 비교 차트" />
      </section>

      <aside class="result-summary">
        <header class="summary-heading">
          <span>선택 검사 종합</span>
          <div><strong>76점</strong><small>이전 검사 대비 +12점</small></div>
        </header>
        <dl>
          <div>
            <dt>강점 영역</dt>
            <dd>유창성 · 정확도</dd>
          </div>
          <div>
            <dt>보완 영역</dt>
            <dd>시선 도약 · 풀이 속도</dd>
          </div>
          <div>
            <dt>권장 과정</dt>
            <dd>파닉스 심화 · 2단계</dd>
          </div>
          <div>
            <dt>다음 검사</dt>
            <dd>4주 후 권장</dd>
          </div>
        </dl>
      </aside>
    </div>

    <section class="teacher-comment">
      <header class="section-heading">
          <div>
            <h2>검사 해석 메모</h2>
            <p>공개 범위 · 교수자만 확인</p>
          </div>
        <div class="comment-actions">
          <SaveToast :visible="commentSaved" inline message="검사 해석 메모가 저장되었습니다." />
          <button class="button" type="button" @click="showCommentSaved">메모 저장</button>
        </div>
      </header>
      <textarea v-model="teacherComment" class="textarea" aria-label="교수자 내부 검사 해석 메모"></textarea>
    </section>
  </div>
</template>

<style scoped>
.test-history { gap: 18px; container-type: inline-size; }
.date-field { width: 166px; }
.add-comparison { min-height: 40px; }
.add-comparison:disabled { border-color: var(--slate-200); background: var(--slate-100); color: var(--slate-400); cursor: default; opacity: 1; transform: none; }
.test-results { display: grid; grid-template-columns: minmax(0, 1fr) 310px; }
.result-chart { min-width: 0; padding: 2px 24px 14px 0; }
.result-summary { min-width: 0; padding: 2px 0 14px 24px; border-left: 1px solid var(--slate-200); }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.section-heading h2 { margin: 0; font-size: 17px; }
.section-heading p { margin: 5px 0 0; color: var(--slate-500); font-size: 12px; }
.result-chart :deep(.chart-panel) { padding-top: 2px; }
.summary-heading { padding-bottom: 8px; }
.summary-heading > span { color: var(--slate-500); font-size: 12px; font-weight: 600; }
.summary-heading > div { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 6px; }
.summary-heading strong { color: var(--slate-900); font-size: 28px; }
.summary-heading small { color: var(--slate-600); font-size: 12px; font-weight: 600; }
.result-summary dl { display: grid; gap: 18px; margin: 16px 0 0; }
.result-summary dl > div { padding: 0; }
.result-summary dt { color: var(--slate-500); font-size: 12px; }
.result-summary dd { margin: 5px 0 0; color: var(--slate-800); font-size: 13px; font-weight: 700; }
.teacher-comment { display: grid; gap: 13px; }
.comment-actions { display: flex; align-items: center; gap: 8px; }
.teacher-comment .textarea { min-height: 108px; }

@container (max-width: 1000px) {
  .test-results { grid-template-columns: 1fr; }
  .result-chart { padding-right: 0; }
  .result-summary { display: grid; align-items: start; gap: 44px; padding: 28px 0 14px; border-left: 0; grid-template-columns: 220px minmax(0, 1fr); }
  .summary-heading > div { display: grid; justify-items: start; }
  .result-summary dl { margin: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@container (max-width: 720px) {
  .result-summary { gap: 24px; grid-template-columns: 1fr; }
  .result-summary dl { grid-template-columns: 1fr; }
}
</style>
