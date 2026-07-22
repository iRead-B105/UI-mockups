// 훈련 카테고리 목업 데이터

import type { TrainingCategory } from '@/types/training'

import phonologicalIcon from '@/assets/map/letter-part-alpha.png'
import phonicsIcon from '@/assets/map/낱말카드.png'
import shortTextIcon from '@/assets/map/책1.png'
import fluencyIcon from '@/assets/map/책4.png'

export const trainingCategories: TrainingCategory[] = [
  {
    id: 'phonological-awareness',
    title: '음운 인식 훈련',
    description: '소리를 듣고 찾아봐요.',
    image: phonologicalIcon,
    lessons: [
      { id: 'same-sound', categoryId: 'phonological-awareness', title: '같은 소리 찾기', description: '제시된 소리와 같은 소리를 가진 카드를 선택해요.', activityType: 'listen-and-select', estimatedMinutes: 10, isReady: true },
      { id: 'first-sound', categoryId: 'phonological-awareness', title: '첫소리 찾기', description: '단어를 듣고 첫 번째 소리를 선택해요.', activityType: 'listen-and-select', estimatedMinutes: 10, isReady: true },
      { id: 'last-sound', categoryId: 'phonological-awareness', title: '끝소리 찾기', description: '단어를 듣고 마지막 소리를 선택해요.', activityType: 'listen-and-select', estimatedMinutes: 10, isReady: true },
      { id: 'sound-split', categoryId: 'phonological-awareness', title: '소리 나누기', description: '낱말에서 소리 하나를 빼고 들은 낱말을 만들어요.', activityType: 'sound-omit', estimatedMinutes: 12, isReady: true },
      { id: 'sound-combine', categoryId: 'phonological-awareness', title: '소리 합치기', description: '나누어진 소리를 듣고 하나로 합쳐요.', activityType: 'sound-blend', estimatedMinutes: 12, isReady: true },
    ],
  },
  {
    id: 'phonics',
    title: '파닉스 훈련',
    description: '글자를 모아 소리를 만들어요.',
    image: phonicsIcon,
    lessons: [
      { id: 'consonant-sound', categoryId: 'phonics', title: '자음 소리 익히기', description: '자음 글자 카드와 해당 소리를 연결해요.', activityType: 'sound-choice', estimatedMinutes: 10, isReady: true },
      { id: 'vowel-sound', categoryId: 'phonics', title: '모음 소리 익히기', description: '모음 글자 카드와 해당 소리를 연결해요.', activityType: 'sound-choice', estimatedMinutes: 10, isReady: true },
      { id: 'combine-cv', categoryId: 'phonics', title: '자음과 모음 합치기', description: '자음 카드와 모음 카드를 조합하여 음절을 만들어요.', activityType: 'card-combine', estimatedMinutes: 12, isReady: true },
      { id: 'batchim-sound', categoryId: 'phonics', title: '받침 소리 익히기', description: '받침이 있는 음절의 끝소리를 듣고 선택해요.', activityType: 'listen-and-select', estimatedMinutes: 10, isReady: true },
      { id: 'similar-sound', categoryId: 'phonics', title: '비슷한 소리 구별하기', description: 'ㄱ, ㅋ처럼 비슷하게 들리는 소리를 비교해요.', activityType: 'sound-choice', estimatedMinutes: 12, isReady: true },
    ],
  },
  {
    id: 'short-text',
    title: '짧은 글 훈련',
    description: '짧은 문장을 차근차근 읽어요.',
    image: shortTextIcon,
    lessons: [
      { id: 'repeat-sentence', categoryId: 'short-text', title: '한 문장 따라 읽기', description: '문장을 듣고 따라 읽어봐요.', activityType: 'read-aloud', estimatedMinutes: 8, isReady: true },
      { id: 'fill-blank', categoryId: 'short-text', title: '빈칸에 알맞은 단어 넣기', description: '빈칸에 들어갈 알맞은 단어를 선택해요.', activityType: 'fill-blank', estimatedMinutes: 10, isReady: true },
      { id: 'match-picture', categoryId: 'short-text', title: '그림과 문장 연결하기', description: '그림에 맞는 문장을 골라봐요.', activityType: 'sentence-choice', estimatedMinutes: 10, isReady: true },
      { id: 'hard-word', categoryId: 'short-text', title: '어려운 단어 먼저 읽기', description: '어려운 단어를 음절 단위로 분리해서 읽어요.', activityType: 'read-aloud', estimatedMinutes: 8, isReady: true },
      { id: 'sentence-order', categoryId: 'short-text', title: '문장 순서 맞추기', description: '섞인 문장의 올바른 순서를 찾아요.', activityType: 'sentence-order', estimatedMinutes: 12, isReady: true },
    ],
  },
  {
    id: 'fluency',
    title: '유창성 훈련',
    description: '문장을 자연스럽게 읽어봐요.',
    image: fluencyIcon,
    lessons: [
      { id: 'word-chain', categoryId: 'fluency', title: '단어 이어 읽기', description: '단어를 이어서 자연스럽게 읽어요.', activityType: 'read-aloud', estimatedMinutes: 8, isReady: true },
      { id: 'follow-sentence', categoryId: 'fluency', title: '문장 따라 읽기', description: '모범 읽기를 듣고 따라 읽어봐요.', activityType: 'read-aloud', estimatedMinutes: 10, isReady: true },
      { id: 'phrase-reading', categoryId: 'fluency', title: '끊어 읽기', description: '적절한 곳에서 끊어서 읽어요.', activityType: 'read-aloud', estimatedMinutes: 10, isReady: true },
      { id: 're-read', categoryId: 'fluency', title: '같은 문장 다시 읽기', description: '같은 문장을 여러 번 반복해서 읽어요.', activityType: 'read-aloud', estimatedMinutes: 8, isReady: true },
      { id: 'short-story', categoryId: 'fluency', title: '짧은 이야기 읽기', description: '짧은 이야기를 자연스럽게 읽어요.', activityType: 'read-aloud', estimatedMinutes: 12, isReady: true },
    ],
  },
]
