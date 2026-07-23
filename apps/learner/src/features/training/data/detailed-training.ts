import soundIcon from '@/assets/map/letter-part-alpha.png'
import textIcon from '@/assets/map/책4.png'
import rabbitCarrotImage from '@/assets/sentence-match/rabbit-carrot.png'
import type {
  DetailedBattleRound,
  DetailedTracePoint,
  DetailedTrainingCategory,
  DetailedTrainingChoice,
  DetailedTrainingItem,
  DetailedTrainingLesson,
} from '../types'

const line = (from: DetailedTracePoint, to: DetailedTracePoint, steps = 6): DetailedTracePoint[] =>
  Array.from({ length: steps }, (_, index) => ({
    x: from.x + ((to.x - from.x) * index) / (steps - 1),
    y: from.y + ((to.y - from.y) * index) / (steps - 1),
  }))

const traceShapes: Record<string, DetailedTracePoint[][]> = {
  'ㄱ': [[...line({ x: 25, y: 24 }, { x: 72, y: 24 }), ...line({ x: 72, y: 24 }, { x: 72, y: 76 }).slice(1)]],
  'ㅏ': [line({ x: 45, y: 16 }, { x: 45, y: 84 }, 8), line({ x: 45, y: 50 }, { x: 74, y: 50 }, 5)],
  '가': [line({ x: 18, y: 26 }, { x: 44, y: 26 }), line({ x: 44, y: 26 }, { x: 44, y: 72 }), line({ x: 67, y: 18 }, { x: 67, y: 82 }), line({ x: 67, y: 50 }, { x: 84, y: 50 })],
}

const choice = (id: string, text: string): DetailedTrainingChoice => ({ id, text })
const follow = (targetText: string, phraseChunks?: string[]) => ({ targetText, phraseChunks })

const traceItems: DetailedTrainingItem[] = [
  { id: 'trace-consonant-basic', type: 'gaze-trace', instruction: '첫 점부터 눈으로 길을 따라가요.', traceGlyph: 'ㄱ', traceStrokes: traceShapes['ㄱ'], answer: 'ㄱ', followUpReading: follow('그'), contentTags: { unitType: 'jamo' } },
  { id: 'trace-vowel-basic', type: 'gaze-trace', instruction: '첫 점부터 눈으로 길을 따라가요.', traceGlyph: 'ㅏ', traceStrokes: traceShapes['ㅏ'], answer: 'ㅏ', followUpReading: follow('아'), contentTags: { unitType: 'jamo' } },
  { id: 'trace-syllable-basic', type: 'gaze-trace', instruction: '완성된 글자를 눈으로 따라가요.', traceGlyph: '가', traceStrokes: traceShapes['가'], answer: '가', followUpReading: follow('가'), contentTags: { unitType: 'syllable' } },
]

const soundResponseItems: DetailedTrainingItem[] = [
  { id: 'same-initial-card', type: 'choice', instruction: '소리를 듣고 같은 첫소리의 낱말을 골라요.', targetAudio: '가방', choices: [choice('scissors', '가위'), choice('butterfly', '나비'), choice('hat', '모자')], answer: 'scissors', contentTags: { unitType: 'word', lexicality: 'word' } },
  { id: 'sound-writing-ga', type: 'writing', instruction: '소리를 듣고 글자를 직접 써 봐요.', targetAudio: '가', answer: '가', contentTags: { unitType: 'syllable' } },
  { id: 'sound-speaking-butterfly', type: 'speaking', instruction: '소리를 듣고 그대로 말해 봐요.', targetAudio: '나비', answer: '나비', contentTags: { unitType: 'word', lexicality: 'word' } },
]

