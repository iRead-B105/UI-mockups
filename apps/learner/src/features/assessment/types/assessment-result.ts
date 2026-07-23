import type { AssessmentDomainId, AssessmentInputModality } from './assessment-item'
import type { AssessmentType } from './assessment-session'

export type AssessmentDomainStatus =
  | 'stable'
  | 'practice_recommended'
  | 'prerequisite_recommended'
  | 'needs_more_evidence'
  | 'invalid_environment'

export interface AssessmentDomainResult {
  domainId: AssessmentDomainId
  status: AssessmentDomainStatus
  evaluatedItems: number
  excludedItems: number
  correctItems: number
  accuracy: number | null
  independentRate: number | null
  repeatedErrorCodes: string[]
  skillIds: string[]
}

export interface AssessmentRecommendationEvidence {
  skillId: string
  itemIds: string[]
  reason: string
  errorCodes: string[]
}

export interface AssessmentRecommendation {
  sessionId: string
  learnerId: string
  assessmentType: AssessmentType
  policyVersion: string
  recommendedStartSkillIds: string[]
  recommendedTrainingLessonIds: string[]
  prerequisiteSkillIds: string[]
  stableSkillIds: string[]
  repeatedErrorCodes: string[]
  needsMoreEvidenceSkillIds: string[]
  excludedItemIds: string[]
  deviceAccommodation: {
    preferredModality: AssessmentInputModality | null
    avoidModalities: AssessmentInputModality[]
    notes: string[]
  }
  evidence: AssessmentRecommendationEvidence[]
  generatedAt: string
}

export interface AssessmentResult {
  sessionId: string
  learnerId: string
  assessmentType: AssessmentType
  policyVersion: string
  domains: AssessmentDomainResult[]
  recommendation: AssessmentRecommendation
  generatedAt: string
}


