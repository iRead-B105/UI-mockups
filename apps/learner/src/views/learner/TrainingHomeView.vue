<script setup lang="ts">
// 훈련 선택 홈: 3개 대분류 카드 + 세부 훈련 모달
// 메인 제목/부제는 기획서에 지정된 문구를 그대로 사용합니다.
// 서브메뉴는 기존 모달 패턴(TrainingLessonModal)으로 띄우며,
// 모달의 열림 여부는 라우트 파라미터(:categoryId)로 제어합니다.

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  findTrainingDisplayLessonInCategory,
  getAllTrainingDisplayCategories,
  getTrainingDisplayCategoryById,
} from '@/mocks/trainingDisplayCatalog'
import TrainingCategoryCard from '@/components/training/TrainingCategoryCard.vue'
import TrainingLessonModal from '@/components/training/TrainingLessonModal.vue'
import RiveGuideCharacter from '@/components/RiveGuideCharacter.vue'

const route = useRoute()
const router = useRouter()

const categories = getAllTrainingDisplayCategories()

// 라우트 파라미터로 선택된 카테고리(없으면 목록 상태)
const activeCategoryId = computed(() => {
  const raw = route.params.categoryId
  return typeof raw === 'string' ? raw : ''
})
const activeCategory = computed(() =>
  activeCategoryId.value
    ? getTrainingDisplayCategoryById(activeCategoryId.value)
    : null,
)
const isModalOpen = computed(() => activeCategory.value !== null)

const handleCategorySelect = (categoryId: string) => {
  // 대분류 선택 → 해당 카테고리 서브메뉴 모달(라우트 이동)
  void router.push({ name: 'training-category', params: { categoryId } })
}

const handleLessonSelect = (lessonId: string) => {
  if (!activeCategoryId.value) return
  const lesson = findTrainingDisplayLessonInCategory(activeCategoryId.value, lessonId)
  if (!lesson) return
  // 준비된 레슨 선택 → 레슨 화면(인트로)으로 이동
  void router.push({
    name: 'training-lesson',
    // 평가·기록과 연결되는 기존 카테고리 ID는 변경하지 않습니다.
    params: { categoryId: lesson.categoryId, lessonId },
  })
}

const handleCloseModal = () => {
  void router.push({ name: 'training-home' })
}
</script>

<template>
  <main class="training-home">
    <section class="home-content">
      <header class="home-heading">
        <h1 class="home-title">어떤 훈련을 해볼까요?</h1>
        <p class="home-subtitle">하고 싶은 훈련을 골라보세요.</p>
      </header>

      <div class="category-grid">
        <TrainingCategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @select="handleCategorySelect"
        />
      </div>
    </section>

    <TrainingLessonModal
      :open="isModalOpen"
      :category="activeCategory"
      @select="handleLessonSelect"
      @close="handleCloseModal"
    />

    <!-- 메인 섬 화면의 토끼가 훈련 선택 화면에도 함께 응원 -->
    <RiveGuideCharacter message="어떤 훈련부터\n해볼까?" />
  </main>
</template>

<style scoped>
.training-home {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: var(--learner-space-8) var(--learner-page-padding) var(--learner-space-12);
  background-color: #22c5ed;
  background-image: url('../../assets/backgrounds/training-outer-background-flat-vector.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.home-content {
  width: min(100%, var(--learner-content-width));
  max-width: var(--learner-content-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--learner-space-10);
  padding: clamp(28px, 4vw, 56px);
  border: 4px solid rgb(255 255 255 / 88%);
  border-radius: 36px;
  background-color: #fff9dc;
  background-image: url('../../assets/backgrounds/training-inner-background-flat-vector.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0 16px 36px rgb(44 91 119 / 20%);
}

.home-heading {
  text-align: center;
}
.home-title {
  margin: 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-page-title-fluid);
  font-weight: var(--learner-font-weight-heavy);
  color: var(--learner-color-text);
  line-height: 1.15;
}
.home-subtitle {
  margin: var(--learner-space-3) 0 0;
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body-large);
  font-weight: var(--learner-font-weight-bold);
  color: var(--learner-color-text-soft);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--learner-space-6);
}

@media (max-width: 1100px) {
  .category-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .category-grid { grid-template-columns: 1fr; }
  .home-content { padding: 24px 18px; }
}
</style>