const buildItems: DetailedTrainingItem[] = [
  { id: 'build-jamo-ga', type: 'build', instruction: '들은 소리를 자음과 모음 카드로 만들어요.', targetAudio: '가', choices: [choice('g', 'ㄱ'), choice('n', 'ㄴ'), choice('a', 'ㅏ'), choice('eo', 'ㅓ')], answer: ['g', 'a'], resultText: '가', followUpReading: follow('가'), contentTags: { unitType: 'syllable' } },
  { id: 'build-word-apple', type: 'build', instruction: '들은 낱말을 음절 카드로 만들어요.', targetAudio: '사과', choices: [choice('gwa', '과'), choice('na', '나'), choice('sa', '사')], answer: ['sa', 'gwa'], resultText: '사과', followUpReading: follow('사과'), contentTags: { unitType: 'word', lexicality: 'word' } },
  { id: 'build-nonword-meonuk', type: 'build', instruction: '처음 듣는 낱말도 들은 순서대로 만들어요.', targetAudio: '머눅', choices: [choice('nuk', '눅'), choice('meo', '머'), choice('ga', '가')], answer: ['meo', 'nuk'], resultText: '머눅', followUpReading: follow('머눅'), contentTags: { unitType: 'word', lexicality: 'nonword', hasFinal: true } },
]

const battleChoices = (letters: string[]): DetailedTrainingChoice[] => letters.map((text, index) => choice(`tile-${index}-${text}`, text))
const battleRounds: DetailedBattleRound[] = [
  { id: 'round-rabbit', targetText: '나비', answer: ['ㄴ', 'ㅏ', 'ㅂ', 'ㅣ'], choices: battleChoices(['ㄴ', 'ㅏ', 'ㅂ', 'ㅣ', 'ㄱ']), opponent: 'rabbit' },
  { id: 'round-turtle', targetText: '감', answer: ['ㄱ', 'ㅏ', 'ㅁ'], choices: battleChoices(['ㄱ', 'ㅏ', 'ㅁ', 'ㄴ']), opponent: 'turtle' },
  { id: 'round-ant', targetText: '닭', answer: ['ㄷ', 'ㅏ', 'ㄺ'], choices: battleChoices(['ㄷ', 'ㅏ', 'ㄺ', 'ㄹ']), opponent: 'ant' },
]

const cutItems: DetailedTrainingItem[] = [
  { id: 'cut-syllable-tomato', type: 'cut', instruction: '목표 소리를 듣고 뺄 음절을 골라요.', targetAudio: '토토', displayText: '토마토', manipulationUnits: [choice('to-1', '토'), choice('ma', '마'), choice('to-2', '토')], targetUnitIds: ['ma'], answer: ['ma'], resultText: '토토', followUpReading: follow('토토'), contentTags: { unitType: 'word', lexicality: 'word', omitUnit: 'syllable' } },
  { id: 'cut-final-gam', type: 'cut', instruction: '목표 소리를 듣고 뺄 자음을 골라요.', targetAudio: '가', displayText: '감', manipulationUnits: [choice('initial', 'ㄱ'), choice('vowel', 'ㅏ'), choice('final', 'ㅁ')], targetUnitIds: ['final'], answer: ['final'], resultText: '가', followUpReading: follow('가'), contentTags: { unitType: 'syllable', hasFinal: true, omitUnit: 'final' } },
  { id: 'cut-initial-gang', type: 'cut', instruction: '목표 소리를 듣고 뺄 자음을 골라요.', targetAudio: '앙', displayText: '강', manipulationUnits: [choice('initial', 'ㄱ'), choice('vowel', 'ㅏ'), choice('final', 'ㅇ')], targetUnitIds: ['initial'], answer: ['initial'], resultText: '앙', followUpReading: follow('앙'), contentTags: { unitType: 'syllable', hasFinal: true, omitUnit: 'initial' } },
]

