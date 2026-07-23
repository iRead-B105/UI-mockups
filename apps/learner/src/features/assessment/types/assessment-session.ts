import type {
  AssessmentDomainId,
  AssessmentInputModality,
  AssessmentResponsePayload,
} from './assessment-item'

export type AssessmentType = 'initial' | 'progress' | 'stage_transition'
export type AssessmentSessionStatus =
  | 'created'
  | 'ready'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'stopped_by_learner'
  | 'stopped_by_educator'
  | 'technical_interruption'
  | 'unexpected_interruption'

export type AssessmentResponseState =
  | 'submitted'
  | 'technical_invalid'
  | 'no_response'
  | 'interrupted'

export interface AssessmentTechnicalError {
  code:
    | 'GAZE_NOT_DETECTED'
    | 'GAZE_LOW_QUALITY'
    | 'MIC_PERMISSION_DENIED'
    | 'MIC_NO_INPUT'
    | 'SPEECH_LOW_CONFIDENCE'
    | 'SPEECH_EVALUATOR_UNAVAILABLE'
    | 'AMBIENT_NOISE'
    | 'WRITING_EVALUATOR_UNAVAILABLE'
    | 'WRITING_CAPTURE_FAILED'
    | 'SAVE_FAILED'
    | 'NETWORK_UNAVAILABLE'
    | 'MOCK_INPUT_UNAVAILABLE'
  message: string
}

export interface AssessmentDeviceContext {
  gazeAvailable: boolean
  microphoneAvailable: boolean
  touchAvailable: boolean
  pointerType: 'mouse' | 'touch' | 'unknown'
}

export interface AssessmentResponseEvent {
  sessionId: string
  itemId: string
  itemVersion: number
  learnerId: string
  modality: AssessmentInputModality
  responseState: AssessmentResponseState
  responsePayload: AssessmentResponsePayload | null
  isEvaluable: boolean
  isCorrect: boolean | null
  observedErrorCodes: string[]
  targetReplayCount: number
  instructionRepeatCount: number
  editCount: number
  selfCorrectionCount: number
  responseDurationMs: number | null
  inputConfidence: number | null
  technicalError: AssessmentTechnicalError | null
  deviceContext: AssessmentDeviceContext
  submittedAt: string | null
}

export interface AssessmentEngineState {
  stage: 'screening' | 'branch'
  screeningSkillIndex: number
  currentSkillId: string
  currentDifficultyRank: number
  consecutiveIndependentCorrect: number
  errorEvidence: Record<string, number>
  evaluatedBySkill: Record<string, number>
  correctBySkill: Record<string, number>
  completedSkillIds: string[]
}

export interface AssessmentSession {
  id: string
  learnerId: string
  type: AssessmentType
  policyVersion: string
  status: AssessmentSessionStatus
  currentItemId: string | null
  awaitingNext: boolean
  pendingNextItemId: string | null
  pendingComplete: boolean
  administeredItemIds: string[]
  discardedItemIds: string[]
  responses: AssessmentResponseEvent[]
  engineState: AssessmentEngineState
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  pausedAt: string | null
}

export interface AssessmentDomainProgress {
  domainId: AssessmentDomainId
  evaluatedItems: number
  correctItems: number
}

