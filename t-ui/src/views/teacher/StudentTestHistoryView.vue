<script setup lang="ts">
// 검사 날짜를 고르고 두 검사 결과를 비교하며 교수자 의견을 기록하는 화면입니다.
import { computed, ref } from 'vue'
import type { EChartsOption } from 'echarts'
import ChartPanel from '@/components/common/ChartPanel.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'

// 입력 요소와 연결할 값은 ref로 만들어 변경 사항이 화면에 즉시 반영되게 합니다.
const testDate = ref('2026-07-14')
const comparison = ref('2026-06-21')
const comparisonCount = ref(1)
const teacherComment = ref(
  '김OO 학생은 읽기 정확도와 시선 유지 시간이 향상되었습니다. 낯선 낱말의 첫소리를 추론하는 연습을 다음 커리큘럼에 포함해 주세요.',
)
const { visible: commentSaved, show: showCommentSaved } = useTemporaryNotice()

// computed를 사용해 관련 값이 바뀔 때 차트 설정도 다시 만들 수 있게 합니다.
const testChart = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['선택 검사', '비교 검사', '검사 평균'], top: 8 },
  grid: { left: 52, right: 30, top: 56, bottom: 56 },
  xAxis: {
    type: 'category',
    data: ['고정 횟수', '도약 횟수', '전체 읽기 시간', '문제 정답률', '문제 풀이시간', '유창성'],
    axisLabel: { interval: 0, rotate: 18 },
  },
  yAxis: { type: 'value', max: 100 },
  // 두 막대 묶음이 같은 검사 항목에서 나란히 비교됩니다.
  series: [
    {
      name: '선택 검사',
      type: 'bar',
      data: [18, 28, 65, 54, 24, 76],
      itemStyle: { color: '#4f46e5', borderRadius: [6, 6, 0, 0] },
    },
    {
      name: '비교 검사',
      type: 'bar',
      data: [35, 46, 48, 68, 50, 58],
      itemStyle: { color: '#cbd5e1', borderRadius: [6, 6, 0, 0] },
    },
    {
      name: '검사 평균',
      type: 'line',
      smooth: false,
      data: [28, 39, 56, 61, 42, 66],
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#f59e0b', width: 3 },
      itemStyle: { color: '#f59e0b' },
      z: 5,
    },
  ],
}))
</script>

<template>
  <!-- page-stack은 각 카드 사이에 공통 세로 간격을 적용합니다. -->
  <div class="test-history page-stack">
    <header class="page-heading">
      <div>
        <h1>테스트 이력</h1>
        <p>검사 결과를 이전 검사와 비교하고 교수자 의견을 기록합니다.</p>
      </div>
    </header>

    <section class="surface test-controls">
      <div class="field">
        <label for="test-date">검사 날짜</label
        ><input id="test-date" v-model="testDate" class="input" type="date" />
      </div>
      <div class="field">
        <label for="comparison-date">비교 검사</label
        ><input id="comparison-date" v-model="comparison" class="input" type="date" />
      </div>
      <!-- Math.min으로 비교 개수가 최대 2를 넘지 않도록 제한합니다. -->
      <button
        class="button button--secondary"
        type="button"
        @click="comparisonCount = Math.min(2, comparisonCount + 1)"
      >
        ＋ 비교 검사 추가
      </button>
      <span>현재 {{ comparisonCount }}개 검사 비교 중</span>
    </section>

    <div class="test-grid">
      <section class="surface result-chart">
        <div class="surface-header">
          <div>
            <h2>영역별 검사 결과</h2>
            <p>선택한 검사와 이전 검사의 점수 비교</p>
          </div>
          <span class="score-badge">종합 76점</span>
        </div>
        <!-- 계산된 설정 객체를 공통 차트 컴포넌트에 전달합니다. -->
        <ChartPanel :option="testChart" height="420px" aria-label="영역별 검사 결과 비교 차트" />
      </section>

      <aside class="surface result-summary">
        <div class="surface-header"><h2>검사 요약</h2></div>
        <div class="summary-score">
          <strong>76</strong><span>/ 100점</span>
          <p>이전 검사보다 12점 상승</p>
        </div>
        <dl>
          <div>
            <dt>강점 영역</dt>
            <dd>유창성 · 정확도</dd>
          </div>
          <div>
            <dt>보완 영역</dt>
            <dd>도약 횟수 · 풀이 시간</dd>
          </div>
          <div>
            <dt>권장 과정</dt>
            <dd>파닉스 심화 2단계</dd>
          </div>
        </dl>
      </aside>
    </div>

    <section class="surface teacher-comment">
      <SaveToast :visible="commentSaved" message="교수자 의견이 저장되었습니다." />
      <div class="surface-header">
        <div>
          <h2>교수자 의견</h2>
          <p>검사 결과와 다음 학습 방향을 기록하세요.</p>
        </div>
      </div>
      <div>
        <textarea v-model="teacherComment" class="textarea"></textarea
        ><button class="button" type="button" @click="showCommentSaved">저장</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.test-controls {
  /* 날짜 입력, 버튼, 상태 문구를 한 줄 아래쪽 기준으로 정렬합니다. */
  display: flex;
  align-items: end;
  gap: 16px;
  padding: 18px 20px;
}

.test-controls .field {
  width: 180px;
}

.test-controls > span {
  /* margin-left:auto로 상태 문구를 오른쪽으로 보냅니다. */
  align-self: center;
  margin-left: auto;
  color: var(--slate-500);
  font-size: 12px;
}

.test-grid {
  /* 넓은 차트와 300px 요약 카드를 좌우로 배치합니다. */
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 300px;
}

.result-chart,
.result-summary {
  overflow: hidden;
}

.surface-header p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.score-badge {
  padding: 7px 11px;
  border-radius: 999px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-size: 12px;
  font-weight: 800;
}

.result-chart :deep(.chart-panel) {
  /* 자식 ChartPanel의 scoped 영역 안쪽까지 들어가 여백을 지정합니다. */
  padding: 8px 18px 0;
}

.summary-score {
  padding: 26px 22px;
  border-bottom: 1px solid var(--slate-200);
  text-align: center;
}

.summary-score strong {
  color: var(--primary-600);
  font-size: 46px;
}

.summary-score span {
  color: var(--slate-500);
}

.summary-score p {
  margin: 4px 0 0;
  color: var(--success-600);
  font-size: 12px;
  font-weight: 700;
}

.result-summary dl {
  display: grid;
  margin: 0;
  padding: 18px 22px 24px;
  gap: 16px;
}

.result-summary dt {
  margin-bottom: 4px;
  color: var(--slate-500);
  font-size: 11px;
}

.result-summary dd {
  margin: 0;
  font-weight: 700;
}

.teacher-comment > div:last-child {
  display: grid;
  justify-items: end;
  gap: 12px;
  padding: 20px;
}

.teacher-comment {
  position: relative;
}
</style>
