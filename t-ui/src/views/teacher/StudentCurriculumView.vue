<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import { curriculumItems, recommendedCurriculum as mockRecommendations } from '@/features/teacher/mockData'
import type { RecommendedCurriculumItem } from '@/features/teacher/types'

const selectedItemId = ref(curriculumItems[0]?.id ?? 1)
const editRecommendations = ref(false)
const recommendations = ref(mockRecommendations.map((item) => ({ ...item })))
const draggedRecommendationId = ref<number>()
const recommendationPendingDeletion = ref<RecommendedCurriculumItem>()
const nextRecommendationId = ref(Math.max(0, ...recommendations.value.map((item) => item.id)) + 1)
const { visible: saved, show: showSaved } = useTemporaryNotice()

const selectedItem = computed(() =>
  curriculumItems.find((item) => item.id === selectedItemId.value),
)

function startDragging(id: number) {
  if (editRecommendations.value) draggedRecommendationId.value = id
}

function dropRecommendation(targetId: number) {
  const draggedId = draggedRecommendationId.value
  if (!editRecommendations.value || draggedId === undefined || draggedId === targetId) return
  const from = recommendations.value.findIndex((item) => item.id === draggedId)
  const to = recommendations.value.findIndex((item) => item.id === targetId)
  if (from < 0 || to < 0) return
  const [moved] = recommendations.value.splice(from, 1)
  if (moved) recommendations.value.splice(to, 0, moved)
  draggedRecommendationId.value = undefined
}

function updateCount(item: RecommendedCurriculumItem, amount: number) {
  item.count = Math.max(1, item.count + amount)
}

function deleteRecommendation() {
  if (!recommendationPendingDeletion.value) return
  recommendations.value = recommendations.value.filter(
    (item) => item.id !== recommendationPendingDeletion.value?.id,
  )
  recommendationPendingDeletion.value = undefined
}

function addSelectedTraining() {
  const training = selectedItem.value
  if (!training) return
  const existing = recommendations.value.find((item) => item.trainingId === training.id)
  if (existing) {
    existing.count += 1
    return
  }
  recommendations.value.push({
    id: nextRecommendationId.value++,
    trainingId: training.id,
    category: training.category,
    title: training.title,
    count: 1,
  })
}
</script>

<template>
  <div class="curriculum page-stack">
    <SaveToast :visible="saved" message="커리큘럼 변경 사항이 저장되었습니다." />
    <header class="page-heading">
      <div>
        <h1>커리큘럼 관리</h1>
        <p>쉬운 단계부터 전체 훈련을 확인하고 다음 회차 구성을 관리합니다.</p>
      </div>
      <button class="button" type="button" @click="showSaved">변경 사항 저장</button>
    </header>

    <div class="curriculum-grid">
      <section class="surface current-list">
        <div class="surface-header">
          <div>
            <h2>전체 훈련 목록</h2>
            <p>음운 인식부터 이해력까지 쉬운 순서로 나열했습니다.</p>
          </div>
          <span>{{ curriculumItems.length }}개</span>
        </div>
        <div class="curriculum-table">
          <div class="curriculum-table__head">
            <span>순서</span><span>카테고리</span><span>훈련명</span><span>달성률</span>
          </div>
          <button
            v-for="item in curriculumItems"
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
      </section>

      <section class="surface recommendations">
        <div class="surface-header">
          <div>
            <h2>다음 회차 추천 커리큘럼</h2>
            <p>{{ editRecommendations ? '끌어서 순서를 바꾸고 시행 횟수를 조절하세요.' : '다음 회차에 진행할 훈련 순서입니다.' }}</p>
          </div>
          <button class="edit-button" type="button" @click="editRecommendations = !editRecommendations">
            {{ editRecommendations ? '수정 완료' : '수정' }}
          </button>
        </div>

        <div class="recommendation-list">
          <article
            v-for="(item, index) in recommendations"
            :key="item.id"
            :draggable="editRecommendations"
            :class="{ editable: editRecommendations, dragging: draggedRecommendationId === item.id }"
            @dragstart="startDragging(item.id)"
            @dragend="draggedRecommendationId = undefined"
            @dragover.prevent
            @drop="dropRecommendation(item.id)"
          >
            <span class="drag-handle" :aria-hidden="!editRecommendations">{{ editRecommendations ? '⋮⋮' : index + 1 }}</span>
            <div class="recommendation-copy">
              <small>{{ item.category }}</small>
              <strong>{{ item.title }}</strong>
            </div>
            <div v-if="editRecommendations" class="count-control" aria-label="시행 횟수 조절">
              <button type="button" aria-label="횟수 줄이기" @click="updateCount(item, -1)">−</button>
              <b>{{ item.count }}회</b>
              <button type="button" aria-label="횟수 늘리기" @click="updateCount(item, 1)">＋</button>
            </div>
            <span v-else class="count-label">{{ item.count }}회</span>
            <button
              v-if="editRecommendations"
              class="remove-button"
              type="button"
              :aria-label="`${item.title} 삭제`"
              @click="recommendationPendingDeletion = item"
            >×</button>
          </article>
          <p v-if="recommendations.length === 0" class="empty-recommendations">선택한 훈련에서 다음 회차 훈련을 추가해 주세요.</p>
        </div>
      </section>
    </div>

    <section class="surface curriculum-detail">
      <div>
        <span class="detail-label">선택한 훈련</span>
        <h2>{{ selectedItem?.title }}</h2>
      </div>
      <dl>
        <div><dt>카테고리</dt><dd>{{ selectedItem?.category }}</dd></div>
        <div><dt>현재 달성률</dt><dd>{{ selectedItem?.achievement }}%</dd></div>
        <div><dt>권장 학습 시간</dt><dd>15분</dd></div>
      </dl>
      <button class="button" type="button" @click="addSelectedTraining">훈련 추가</button>
    </section>

    <ConfirmDialog
      :open="Boolean(recommendationPendingDeletion)"
      title="추천 커리큘럼에서 삭제할까요?"
      :message="`${recommendationPendingDeletion?.title ?? ''} 훈련을 다음 회차에서 제거합니다.`"
      confirm-label="훈련 삭제"
      @cancel="recommendationPendingDeletion = undefined"
      @confirm="deleteRecommendation"
    />
  </div>
