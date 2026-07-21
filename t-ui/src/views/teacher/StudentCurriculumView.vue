<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SaveToast from '@/components/common/SaveToast.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import { curriculumItems, recommendedCurriculum as mockRecommendations } from '@/features/teacher/mockData'
import type { RecommendedCurriculumItem } from '@/features/teacher/types'

const selectedItemId = ref(curriculumItems[0]?.id ?? 1)
const editRecommendations = ref(false)
const hasChanges = ref(false)
const recommendations = ref(mockRecommendations.map((item) => ({ ...item })))
const draggedRecommendationId = ref<number>()
const recommendationPendingDeletion = ref<RecommendedCurriculumItem>()
const nextRecommendationId = ref(Math.max(0, ...recommendations.value.map((item) => item.id)) + 1)
const { visible: saved, show: showSaved } = useTemporaryNotice()

const selectedItem = computed(() =>
  curriculumItems.find((item) => item.id === selectedItemId.value),
)
const selectedStatus = computed(() =>
  selectedItem.value ? getAchievementStatus(selectedItem.value.achievement) : '',
)
const selectedRecommendation = computed(() =>
  recommendations.value.find((item) => item.trainingId === selectedItem.value?.id),
)

function getAchievementStatus(achievement: number) {
  if (achievement >= 80) return '충분'
  if (achievement >= 60) return '보완 필요'
  return '우선 학습'
}

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
  hasChanges.value = true
}

function updateCount(item: RecommendedCurriculumItem, amount: number) {
  const nextCount = Math.max(1, item.count + amount)
  if (nextCount === item.count) return
  item.count = nextCount
  hasChanges.value = true
}

function deleteRecommendation() {
  if (!recommendationPendingDeletion.value) return
  recommendations.value = recommendations.value.filter(
    (item) => item.id !== recommendationPendingDeletion.value?.id,
  )
  recommendationPendingDeletion.value = undefined
  hasChanges.value = true
}

function addSelectedTraining() {
  const training = selectedItem.value
  if (!training) return
  const existing = recommendations.value.find((item) => item.trainingId === training.id)
  if (existing) {
    existing.count += 1
    hasChanges.value = true
    return
  }
  recommendations.value.push({
    id: nextRecommendationId.value++,
    trainingId: training.id,
    category: training.category,
    title: training.title,
    count: 1,
  })
  hasChanges.value = true
}

function saveChanges() {
  if (!hasChanges.value) return
  hasChanges.value = false
  editRecommendations.value = false
  showSaved()
}
</script>

