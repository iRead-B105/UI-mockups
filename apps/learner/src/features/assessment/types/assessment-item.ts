export type AssessmentDomainId =
  | 'phonological-awareness'
  | 'grapheme-sound'
  | 'letter-manipulation'
  | 'decoding-fluency'
  | 'short-text'

export type AssessmentItemType =
  | 'gaze-trace'
  | 'sound-choice'
  | 'letter-build'
  | 'sound-omit'
  | 'sound-replace'
  | 'reading'
  | 'short-text'

export type AssessmentResponseMode =
  | 'choice'
  | 'sequence'
  | 'speech'
  | 'writing'
  | 'gaze-speech'
  | 'omit'
  | 'replace'

export type AssessmentInputModality = 'gaze' | 'mouse' | 'touch' | 'voice' | 'writing'

export interface AssessmentChoice {
  id: string
  text: string
}

export interface AssessmentTracePoint {
  x: number
  y: number
}

export interface AssessmentBuildSlot {
  id: string
  role: 'initial' | 'medial' | 'final' | 'syllable'
  answerChoiceId: string
}

export interface AssessmentPrompt {
  instruction: string
  subInstruction?: string
  audioText?: string
  displayText?: string
  targetImage?: string
  targetSymbol?: string
  choices?: AssessmentChoice[]
  traceGlyph?: string
  traceStrokes?: AssessmentTracePoint[][]
  buildSlots?: AssessmentBuildSlot[]
  manipulationUnits?: AssessmentChoice[]
  replacementChoices?: AssessmentChoice[]
  readingTokens?: string[]
  phraseChunks?: string[]
}

export interface AssessmentContentTags {
  unitType?: 'jamo' | 'syllable' | 'word' | 'sentence' | 'passage'
  lexicality?: 'word' | 'nonword'
  hasFinal?: boolean
  hasComplexVowel?: boolean
  hasTenseConsonant?: boolean
  replaceUnit?: 'initial' | 'vowel' | 'final' | 'syllable'
  omitUnit?: 'initial' | 'final' | 'syllable'
}

export interface AssessmentItem {
  id: string
  version: number
  sourceLessonId: string
  sourceQuestionId: string
  sourceTrainingType: string
  skillId: string
  prerequisiteSkillIds: string[]
  domainId: AssessmentDomainId
  itemType: AssessmentItemType
  responseMode: AssessmentResponseMode
  difficultyRank: number
  exposureType: 'novel' | 'anchor'
  parallelGroupId: string
  targetAgeMin: number
  targetAgeMax: number
  allowedModalities: AssessmentInputModality[]
  contentTags: AssessmentContentTags
  prompt: AssessmentPrompt
  answerKey: string | string[]
  speechAliases: string[]
  status: 'draft' | 'reviewed' | 'active' | 'retired'
}

export type AssessmentResponsePayload =
  | { kind: 'choice'; value: string; editCount: number }
  | { kind: 'sequence'; value: string[]; editCount: number }
  | { kind: 'speech'; transcript: string; confidence: number | null }
  | { kind: 'writing'; strokes: Array<Array<{ x: number; y: number }>> }
  | {
      kind: 'gaze-speech'
      transcript: string
      confidence: number | null
      traceCompleted: boolean
      gazeSamples: number
    }
  | { kind: 'omit'; selectedUnitIds: string[]; editCount: number }
  | {
      kind: 'replace'
      targetUnitIds: string[]
      replacementChoiceId: string
      editCount: number
    }

export interface AssessmentActivitySubmission {
  payload: AssessmentResponsePayload
  modality: AssessmentInputModality
  replayCount: number
  instructionRepeatCount?: number
  technicalError?: import('./assessment-session').AssessmentTechnicalError | null
}