</template>

<style scoped>
.curriculum { position: relative; }
.curriculum-grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1.05fr) minmax(460px, .95fr); }
.surface-header p { margin: 4px 0 0; color: var(--slate-500); font-size: 12px; }
.surface-header > span { color: var(--slate-500); font-size: 12px; font-weight: 700; }
.curriculum-table { max-height: 610px; padding: 10px 18px 18px; overflow-y: auto; }
.curriculum-table__head,
.curriculum-row { display: grid; align-items: center; gap: 12px; grid-template-columns: 52px 90px 1fr 64px; }
.curriculum-table__head { padding: 10px 12px; color: var(--slate-500); font-size: 12px; font-weight: 700; }
.curriculum-row { width: 100%; margin-bottom: 8px; padding: 13px 12px; border: 1px solid var(--slate-200); border-radius: 9px; background: var(--white); color: var(--slate-700); text-align: left; }
.curriculum-row:hover,
.curriculum-row.active { border-color: var(--primary-500); background: var(--primary-50); }
.achievement { color: var(--primary-700); font-weight: 800; text-align: right; }
.edit-button { min-width: 82px; height: 36px; border: 1px solid var(--primary-500); border-radius: 8px; background: var(--primary-50); color: var(--primary-700); font-weight: 800; }
.recommendation-list { display: grid; gap: 10px; padding: 18px; }
.recommendation-list article { display: grid; min-height: 72px; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--slate-200); border-radius: 10px; grid-template-columns: 32px 1fr auto auto; transition: 150ms ease; }
.recommendation-list article.editable { cursor: grab; }
.recommendation-list article.editable:hover { border-color: var(--primary-300, #a5b4fc); }
.recommendation-list article.dragging { opacity: .45; transform: scale(.99); }
.drag-handle { display: grid; width: 30px; height: 30px; border-radius: 9px; background: var(--primary-50); color: var(--primary-700); font-weight: 800; place-items: center; }
.recommendation-copy small,
.recommendation-copy strong { display: block; }
.recommendation-copy small { margin-bottom: 2px; color: var(--slate-500); }
.count-label { color: var(--slate-600); font-size: 12px; font-weight: 800; }
.count-control { display: flex; align-items: center; gap: 6px; }
.count-control button { width: 28px; height: 28px; border: 1px solid var(--slate-300); border-radius: 7px; background: var(--white); color: var(--slate-700); }
.count-control b { min-width: 30px; font-size: 12px; text-align: center; }
.remove-button { width: 30px; height: 30px; border: 0; background: transparent; color: var(--danger-600); font-size: 24px; font-weight: 800; }
.empty-recommendations { margin: 8px 0; padding: 30px; border: 1px dashed var(--slate-300); border-radius: 10px; color: var(--slate-500); text-align: center; }
.curriculum-detail { display: grid; align-items: center; gap: 30px; padding: 24px; grid-template-columns: 1fr auto auto; }
.curriculum-detail h2 { margin: 6px 0 0; font-size: 18px; }
.detail-label { color: var(--primary-600); font-size: 12px; font-weight: 800; }
.curriculum-detail dl { display: flex; margin: 0; gap: 22px; }
.curriculum-detail dt { color: var(--slate-500); font-size: 11px; }
.curriculum-detail dd { margin: 3px 0 0; font-weight: 800; }
</style>
