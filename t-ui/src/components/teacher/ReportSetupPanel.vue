<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  studentName: string
  startDate: string
  endDate: string
}>()

const emit = defineEmits<{
  'update:startDate': [value: string]
  'update:endDate': [value: string]
  generate: []
}>()

const invalidPeriod = computed(
  () => !props.startDate || !props.endDate || props.startDate > props.endDate,
)

const reportSections = [
  { title: '학습 요약', description: '시간, 완료율, 정확도, 출석' },
  { title: '영역별 변화', description: '정확도·유창성과 영역별 점수' },
  { title: '최근 훈련', description: '단계, 결과, 확인 필요 항목' },
  { title: '교수자 의견', description: '보호자에게 전달할 학습 결과와 다음 지도 계획' },
]
</script>

<template>
  <section class="report-setup" aria-labelledby="report-setup-title">
    <header class="report-setup__header">
      <div>
        <h2 id="report-setup-title">보고서 설정</h2>
        <p>{{ studentName }} 학생의 조회 기간을 정해 보고서를 만듭니다.</p>
      </div>
    </header>

    <div class="report-setup__body">
      <div class="report-period">
        <h3>조회 기간</h3>
        <div class="report-period__fields">
          <div class="field">
            <label for="report-start-date">시작일</label>
            <input
              id="report-start-date"
              class="input"
              type="date"
              :value="startDate"
              @input="emit('update:startDate', ($event.target as HTMLInputElement).value)"
            />
          </div>
          <span aria-hidden="true">—</span>
          <div class="field">
            <label for="report-end-date">종료일</label>
            <input
              id="report-end-date"
              class="input"
              type="date"
              :value="endDate"
              @input="emit('update:endDate', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
        <p v-if="invalidPeriod" class="report-period__error">
          종료일은 시작일과 같거나 이후여야 합니다.
        </p>
      </div>

      <div class="report-contents">
        <h3>포함되는 내용</h3>
        <ul>
          <li v-for="section in reportSections" :key="section.title">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>{{ section.title }}</strong>
              <small>{{ section.description }}</small>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <footer class="report-setup__footer">
      <button class="button" type="button" :disabled="invalidPeriod" @click="emit('generate')">
        보고서 생성
      </button>
    </footer>
  </section>
</template>

<style scoped>
.report-setup__header,
.report-setup__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 20px;
}

.report-setup__header h2,
.report-setup__body h3 {
  margin: 0;
  color: var(--slate-950);
}

.report-setup__header h2 {
  font-size: 17px;
}

.report-setup__header p,
.report-setup__footer p {
  margin: 3px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.report-setup__body {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
}

.report-period,
.report-contents {
  padding: 22px 20px 24px;
}

.report-period {
  border-right: 1px solid var(--slate-200);
}

.report-setup__body h3 {
  margin-bottom: 15px;
  font-size: 13px;
}

.report-period__fields {
  display: grid;
  align-items: end;
  gap: 10px;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

.report-period__fields > span {
  padding-bottom: 10px;
  color: var(--slate-400);
}

.report-period__error {
  margin: 8px 0 0;
  color: var(--danger-600);
  font-size: 11px;
}

.report-contents ul {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  gap: 13px 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.report-contents li {
  display: grid;
  align-items: start;
  gap: 9px;
  grid-template-columns: 16px minmax(0, 1fr);
}

.report-contents li > span {
  padding-top: 1px;
  color: var(--primary-600);
  font-size: 11px;
  font-weight: 800;
}

.report-contents li div {
  display: grid;
  gap: 1px;
}

.report-contents strong {
  color: var(--slate-700);
  font-size: 13px;
}

.report-contents small {
  color: var(--slate-500);
  font-size: 12px;
  line-height: 1.45;
}

.report-setup__footer {
  justify-content: flex-end;
}

.report-setup__footer .button:disabled {
  border-color: var(--slate-200);
  background: var(--slate-100);
  color: var(--slate-400);
  cursor: default;
  transform: none;
}

@media (max-width: 1080px) {
  .report-setup__body {
    grid-template-columns: 1fr;
  }

  .report-period {
    border-right: 0;
  }
}
</style>
