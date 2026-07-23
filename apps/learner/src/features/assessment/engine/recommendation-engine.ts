import { assessmentPolicy } from '../config/assessment-policy'
import { assessmentItemById } from '../data/assessment-items'
import { assessmentSkills, skillById } from '../config/skill-graph'
import type {
  AssessmentDomainId,
  AssessmentDomainResult,
  AssessmentInputModality,
  AssessmentRecommendation,
  AssessmentResult,
  AssessmentSession,
} from '../types'

const domainIds: AssessmentDomainId[] = [
  'phonological-awareness',
  'grapheme-sound',
  'letter-manipulation',
  'decoding-fluency',
  'short-text',
]

const domainResult = (session: AssessmentSession, domainId: AssessmentDomainId): AssessmentDomainResult => {
  const responses = session.responses.filter((response) => assessmentItemById.get(response.itemId)?.domainId === domainId)
  const evaluable = responses.filter((response) => response.isEvaluable)
  const correct = evaluable.filter((response) => response.isCorrect)
  const independent = correct.filter(
    (response) => response.targetReplayCount === 0 && response.instructionRepeatCount === 0,
  )
  const accuracy = evaluable.length ? correct.length / evaluable.length : null
  const skillIds = [...new Set(responses.map((response) => assessmentItemById.get(response.itemId)?.skillId).filter((id): id is string => Boolean(id)))]
  const errorCounts = responses.flatMap((response) => response.observedErrorCodes).reduce<Record<string, number>>(
    (counts, code) => ({ ...counts, [code]: (counts[code] ?? 0) + 1 }),
    {},
  )
  const repeatedErrorCodes = Object.entries(errorCounts)
    .filter(([, count]) => count >= assessmentPolicy.repeatedErrorEvidenceCount)
    .map(([code]) => code)

  let status: AssessmentDomainResult['status']
  if (responses.length > 0 && evaluable.length === 0) status = 'invalid_environment'
  else if (evaluable.length < assessmentPolicy.domainMinEvaluableItems) status = 'needs_more_evidence'
  else if ((accuracy ?? 0) >= assessmentPolicy.stableAccuracyReference) status = 'stable'
  else if ((accuracy ?? 0) >= assessmentPolicy.practiceAccuracyReference) status = 'practice_recommended'
  else status = 'prerequisite_recommended'

  return {
    domainId,
    status,
    evaluatedItems: evaluable.length,
    excludedItems: responses.length - evaluable.length,
    correctItems: correct.length,
    accuracy,
    independentRate: evaluable.length ? independent.length / evaluable.length : null,
    repeatedErrorCodes,
    skillIds,
  }
}

const preferredModality = (session: AssessmentSession): AssessmentInputModality | null => {
  const counts = session.responses.reduce<Partial<Record<AssessmentInputModality, number>>>((accumulator, response) => {
    accumulator[response.modality] = (accumulator[response.modality] ?? 0) + 1
    return accumulator
  }, {})
  return (Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] as AssessmentInputModality | undefined) ?? null
}

export const buildAssessmentResult = (session: AssessmentSession): AssessmentResult => {
  const domains = domainIds.map((domainId) => domainResult(session, domainId))
  const skillEvidence = new Map<string, { itemIds: string[]; errorCodes: string[]; correct: number; evaluable: number }>()
  for (const response of session.responses) {
    const item = assessmentItemById.get(response.itemId)
    if (!item) continue
    const current = skillEvidence.get(item.skillId) ?? { itemIds: [], errorCodes: [], correct: 0, evaluable: 0 }
    current.itemIds.push(item.id)
    current.errorCodes.push(...response.observedErrorCodes)
    if (response.isEvaluable) {
      current.evaluable += 1
      if (response.isCorrect) current.correct += 1
    }
    skillEvidence.set(item.skillId, current)
  }

  const stableSkillIds: string[] = []
  const recommendedStartSkillIds: string[] = []
  const prerequisiteSkillIds: string[] = []
  const needsMoreEvidenceSkillIds: string[] = []
  for (const [skillId, evidence] of skillEvidence) {
    if (evidence.evaluable < 2) needsMoreEvidenceSkillIds.push(skillId)
    else if (evidence.correct / evidence.evaluable >= assessmentPolicy.stableAccuracyReference) stableSkillIds.push(skillId)
    else {
      recommendedStartSkillIds.push(skillId)
      if (evidence.correct / evidence.evaluable < assessmentPolicy.practiceAccuracyReference) {
        prerequisiteSkillIds.push(...(skillById.get(skillId)?.prerequisiteSkillIds ?? []))
      }
    }
  }

  const recommendedSkills = [...new Set([...prerequisiteSkillIds, ...recommendedStartSkillIds])]
  const repeatedErrorCodes = [...new Set(domains.flatMap((domain) => domain.repeatedErrorCodes))]
  const excludedItemIds = session.responses.filter((response) => !response.isEvaluable).map((response) => response.itemId)
  const invalidModalities = [...new Set(session.responses.filter((response) => !response.isEvaluable).map((response) => response.modality))]
  const recommendation: AssessmentRecommendation = {
    sessionId: session.id,
    learnerId: session.learnerId,
    assessmentType: session.type,
    policyVersion: session.policyVersion,
    recommendedStartSkillIds,
    recommendedTrainingLessonIds: assessmentSkills
      .filter((skill) => recommendedSkills.includes(skill.id))
      .flatMap((skill) => skill.trainingLessonIds),
    prerequisiteSkillIds: [...new Set(prerequisiteSkillIds)],
    stableSkillIds,
    repeatedErrorCodes,
    needsMoreEvidenceSkillIds,
    excludedItemIds,
    deviceAccommodation: {
      preferredModality: preferredModality(session),
      avoidModalities: invalidModalities,
      notes: invalidModalities.map((modality) => `${modality} 입력에서 기술적 제외 응답이 발생했습니다.`),
    },
    evidence: [...skillEvidence.entries()].map(([skillId, evidence]) => ({
      skillId,
      itemIds: evidence.itemIds,
      reason:
        evidence.evaluable === 0
          ? '평가 가능한 응답이 없어 추가 확인이 필요합니다.'
          : `${evidence.evaluable}개 유효 응답 중 ${evidence.correct}개가 일치했습니다.`,
      errorCodes: [...new Set(evidence.errorCodes)],
    })),
    generatedAt: new Date().toISOString(),
  }

  return {
    sessionId: session.id,
    learnerId: session.learnerId,
    assessmentType: session.type,
    policyVersion: session.policyVersion,
    domains,
    recommendation,
    generatedAt: recommendation.generatedAt,
  }
}


