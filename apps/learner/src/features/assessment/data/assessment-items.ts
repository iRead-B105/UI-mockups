import { detailedTrainingLessons } from '@/features/training/data/detailed-training'
import type { DetailedTrainingItem, DetailedTrainingLesson } from '@/features/training/types'
import { skillById } from '../config/skill-graph'
import type {
  AssessmentContentTags,
  AssessmentInputModality,
  AssessmentItem,
  AssessmentItemType,
  AssessmentResponseMode,
} from '../types'

const resolveItemType = (item: DetailedTrainingItem): AssessmentItemType | null => {
  if (item.type === 'gaze-trace') return 'gaze-trace'
  if (['choice', 'writing', 'speaking'].includes(item.type)) return 'sound-choice'
  if (item.type === 'build') return 'letter-build'
  if (item.type === 'cut') return 'sound-omit'
  if (item.type === 'replace') return 'sound-replace'
  if (['word-reading', 'sentence-reading', 'passage-reading'].includes(item.type)) return 'reading'
  if (['fill-blank', 'sentence-order', 'picture-choice'].includes(item.type)) return 'short-text'
  return null
}

const skillIdFor = (item: DetailedTrainingItem): string => {
  if (item.type === 'gaze-trace' || item.type === 'writing') return 'grapheme-sound'
  if (item.type === 'choice' || item.type === 'speaking') return 'phoneme-initial'
  if (item.type === 'build') return item.contentTags.hasFinal ? 'letter-build-final' : 'letter-build-basic'
  if (item.type === 'cut') return 'phoneme-omit'
  if (item.type === 'replace') return 'phoneme-replace'
  if (item.type === 'word-reading') return item.contentTags.lexicality === 'nonword' ? 'nonword-reading' : 'word-reading'
  if (item.type === 'sentence-reading') return 'sentence-reading'
  if (item.type === 'passage-reading') return 'passage-reading'
  return 'short-text-context'
}

const responseModeFor = (item: DetailedTrainingItem, itemType: AssessmentItemType): AssessmentResponseMode => {
  if (item.type === 'writing') return 'writing'
  if (item.type === 'speaking' || itemType === 'reading') return 'speech'
  if (itemType === 'gaze-trace') return 'gaze-speech'
  if (itemType === 'letter-build' || item.type === 'sentence-order') return 'sequence'
  if (itemType === 'sound-omit') return 'omit'
  if (itemType === 'sound-replace') return 'replace'
  return 'choice'
}

const difficultyFor = (item: DetailedTrainingItem, itemIndex: number): number => {
  const unitRank = { jamo: 1, syllable: 2, word: 3, sentence: 3, passage: 4 }[item.contentTags.unitType]
  return Math.min(4, Math.max(unitRank, 1 + Math.floor(itemIndex / 2)))
}

const allowedModalitiesFor = (responseMode: AssessmentResponseMode): AssessmentInputModality[] => {
  if (responseMode === 'gaze-speech') return ['gaze', 'voice']
  if (responseMode === 'speech') return ['voice']
  if (responseMode === 'writing') return ['writing', 'touch', 'mouse']
  return ['mouse', 'touch']
}

const contentTagsFor = (item: DetailedTrainingItem): AssessmentContentTags => ({ ...item.contentTags })

const displayTextFor = (item: DetailedTrainingItem): string | undefined => {
  if (item.type === 'fill-blank' || item.type === 'sentence-order' || item.type === 'picture-choice') return item.displayText
  if (['word-reading', 'sentence-reading', 'passage-reading'].includes(item.type)) return item.displayText
  if (item.type === 'cut' || item.type === 'replace') return item.displayText
  return undefined
}

const convertItem = (
  lesson: DetailedTrainingLesson,
  item: DetailedTrainingItem,
  itemIndex: number,
): AssessmentItem | null => {
  const itemType = resolveItemType(item)
  if (!itemType) return null
  const skill = skillById.get(skillIdFor(item))
  if (!skill) return null
  const responseMode = responseModeFor(item, itemType)
  const difficultyRank = difficultyFor(item, itemIndex)
  const answerKey = item.type === 'replace'
    ? [...(item.targetUnitIds ?? []), item.replacementAnswerId ?? ''].filter(Boolean)
    : item.type === 'cut'
      ? item.targetUnitIds ?? []
      : item.answer

  return {
    id: `assessment:${lesson.id}:${item.id}`,
    version: 2,
    sourceLessonId: lesson.id,
    sourceQuestionId: item.id,
    sourceTrainingType: lesson.activityType,
    skillId: skill.id,
    prerequisiteSkillIds: skill.prerequisiteSkillIds,
    domainId: skill.domainId,
    itemType,
    responseMode,
    difficultyRank,
    exposureType: itemIndex === 0 ? 'anchor' : 'novel',
    parallelGroupId: `${skill.id}:${itemType}:${difficultyRank}`,
    targetAgeMin: 6,
    targetAgeMax: 9,
    allowedModalities: allowedModalitiesFor(responseMode),
    contentTags: contentTagsFor(item),
    prompt: {
      instruction: item.instruction,
      subInstruction: item.subInstruction,
      audioText: item.targetAudio,
      displayText: displayTextFor(item),
      targetImage: item.targetImage,
      choices: item.choices,
      traceGlyph: item.traceGlyph,
      traceStrokes: item.traceStrokes,
      manipulationUnits: item.manipulationUnits,
      replacementChoices: item.replacementChoices,
      readingTokens: item.readingTokens ?? (item.displayText ? [item.displayText] : undefined),
      phraseChunks: item.phraseChunks,
    },
    answerKey,
    speechAliases: typeof item.answer === 'string' ? [item.answer] : [],
    status: 'active',
  }
}

export const assessmentItems: AssessmentItem[] = detailedTrainingLessons
  .filter((lesson) => lesson.activityType !== 'battle')
  .flatMap((lesson) => lesson.items.map((item, index) => convertItem(lesson, item, index)))
  .filter((item): item is AssessmentItem => item !== null)

export const assessmentItemById = new Map(assessmentItems.map((item) => [item.id, item]))

