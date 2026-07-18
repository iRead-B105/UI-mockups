<script setup lang="ts">
import { computed, ref } from 'vue'
import { curriculumItems, recommendedCurriculum } from '@/features/teacher/mockData'

const selectedItemId = ref(curriculumItems[0]?.id ?? 1)
const editMode = ref(false)
const saved = ref(false)
const items = ref(curriculumItems.map((item) => ({ ...item })))
const selectedItem = computed(() => items.value.find((item) => item.id === selectedItemId.value))

function moveItem(direction: -1 | 1) {
  const index = items.value.findIndex((item) => item.id === selectedItemId.value)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= items.value.length) return
  const next = items.value[nextIndex]
  const current = items.value[index]
  if (!next || !current) return
  items.value[index] = next
  items.value[nextIndex] = current
  items.value.forEach((item, itemIndex) => (item.order = itemIndex + 1))
}
</script>

<template>
  <div class="curriculum page-stack">
    <header class="page-heading">
      <div>
        <h1>커리큘럼 관리</h1>
        <p>현재 훈련 순서를 확인하고 다음 회차 추천안을 편집합니다.</p>
      </div>
      <button class="button" type="button" @click="editMode = !editMode">
        {{ editMode ? '편집 완료' : '순서 편집' }}
      </button>
    </header>

    <div v-if="saved" class="status-message">
      커리큘럼 변경 사항이 목업 데이터에 저장되었습니다.
    </div>

    <div class="curriculum-grid">
      <section class="surface current-list">
        <div class="surface-header">
          <div>
            <h2>전체 훈련 목록</h2>
            <p>항목을 선택하면 상세 정보를 확인할 수 있습니다.</p>
          </div>
          <span>{{ items.length }}개</span>
        </div>
        <div class="curriculum-table">
          <div class="curriculum-table__head">
            <span>순서</span><span>카테고리</span><span>훈련명</span><span>달성률</span>
          </div>
          <button
            v-for="item in items"
            :key="item.id"
            class="curriculum-row"
            :class="{ active: item.id === selectedItemId }"
            type="button"
            @click="selectedItemId = item.id"
          >
            <b>{{ item.order }}</b>
            <span>{{ item.category }}</span>
            <strong>{{ item.title }}</strong>
            <span class="achievement">{{ item.achievement }}%</span>
          </button>
        </div>
        <div v-if="editMode" class="reorder-actions">
          <button
            class="button button--secondary button--small"
            type="button"
            @click="moveItem(-1)"
          >
            ↑ 위로
          </button>
          <button class="button button--secondary button--small" type="button" @click="moveItem(1)">
            ↓ 아래로
          </button>
        </div>
      </section>

      <section class="surface recommendations">
        <div class="surface-header">
          <div>
            <h2>다음 회차 추천 커리큘럼</h2>
            <p>최근 성취도를 기준으로 구성한 추천안입니다.</p>
          </div>
          <span class="ai-label">AI 추천</span>
        </div>
        <div class="recommendation-list">
          <article v-for="(item, index) in recommendedCurriculum" :key="item">
            <span>{{ index + 1 }}</span>
            <div>
              <small>{{ index < 2 ? '파닉스' : index === 2 ? '유창성' : '이해력' }}</small>
              <strong>{{ item }}</strong>
            </div>
            <button type="button" aria-label="추천 항목 제거">×</button>
          </article>
        </div>
        <button class="add-training" type="button">＋ 훈련 추가</button>
      </section>
    </div>

    <section class="surface curriculum-detail">
      <div>
        <span class="detail-label">선택한 훈련</span>
        <h2>{{ selectedItem?.title }}</h2>
        <p>학생이 혼동하기 쉬운 받침 소리를 낱말과 짧은 문장으로 반복 연습합니다.</p>
      </div>
      <dl>
        <div>
          <dt>카테고리</dt>
          <dd>{{ selectedItem?.category }}</dd>
        </div>
        <div>
          <dt>현재 달성률</dt>
          <dd>{{ selectedItem?.achievement }}%</dd>
        </div>
        <div>
          <dt>권장 학습 시간</dt>
          <dd>15분</dd>
        </div>
      </dl>
      <button class="button" type="button" @click="saved = true">커리큘럼 저장</button>
    </section>
  </div>
</template>

<style scoped>
.curriculum-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
}

.surface-header p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}

.surface-header > span {
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
}

.curriculum-table {
  padding: 10px 18px 18px;
}

.curriculum-table__head,
.curriculum-row {
  display: grid;
  align-items: center;
  gap: 12px;
  grid-template-columns: 52px 86px 1fr 64px;
}

.curriculum-table__head {
  padding: 10px 12px;
  color: var(--slate-500);
  font-size: 12px;
  font-weight: 700;
}

.curriculum-row {
  width: 100%;
  margin-bottom: 8px;
  padding: 14px 12px;
  border: 1px solid var(--slate-200);
  border-radius: 9px;
  background: var(--white);
  color: var(--slate-700);
  text-align: left;
}

.curriculum-row:hover,
.curriculum-row.active {
  border-color: var(--primary-500);
  background: var(--primary-50);
}

.achievement {
  color: var(--primary-700);
  font-weight: 800;
  text-align: right;
}

.reorder-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 18px 18px;
}

.ai-label {
  padding: 6px 9px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e !important;
}

.recommendation-list {
  display: grid;
  gap: 10px;
  padding: 18px;
}

.recommendation-list article {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid var(--slate-200);
  border-radius: 10px;
  grid-template-columns: 32px 1fr 28px;
}

.recommendation-list article > span {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 9px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 800;
}

.recommendation-list small,
.recommendation-list strong {
  display: block;
}

.recommendation-list small {
  margin-bottom: 3px;
  color: var(--slate-500);
}

.recommendation-list button {
  border: 0;
  background: transparent;
  color: var(--slate-400);
  font-size: 20px;
}

.add-training {
  width: calc(100% - 36px);
  height: 40px;
  margin: 0 18px 18px;
  border: 1px dashed var(--primary-500);
  border-radius: 9px;
  background: var(--primary-50);
  color: var(--primary-700);
  font-weight: 700;
}

.curriculum-detail {
  display: grid;
  align-items: center;
  gap: 30px;
  padding: 24px;
  grid-template-columns: 1fr auto auto;
}

.curriculum-detail h2 {
  margin: 6px 0;
  font-size: 18px;
}

.curriculum-detail p {
  margin: 0;
  color: var(--slate-500);
}

.detail-label {
  color: var(--primary-600);
  font-size: 12px;
  font-weight: 800;
}

.curriculum-detail dl {
  display: flex;
  margin: 0;
  gap: 22px;
}

.curriculum-detail dt {
  color: var(--slate-500);
  font-size: 11px;
}

.curriculum-detail dd {
  margin: 3px 0 0;
  font-weight: 800;
}
</style>