const replaceItems: DetailedTrainingItem[] = [
  { id: 'replace-initial-gam-bam', type: 'replace', instruction: '목표 소리가 되도록 바꿀 자리와 카드를 골라요.', targetAudio: '밤', displayText: '감', manipulationUnits: [choice('initial', 'ㄱ'), choice('vowel', 'ㅏ'), choice('final', 'ㅁ')], replacementChoices: [choice('b', 'ㅂ'), choice('n', 'ㄴ'), choice('d', 'ㄷ')], targetUnitIds: ['initial'], replacementAnswerId: 'b', answer: ['initial', 'b'], resultText: '밤', followUpReading: follow('밤'), contentTags: { unitType: 'syllable', hasFinal: true, replaceUnit: 'initial' } },
  { id: 'replace-vowel-gang-gong', type: 'replace', instruction: '목표 소리가 되도록 바꿀 자리와 카드를 골라요.', targetAudio: '공', displayText: '강', manipulationUnits: [choice('initial', 'ㄱ'), choice('vowel', 'ㅏ'), choice('final', 'ㅇ')], replacementChoices: [choice('o', 'ㅗ'), choice('u', 'ㅜ'), choice('eo', 'ㅓ')], targetUnitIds: ['vowel'], replacementAnswerId: 'o', answer: ['vowel', 'o'], resultText: '공', followUpReading: follow('공'), contentTags: { unitType: 'syllable', hasFinal: true, replaceUnit: 'vowel' } },
  { id: 'replace-final-gan-gam', type: 'replace', instruction: '목표 소리가 되도록 바꿀 자리와 카드를 골라요.', targetAudio: '감', displayText: '간', manipulationUnits: [choice('initial', 'ㄱ'), choice('vowel', 'ㅏ'), choice('final', 'ㄴ')], replacementChoices: [choice('m', 'ㅁ'), choice('g', 'ㄱ'), choice('r', 'ㄹ')], targetUnitIds: ['final'], replacementAnswerId: 'm', answer: ['final', 'm'], resultText: '감', followUpReading: follow('감'), contentTags: { unitType: 'syllable', hasFinal: true, replaceUnit: 'final' } },
  { id: 'replace-syllable-apple-lion', type: 'replace', instruction: '목표 소리가 되도록 바꿀 음절을 골라요.', targetAudio: '사자', displayText: '사과', manipulationUnits: [choice('sa', '사'), choice('gwa', '과')], replacementChoices: [choice('ja', '자'), choice('na', '나'), choice('go', '고')], targetUnitIds: ['gwa'], replacementAnswerId: 'ja', answer: ['gwa', 'ja'], resultText: '사자', followUpReading: follow('사자'), contentTags: { unitType: 'word', lexicality: 'word', replaceUnit: 'syllable' } },
]

const readingItems: DetailedTrainingItem[] = [
  { id: 'read-word-grid', type: 'word-reading', instruction: '보고 싶은 낱말부터 소리 내어 읽어요.', displayText: '낱말 읽기', readingTokens: ['나비', '모자', '가위', '토끼'], answer: '나비 모자 가위 토끼', contentTags: { unitType: 'word', lexicality: 'word' } },
  { id: 'read-sentence-flow', type: 'sentence-reading', instruction: '문장을 끝까지 읽은 뒤 어려운 부분을 다시 확인해요.', displayText: '토끼가 풀밭을 달려요.', phraseChunks: ['토끼가', '풀밭을', '달려요.'], answer: '토끼가 풀밭을 달려요', contentTags: { unitType: 'sentence' } },
  { id: 'read-short-passage', type: 'passage-reading', instruction: '첫 문장부터 차례로 끝까지 읽어요.', displayText: '노란 나비가 날아와요. 예쁜 꽃에 앉아요.', phraseChunks: ['노란 나비가 날아와요.', '예쁜 꽃에 앉아요.'], answer: '노란 나비가 날아와요 예쁜 꽃에 앉아요', contentTags: { unitType: 'passage' } },
]

const textItems: DetailedTrainingItem[] = [
  { id: 'fill-carrot', type: 'fill-blank', instruction: '빈칸에 알맞은 낱말을 골라요.', displayText: '토끼가 ___ 먹어요.', choices: [choice('apple', '사과를'), choice('carrot', '당근을'), choice('milk', '우유를')], answer: 'carrot', resultText: '토끼가 당근을 먹어요.', followUpReading: follow('토끼가 당근을 먹어요', ['토끼가', '당근을', '먹어요.']), contentTags: { unitType: 'sentence' } },
  { id: 'order-apple', type: 'sentence-order', instruction: '낱말 카드를 순서대로 놓아 문장을 만들어요.', choices: [choice('eat', '먹어요.'), choice('apple', '사과를'), choice('yj', '윤정이가')], answer: ['yj', 'apple', 'eat'], resultText: '윤정이가 사과를 먹어요.', followUpReading: follow('윤정이가 사과를 먹어요', ['윤정이가', '사과를', '먹어요.']), contentTags: { unitType: 'sentence' } },
  { id: 'picture-rabbit', type: 'picture-choice', instruction: '그림을 가장 정확하게 설명하는 문장을 골라요.', targetImage: rabbitCarrotImage, choices: [choice('sleep', '토끼가 풀밭에서 자요.'), choice('eat', '토끼가 당근을 먹어요.'), choice('ball', '토끼가 공을 굴려요.')], answer: 'eat', resultText: '토끼가 당근을 먹어요.', followUpReading: follow('토끼가 당근을 먹어요', ['토끼가', '당근을', '먹어요.']), contentTags: { unitType: 'sentence' } },
]

