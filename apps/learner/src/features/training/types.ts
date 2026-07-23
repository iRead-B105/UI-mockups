export type DetailedTrainingCategoryId = 'sound-phonics' | 'text-fluency'

export type DetailedTrainingActivityType =
  | 'trace'
  | 'sound-response'
  | 'build'
  | 'battle'
  | 'cut'
  | 'replace'
  | 'reading'
  | 'text-completion'

export type DetailedTrainingItemType =
  | 'gaze-trace'
  | 'choice'
  | 'writing'
  | 'speaking'
  | 'build'
  | 'battle'
  | 'cut'
  | 'replace'
  | 'word-reading'
  | 'sentence-reading'
  | 'passage-reading'
  | 'fill-blank'
  | 'sentence-order'
  | 'picture-choice'

export type TrainingModality = 'gaze' | 'mouse' | 'touch' | 'voice' | 'writing'
export type TrainingTechnicalErrorCode =
  | 'GAZE_NOT_DETECTED'
  | 'MIC_NO_INPUT'
  | 'SPEECH_RECOGNITION_UNAVAILABLE'
  | 'WRITING_CAPTURE_FAILED'
  | 'INPUT_LOW_QUALITY'
  | 'SAVE_FAILED'

export type TrainingSupportCode =
  | 'target_audio_initial'
  | 'audio_replay'
  | 'hint_level_1'
  | 'hint_level_2'
  | 'corrective_model_audio'
  | 'answer_highlight'
  | 'educator_assist'

export type TrainingItemCompletionStatus =
  | 'completed_independent'
  | 'completed_after_replay'
  | 'completed_after_hint_1'
  | 'completed_after_hint_2'
  | 'completed_after_model'
  | 'interrupted_learner'
  | 'interrupted_educator'
  | 'pending_technical'

export type DetailedTrainingSessionStatus =
  | 'ready'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'stopped_by_learner'
  | 'stopped_by_educator'
  | 'technical_interruption'
  | 'unexpected_interruption'

export type TrainingItemPhase = 'task' | 'follow_up_reading' | 'model_response'

export interface DetailedTrainingChoice {
  id: string
  text: string
}

export interface DetailedTracePoint {
  x: number
  y: number
}

export interface DetailedBattleRound {
  id: string
  targetText: string
  answer: string[]
  choices: DetailedTrainingChoice[]
  opponent: 'rabbit' | 'turtle' | 'ant'
}

export interface DetailedTrainingItem {
  id: string
  type: DetailedTrainingItemType
  instruction: string
  subInstruction?: string
  targetAudio?: string
  displayText?: string
  targetImage?: string
  choices?: DetailedTrainingChoice[]
  answer: string | string[]
  traceGlyph?: string
  traceStrokes?: DetailedTracePoint[][]
  manipulationUnits?: DetailedTrainingChoice[]
  replacementChoices?: DetailedTrainingChoice[]
  targetUnitIds?: string[]
  replacementAnswerId?: string
  resultText?: string
  readingTokens?: string[]
  phraseChunks?: string[]
  battleRounds?: DetailedBattleRound[]
  followUpReading?: { targetText: string; phraseChunks?: string[] }
  contentTags: {
    unitType: 'jamo' | 'syllable' | 'word' | 'sentence' | 'passage'
    lexicality?: 'word' | 'nonword'
    hasFinal?: boolean
    hasComplexVowel?: boolean
    hasTenseConsonant?: boolean
    omitUnit?: 'initial' | 'final' | 'syllable'
    replaceUnit?: 'initial' | 'vowel' | 'final' | 'syllable'
  }
}

export interface DetailedTrainingLesson {
  id: string
  categoryId: DetailedTrainingCategoryId
  title: string
  description: string
  activityType: DetailedTrainingActivityType
  estimatedMinutes: number
  items: DetailedTrainingItem[]
}

export interface DetailedTrainingCategory {
  id: DetailedTrainingCategoryId
  title: string
  description: string
  image: string
  lessons: Array<{
    id: string
    categoryId: DetailedTrainingCategoryId
    title: string
    description: string
    activityType: DetailedTrainingActivityType
    estimatedMinutes: number
    isReady: true
  }>
}

export type DetailedTrainingResponsePayload =
  | { kind: 'choice'; value: string }
  | { kind: 'sequence'; value: string[] }
  | { kind: 'omit'; selectedUnitIds: string[] }
  | { kind: 'replace'; targetUnitIds: string[]; replacementChoiceId: string }
  | { kind: 'mock-evaluation'; outcome: 'correct' | 'incorrect' }
  | { kind: 'battle'; completedRoundIds: string[]; learnerWins: number }

export interface DetailedTrainingSubmission {
  payload: DetailedTrainingResponsePayload
  modality: TrainingModality
  isMock: boolean
  technicalErrorCode?: TrainingTechnicalErrorCode
  rawInput?: unknown
}

export interface TrainingSupportEvent {
  code: TrainingSupportCode
  itemId: string
  createdAt: string
}

export interface TrainingAttemptEvent {
  sessionId: string
  lessonId: string
  itemId: string
  phase: TrainingItemPhase
  modality: TrainingModality
  attemptIndex: number
  response: DetailedTrainingResponsePayload | null
  isEvaluable: boolean
  isCorrect: boolean | null
  isMock: boolean
  supportEvents: TrainingSupportCode[]
  observedErrorCodes: string[]
  technicalErrorCode: TrainingTechnicalErrorCode | null
  createdAt: string
}

export interface DetailedTrainingSession {
  id: string
  learnerId: string
  lessonId: string
  categoryId: DetailedTrainingCategoryId
  status: DetailedTrainingSessionStatus
  currentItemIndex: number
  phase: TrainingItemPhase
  modelForPhase: 'task' | 'follow_up_reading' | null
  taskAttemptCount: number
  readingAttemptCount: number
  completedItemIds: string[]
  itemCompletion: Record<string, TrainingItemCompletionStatus>
  attemptEvents: TrainingAttemptEvent[]
  supportEvents: TrainingSupportEvent[]
  feedback: { kind: 'success' | 'retry' | 'model' | 'technical'; message: string } | null
  awaitingNext: boolean
  startedAt: string | null
  completedAt: string | null
  stoppedAt: string | null
}