<template>
  <div class="curriculum page-stack">
    <PageHeader
      title="커리큘럼 관리"
      description="훈련과 다음 회차 구성을 관리합니다."
    >
      <template #actions>
        <SaveToast
          :visible="saved"
          inline
          message="커리큘럼 변경 사항이 저장되었습니다."
        />
        <button class="button" type="button" :disabled="!hasChanges" @click="saveChanges">
          변경 사항 저장
        </button>
      </template>
    </PageHeader>

    <div class="curriculum-workspace">
      <section class="curriculum-library">
        <header class="section-heading">
          <div>
            <h2>전체 훈련 목록</h2>
          </div>
          <span>{{ curriculumItems.length }}개 훈련</span>
        </header>

        <div class="curriculum-table">
          <div class="curriculum-table__head">
            <span>순서</span><span>카테고리</span><span>훈련명</span><span>달성 상태</span>
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
            <span class="achievement">
              <b>{{ item.achievement }}%</b>
              <small>{{ getAchievementStatus(item.achievement) }}</small>
            </span>
          </button>
        </div>
      </section>

      <aside class="curriculum-panel">
        <section class="selected-training">
          <span class="detail-label">선택한 훈련</span>
          <h2>{{ selectedItem?.title }}</h2>
          <p>{{ selectedItem?.category }} · {{ selectedItem?.order }}단계</p>

          <dl>
            <div><dt>현재 달성률</dt><dd>{{ selectedItem?.achievement }}%</dd></div>
            <div><dt>학습 판단</dt><dd>{{ selectedStatus }}</dd></div>
            <div><dt>권장 시간</dt><dd>15분</dd></div>
          </dl>

          <div class="selected-training__actions">
            <button class="button button--secondary" type="button" @click="addSelectedTraining">
              {{ selectedRecommendation ? '수업 횟수 1회 추가' : '다음 회차에 추가' }}
            </button>
            <span v-if="selectedRecommendation" class="inclusion-note">
              현재 {{ selectedRecommendation.count }}회 포함됨
            </span>
          </div>
        </section>

        <section class="next-session">
          <header class="section-heading next-session__heading">
            <div>
              <div class="title-line">
                <h2>다음 회차 순서</h2>
                <span v-if="hasChanges" class="unsaved-indicator">저장 필요</span>
              </div>
              <p>{{ editRecommendations ? '핸들을 끌어 순서를 바꾸고 횟수를 조절하세요.' : `${recommendations.length}개 훈련이 예정되어 있습니다.` }}</p>
            </div>
            <button class="edit-button" type="button" @click="editRecommendations = !editRecommendations">
              {{ editRecommendations ? '수정 완료' : '수정' }}
            </button>
          </header>

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
              <span
                class="drag-handle"
                :class="{ enabled: editRecommendations }"
                :title="editRecommendations ? '끌어서 순서 변경' : '수정 모드에서 순서 변경'"
                aria-hidden="true"
              ></span>
              <b class="recommendation-order">{{ index + 1 }}</b>
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
            <p v-if="recommendations.length === 0" class="empty-recommendations">선택한 훈련에서 다음 회차에 진행할 훈련을 추가해 주세요.</p>
          </div>
        </section>
      </aside>
    </div>

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
.curriculum { position: relative; gap: 20px; container-type: inline-size; }
.curriculum-workspace { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(390px, .92fr); }
.curriculum-library { min-width: 0; padding: 2px 24px 18px 0; }
.curriculum-panel { min-width: 0; padding: 2px 0 18px 24px; border-left: 1px solid var(--slate-200); }
.section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.section-heading h2 { margin: 0; font-size: 17px; }
.section-heading p { margin: 5px 0 0; color: var(--slate-500); font-size: 12px; }
.section-heading > span { color: var(--slate-500); font-size: 12px; font-weight: 600; }
.curriculum-table { margin-top: 12px; }
.curriculum-table__head,
.curriculum-row { display: grid; align-items: center; gap: 12px; grid-template-columns: 46px 86px minmax(0, 1fr) 94px; }
.curriculum-table__head { padding: 9px 12px; border-bottom: 1px solid var(--slate-300); color: var(--slate-500); font-size: 12px; font-weight: 600; }
.curriculum-row { position: relative; width: 100%; min-height: 54px; padding: 10px 12px; border: 0; border-bottom: 1px solid var(--slate-200); background: transparent; color: var(--slate-700); text-align: left; }
.curriculum-row::before { position: absolute; top: 9px; bottom: 9px; left: 0; width: 3px; background: transparent; content: ''; }
.curriculum-row:hover { background: var(--slate-50); }
.curriculum-row.active::before { background: var(--primary-600); }
.curriculum-row.active strong { color: var(--slate-900); }
.achievement { display: grid; justify-items: end; gap: 1px; }
.achievement b { color: var(--slate-800); font-size: 13px; }
.achievement small { color: var(--slate-500); font-size: 12px; font-weight: 500; }
.selected-training { padding-bottom: 10px; }
.selected-training h2 { margin: 5px 0 0; font-size: 19px; line-height: 1.4; }
.selected-training > p { margin: 5px 0 0; color: var(--slate-500); font-size: 12px; }
.detail-label { color: var(--slate-500); font-size: 12px; font-weight: 600; }
.selected-training dl { display: grid; margin: 17px 0 14px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.selected-training dl > div + div { padding-left: 14px; border-left: 1px solid var(--slate-200); }
.selected-training dt { color: var(--slate-500); font-size: 12px; }
.selected-training dd { margin: 4px 0 0; color: var(--slate-900); font-size: 14px; font-weight: 700; }
.selected-training .button { min-height: 36px; }
.selected-training__actions { display: flex; align-items: center; gap: 10px; }
.inclusion-note { color: var(--slate-500); font-size: 12px; }
.next-session { padding-top: 24px; }
.title-line { display: flex; align-items: center; gap: 9px; }
.unsaved-indicator { color: var(--slate-600); font-size: 12px; font-weight: 700; }
.unsaved-indicator::before { display: inline-block; width: 6px; height: 6px; margin-right: 5px; border-radius: 50%; background: var(--primary-600); content: ''; vertical-align: 1px; }
.edit-button { padding: 5px 0; border: 0; background: transparent; color: var(--primary-700); font-size: 12px; font-weight: 700; }
.recommendation-list { display: grid; margin-top: 10px; }
.recommendation-list article { display: grid; min-height: 58px; align-items: center; gap: 8px; padding: 9px 0; border-bottom: 1px solid var(--slate-200); grid-template-columns: 20px 22px minmax(0, 1fr) auto auto; transition: 150ms ease; }
.recommendation-list article.editable { cursor: grab; }
.recommendation-list article.editable:hover { background: var(--slate-50); }
.recommendation-list article.dragging { opacity: .45; transform: scale(.99); }
.drag-handle { width: 15px; height: 21px; background-image: radial-gradient(circle, var(--slate-300) 1.4px, transparent 1.6px); background-position: 1px 1px; background-size: 6px 6px; }
.drag-handle.enabled { background-image: radial-gradient(circle, var(--slate-600) 1.5px, transparent 1.7px); cursor: grab; }
.recommendation-order { color: var(--slate-500); font-size: 12px; }
.recommendation-copy small,
.recommendation-copy strong { display: block; }
.recommendation-copy small { margin-bottom: 2px; color: var(--slate-500); font-size: 12px; }
.recommendation-copy strong { color: var(--slate-800); font-size: 13px; }
.count-label { color: var(--slate-600); font-size: 12px; font-weight: 700; }
.count-control { display: flex; align-items: center; gap: 6px; }
.count-control button { width: 26px; height: 26px; border: 1px solid var(--slate-300); border-radius: 5px; background: var(--white); color: var(--slate-700); }
.count-control b { min-width: 30px; font-size: 12px; text-align: center; }
.remove-button { width: 26px; height: 26px; border: 0; background: transparent; color: var(--slate-400); font-size: 20px; font-weight: 700; opacity: .52; transition: color 150ms ease, opacity 150ms ease; }
.remove-button:hover,
.remove-button:focus-visible { color: var(--danger-600); opacity: 1; }
.empty-recommendations { margin: 0; padding: 24px 0; color: var(--slate-500); font-size: 12px; text-align: center; }
.curriculum .button:disabled { border-color: var(--slate-200); background: var(--slate-100); box-shadow: none; color: var(--slate-400); cursor: default; opacity: 1; transform: none; }

@container (max-width: 1000px) {
  .curriculum-workspace { grid-template-columns: 1fr; }
  .curriculum-library { padding-right: 0; }
  .curriculum-panel { padding: 28px 0 18px; border-left: 0; }
}
</style>
