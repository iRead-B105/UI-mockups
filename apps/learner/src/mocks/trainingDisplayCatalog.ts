import type { TrainingLessonSummary } from '@/types/training'
import phonologicalIcon from '@/assets/map/letter-part-alpha.png'
import decodingIcon from '@/assets/map/책1.png'
import fluencyIcon from '@/assets/map/책4.png'
import { trainingCategories } from './trainingCategories'

export type TrainingDisplayCategoryId =
  | 'sound-phonics'
  | 'decoding-comprehension'
  | 'fluency'

export interface TrainingDisplayLesson extends TrainingLessonSummary {
  title: string
  description: string
}

export interface TrainingDisplaySection {
  id: string
  title: string
  lessons: TrainingDisplayLesson[]
}

export interface TrainingDisplayCategory {
  id: TrainingDisplayCategoryId
  title: string
  description: string
  image: string
  sections: TrainingDisplaySection[]
}

const sourceLessons = new Map(
  trainingCategories.flatMap((category) => category.lessons).map((lesson) => [lesson.id, lesson]),
)

const displayLesson = (
  id: string,
  title: string,
  description?: string,
): TrainingDisplayLesson => {
  const source = sourceLessons.get(id)
  if (!source) {
    throw new Error(`화면 카탈로그에 연결할 훈련을 찾을 수 없습니다: ${id}`)
  }

  return {
    ...source,
    title,
    description: description ?? source.description,
  }
}

export const trainingDisplayCategories: TrainingDisplayCategory[] = [
  {
    id: 'sound-phonics',
    title: '음운 인식 및 파닉스',
    description: '한글의 소리와 글자 원리를 차근차근 익혀요.',
    image: phonologicalIcon,
    sections: [
      {
        id: 'trace-letters',
        title: '글자 따라 보기',
        lessons: [
          displayLesson('trace-vowel', '모음'),
          displayLesson('trace-consonant', '자음'),
          displayLesson('trace-syllable', '음절'),
        ],
      },
      {
        id: 'listen-and-choose',
        title: '소리 듣고 고르기',
        lessons: [
          displayLesson('letter-sound-choice', '자음과 모음'),
          displayLesson('first-sound', '첫소리 찾기'),
          displayLesson('same-sound', '같은 첫소리의 낱말 찾기'),
          displayLesson('last-sound', '받침 소리(종성), 끝소리'),
          displayLesson('similar-sound', "비슷한 소리('ㄱ', 'ㅋ' 등)"),
        ],
      },
      {
        id: 'build-letters',
        title: '글자 만들기',
        lessons: [
          displayLesson('sound-combine', '소리 합치기(음절·낱말 합성)'),
          displayLesson('build-basic-letter', '기본 글자 만들기(자음·모음 합성)'),
          displayLesson('build-batchim-letter', '받침 글자 만들기'),
          displayLesson('build-double-batchim-letter', '겹받침 글자 만들기'),
        ],
      },
      {
        id: 'cut-letters',
        title: '글자 자르기',
        lessons: [
          displayLesson('remove-batchim', '받침 빼기(음소 생략형)'),
          displayLesson('remove-syllable', '음절 빼기(음절 생략형)'),
        ],
      },
      {
        id: 'replace-letters',
        title: '글자 대치',
        lessons: [
          displayLesson('replace-syllable', '음절 바꾸기'),
        ],
      },
    ],
  },
  {
    id: 'decoding-comprehension',
    title: '글 해독 및 문장 이해',
    description: '낱말과 문장을 정확하게 읽고 뜻을 이해해요.',
    image: decodingIcon,
    sections: [
      {
        id: 'decoding',
        title: '글 해독',
        lessons: [
          displayLesson('read-real-words', '낱말 읽기'),
          displayLesson('read-nonwords', '새 낱말 읽기(비단어)'),
          displayLesson('hard-word', '어려운 단어 먼저 읽기'),
          displayLesson('read-sentences', '문장 읽기'),
          displayLesson('read-short-passage', '짧은 글 읽기'),
        ],
      },
      {
        id: 'sentence-completion',
        title: '문장 완성 및 이해',
        lessons: [
          displayLesson('sentence-order', '문장 전체 조립'),
          displayLesson('fill-blank', '빈칸에 알맞은 단어 넣기'),
          displayLesson('match-picture', '그림과 문장 연결하기'),
        ],
      },
    ],
  },
  {
    id: 'fluency',
    title: '유창성',
    description: '글을 알맞게 끊고 자연스럽게 이어 읽어요.',
    image: fluencyIcon,
    sections: [
      {
        id: 'fluent-reading',
        title: '유창하게 읽기',
        lessons: [
          displayLesson('follow-sentence', '문장 따라 읽기'),
          displayLesson('word-chain', '단어 이어 읽기'),
          displayLesson('phrase-reading', '끊어 읽기'),
          displayLesson('re-read', '같은 문장 다시 읽기'),
          displayLesson('short-story', '짧은 이야기 읽기'),
        ],
      },
    ],
  },
]

const displayCategoryIds = new Set<string>(
  trainingDisplayCategories.map((category) => category.id),
)

const visibleLessons = new Map(
  trainingDisplayCategories
    .flatMap((category) => category.sections)
    .flatMap((section) => section.lessons)
    .map((lesson) => [lesson.id, lesson]),
)

export const getAllTrainingDisplayCategories = (): TrainingDisplayCategory[] =>
  trainingDisplayCategories

export const getTrainingDisplayCategoryById = (
  id: string,
): TrainingDisplayCategory | null =>
  trainingDisplayCategories.find((category) => category.id === id) ?? null

export const isValidTrainingDisplayCategoryId = (
  id: string,
): id is TrainingDisplayCategoryId => displayCategoryIds.has(id)

export const findTrainingDisplayLesson = (
  lessonId: string,
): TrainingDisplayLesson | null => visibleLessons.get(lessonId) ?? null

export const findTrainingDisplayLessonInCategory = (
  displayCategoryId: string,
  lessonId: string,
): TrainingDisplayLesson | null => {
  const category = getTrainingDisplayCategoryById(displayCategoryId)
  if (!category) return null

  return category.sections
    .flatMap((section) => section.lessons)
    .find((lesson) => lesson.id === lessonId) ?? null
}

export const isLearnerVisibleLesson = (
  categoryId: string,
  lessonId: string,
): boolean => {
  const lesson = findTrainingDisplayLesson(lessonId)
  return lesson?.categoryId === categoryId
}

