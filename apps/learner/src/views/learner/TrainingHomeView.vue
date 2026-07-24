<script setup lang="ts">
// 아동용 기본 화면은 서버가 내려줄 순차 커리큘럼을 지그재그 경로로 표시합니다.
// 현재는 플레이 가능한 소분류 10개와 진행 상태를 목업으로 구성합니다.
// 우측 상단 디버그 버튼으로 기존 전체 훈련 선택 화면도 확인할 수 있습니다.

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAllCategories, getCategoryById, isPlayableLesson } from '@/mocks/trainingLookup'
import TrainingCategoryCard from '@/components/training/TrainingCategoryCard.vue'
import TrainingCurriculumPath, {
  type CurriculumPathStep,
} from '@/components/training/TrainingCurriculumPath.vue'
import TrainingLessonModal from '@/components/training/TrainingLessonModal.vue'
import RiveGuideCharacter from '@/components/RiveGuideCharacter.vue'

const route = useRoute()
const router = useRouter()

const categories = getAllCategories()
const showAllTrainings = ref(false)

// TODO: 백엔드 연결 시 이 배열과 currentIndex를 아동별 커리큘럼 응답으로 교체합니다.
const mockCurrentIndex = 2
const curriculumSteps: CurriculumPathStep[] = categories
  .flatMap((category) =>
    category.lessons
      .filter((lesson) => isPlayableLesson(category.id, lesson.id))
      .slice(0, 3)
      .map((lesson) => ({ categoryId: category.id, lesson })),
  )
  .slice(0, 10)
  .map((step, index) => ({
    ...step,
    status: index < mockCurrentIndex
      ? 'complete'
      : index === mockCurrentIndex
        ? 'current'
        : 'locked',
  }))

// 라우트 파라미터로 선택된 카테고리(없으면 목록 상태)
const activeCategoryId = computed(() => {
  const raw = route.params.categoryId
  return typeof raw === 'string' ? raw : ''
})
const activeCategory = computed(() =>
  activeCategoryId.value ? getCategoryById(activeCategoryId.value) : null,
)
const isModalOpen = computed(() => activeCategory.value !== null)
const guideMessage = computed(() =>
  showAllTrainings.value ? '어떤 훈련부터\n해볼까?' : '한 칸씩 차례대로\n훈련해보자!',
)

const handleCategorySelect = (categoryId: string) => {
  // 대분류 선택 → 해당 카테고리 서브메뉴 모달(라우트 이동)
  void router.push({ name: 'training-category', params: { categoryId } })
}

const handleCurriculumSelect = (step: CurriculumPathStep) => {
  void router.push({
    name: 'training-lesson',
    params: { categoryId: step.categoryId, lessonId: step.lesson.id },
  })
}

const handleLessonSelect = (lessonId: string) => {
  if (!activeCategoryId.value) return
  // 준비된 레슨 선택 → 레슨 화면(인트로)으로 이동
  void router.push({
    name: 'training-lesson',
    params: { categoryId: activeCategoryId.value, lessonId },
  })
}

const handleCloseModal = () => {
  void router.push({ name: 'training-home' })
}
</script>

<template>
  <main class="training-home">
    <button
      class="debug-view-button"
      type="button"
      :aria-pressed="showAllTrainings"
      @click="showAllTrainings = !showAllTrainings"
    >
      {{ showAllTrainings ? '커리큘럼 보기' : '전체 훈련 보기' }}
    </button>

    <TrainingCurriculumPath
      v-if="!showAllTrainings"
      :steps="curriculumSteps"
      @select="handleCurriculumSelect"
    />

    <section v-else class="home-content">
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

    <RiveGuideCharacter :message="guideMessage" />
  </main>
</template>

<style scoped>
.training-home {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: clamp(12px, 2.2vh, 28px) var(--learner-page-padding) clamp(16px, 2.8vh, 36px);
  background-color: #22c5ed;
  background-image: url('../../assets/backgrounds/training-outer-background-flat-vector.png');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

.debug-view-button {
  position: absolute;
  z-index: 30;
  top: 16px;
  right: 18px;
  padding: 8px 13px;
  border: 2px solid rgb(255 255 255 / 80%);
  border-radius: 13px;
  background: rgb(75 82 183 / 78%);
  box-shadow: 0 5px 12px rgb(31 55 104 / 16%);
  color: #fff;
  font-family: var(--learner-font-display);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.debug-view-button:hover,
.debug-view-button:focus-visible {
  outline: none;
  background: #4c53b8;
  box-shadow: var(--learner-shadow-focus);
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
  grid-template-columns: repeat(4, 1fr);
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