export const detailedTrainingLessons: DetailedTrainingLesson[] = [
  { id: 'trace-letters', categoryId: 'sound-phonics', title: '글자 따라 보기', description: '획순대로 눈으로 따라간 뒤 정확한 소리를 듣고 말해요.', activityType: 'trace', estimatedMinutes: 8, items: traceItems },
  { id: 'listen-and-respond', categoryId: 'sound-phonics', title: '소리 듣고 고르기', description: '소리를 듣고 카드로 고르거나 직접 쓰고 말해요.', activityType: 'sound-response', estimatedMinutes: 10, items: soundResponseItems },
  { id: 'build-symbols', categoryId: 'sound-phonics', title: '글자 만들기', description: '전체 소리를 듣고 자모·음절 카드를 순서대로 배치해요.', activityType: 'build', estimatedMinutes: 12, items: buildItems },
  { id: 'hangul-battle', categoryId: 'sound-phonics', title: '한글 대결', description: '세 판 동안 상대 캐릭터와 낱말 만들기 대결을 해요.', activityType: 'battle', estimatedMinutes: 10, items: [{ id: 'battle-three-rounds', type: 'battle', instruction: '상대보다 먼저 세 낱말을 완성해요.', battleRounds, answer: battleRounds.map((round) => round.id), contentTags: { unitType: 'word', lexicality: 'word' } }] },
  { id: 'cut-symbols', categoryId: 'sound-phonics', title: '글자 자르기', description: '목표 소리를 듣고 음절·초성·종성을 직접 빼요.', activityType: 'cut', estimatedMinutes: 10, items: cutItems },
  { id: 'replace-symbols', categoryId: 'sound-phonics', title: '글자 대치', description: '목표 소리가 되도록 한 자리의 글자를 바꿔요.', activityType: 'replace', estimatedMinutes: 12, items: replaceItems },
  { id: 'guided-reading', categoryId: 'text-fluency', title: '단어·문장·긴 글 읽기', description: '예시 없이 끝까지 읽은 뒤 어려운 부분을 다시 확인해요.', activityType: 'reading', estimatedMinutes: 12, items: readingItems },
  { id: 'complete-text', categoryId: 'text-fluency', title: '빈칸 채우기와 문장 완성', description: '빈칸·문장 순서·그림 문제를 해결하고 완성 문장을 읽어요.', activityType: 'text-completion', estimatedMinutes: 12, items: textItems },
]

export const detailedTrainingLessonMap = new Map(detailedTrainingLessons.map((lesson) => [lesson.id, lesson]))

export const detailedTrainingCategories: DetailedTrainingCategory[] = [
  {
    id: 'sound-phonics', title: '음운 인식 및 파닉스', description: '소리를 듣고 글자를 보고 만들어요.', image: soundIcon,
    lessons: detailedTrainingLessons.filter((lesson) => lesson.categoryId === 'sound-phonics').map((lesson) => ({ ...lesson, isReady: true as const })),
  },
  {
    id: 'text-fluency', title: '짧은 글 및 유창성', description: '단어와 문장을 끝까지 읽고 완성해요.', image: textIcon,
    lessons: detailedTrainingLessons.filter((lesson) => lesson.categoryId === 'text-fluency').map((lesson) => ({ ...lesson, isReady: true as const })),
  },
]


