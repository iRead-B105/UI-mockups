<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  getSkillChallengeLessons,
  skillChallengeTracks,
  useSkillChallenge,
  type SkillChallengeTrack,
} from '@/composables/useSkillChallenge'
import listeningEarImage from '@/assets/challenge/challenge-listening-ear.png'
import sentenceCardsImage from '@/assets/challenge/challenge-sentence-cards.png'
import readingBooksImage from '@/assets/challenge/challenge-reading-books.png'

const router = useRouter()
const challenge = useSkillChallenge()

const startTrack = (track: SkillChallengeTrack) => {
  const firstLesson = challenge.startChallenge(track.id)
  if (!firstLesson) return

  void router.push({
    name: 'training-lesson',
    params: {
      categoryId: firstLesson.categoryId,
      lessonId: firstLesson.lessonId,
    },
    query: { challenge: track.id },
  })
}

const getTrackLessonCount = (track: SkillChallengeTrack) => {
  return getSkillChallengeLessons(track.id).length
}

const trackImages: Record<SkillChallengeTrack['id'], string> = {
  phonological: listeningEarImage,
  'short-text': sentenceCardsImage,
  fluency: readingBooksImage,
}
</script>

<template>
  <main class="skill-challenge">
    <section class="challenge-panel">
      <header class="challenge-heading">
        <span class="challenge-kicker">실력 검증</span>
        <h1>어떤 실력을 확인해볼까요?</h1>
        <p>하나를 고르면 그 안의 훈련을 차례대로 모두 해봐요.</p>
      </header>

      <div class="challenge-grid">
        <button
          v-for="track in skillChallengeTracks"
          :key="track.id"
          class="challenge-card"
          :class="`challenge-card--${track.color}`"
          type="button"
          @click="startTrack(track)"
        >
          <img class="challenge-card__illustration" :src="trackImages[track.id]" alt="" aria-hidden="true" />
          <span class="challenge-card__content">
            <strong>{{ track.title }}</strong>
            <small>{{ track.shortLabel }}</small>
          </span>
          <span class="challenge-card__footer">
            <b>{{ getTrackLessonCount(track) }}개 훈련</b>
            <i aria-hidden="true">→</i>
          </span>
        </button>
      </div>

      <p class="challenge-note">
        점수는 화면에 보여주지 않아요. 편안하게 끝까지 해보면 돼요!
      </p>
    </section>
  </main>
</template>

<style scoped src="@/styles/training/SkillChallengeView.css"></style>
