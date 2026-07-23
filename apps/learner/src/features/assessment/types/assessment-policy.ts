export interface AssessmentPolicy {
  version: string
  status: 'draft' | 'reviewed' | 'active'
  commonScreeningTargetItems: number
  commonScreeningMaxItems: number
  domainMinEvaluableItems: number
  maxTargetAudioReplay: number
  maxInstructionRepeat: number
  repeatedErrorEvidenceCount: number
  consecutiveIndependentCorrectToAdvance: number
  consecutiveNoResponsePause: number
  stableAccuracyReference: number
  practiceAccuracyReference: number
  progressAnchorItemRatio: number
  speechInputQualityThreshold: number
  neutralFeedbackDurationMs: number
  mockNavigationEnabled: boolean
}

