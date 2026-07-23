import { assessmentPolicy } from '../config/assessment-policy'
import { commonScreeningSkillIds, skillById } from '../config/skill-graph'
import { assessmentItems } from '../data/assessment-items'
import type { AssessmentEngineState, AssessmentItem, AssessmentResponseEvent } from '../types'

export const createInitialEngineState = (): AssessmentEngineState => ({
  stage: 'screening',
  screeningSkillIndex: 0,
  currentSkillId: commonScreeningSkillIds[0] ?? 'phoneme-initial',
  currentDifficultyRank: 1,
  consecutiveIndependentCorrect: 0,
  errorEvidence: {},
  evaluatedBySkill: {},
  correctBySkill: {},
  completedSkillIds: [],
})

const closestDifficulty = (items: AssessmentItem[], difficultyRank: number): AssessmentItem[] => {
  const exact = items.filter((item) => item.difficultyRank === difficultyRank)
  if (exact.length) return exact
  const distance = Math.min(...items.map((item) => Math.abs(item.difficultyRank - difficultyRank)))
  return items.filter((item) => Math.abs(item.difficultyRank - difficultyRank) === distance)
}

const selectAvailable = (
  skillId: string,
  difficultyRank: number,
  administeredItemIds: string[],
  discardedItemIds: string[],
  preferredParallelGroupId?: string,
): AssessmentItem | null => {
  const blocked = new Set([...administeredItemIds, ...discardedItemIds])
  const candidates = assessmentItems.filter((item) => item.skillId === skillId && !blocked.has(item.id))
  if (!candidates.length) return null
  if (preferredParallelGroupId) {
    const parallel = candidates.find((item) => item.parallelGroupId === preferredParallelGroupId)
    if (parallel) return parallel
  }
  return closestDifficulty(candidates, difficultyRank)[0] ?? null
}

export const selectFirstAssessmentItem = (): AssessmentItem | null =>
  selectAvailable(commonScreeningSkillIds[0] ?? 'phoneme-initial', 1, [], [])

export const selectParallelAssessmentItem = (
  previousItem: AssessmentItem,
  administeredItemIds: string[],
  discardedItemIds: string[],
): AssessmentItem | null =>
  selectAvailable(previousItem.skillId, previousItem.difficultyRank, administeredItemIds, discardedItemIds, previousItem.parallelGroupId)

export interface AdaptiveStep {
  state: AssessmentEngineState
  nextItem: AssessmentItem | null
  shouldComplete: boolean
}

export const advanceAssessment = (
  state: AssessmentEngineState,
  currentItem: AssessmentItem,
  response: AssessmentResponseEvent,
  administeredItemIds: string[],
  discardedItemIds: string[],
): AdaptiveStep => {
  const nextState: AssessmentEngineState = {
    ...state,
    errorEvidence: { ...state.errorEvidence },
    evaluatedBySkill: { ...state.evaluatedBySkill },
    correctBySkill: { ...state.correctBySkill },
    completedSkillIds: [...state.completedSkillIds],
  }

  if (response.isEvaluable) {
    nextState.evaluatedBySkill[currentItem.skillId] = (nextState.evaluatedBySkill[currentItem.skillId] ?? 0) + 1
    if (response.isCorrect) {
      nextState.correctBySkill[currentItem.skillId] = (nextState.correctBySkill[currentItem.skillId] ?? 0) + 1
      nextState.consecutiveIndependentCorrect += 1
    } else {
      nextState.consecutiveIndependentCorrect = 0
      for (const code of response.observedErrorCodes) {
        nextState.errorEvidence[code] = (nextState.errorEvidence[code] ?? 0) + 1
      }
    }
  }

  const evaluatedCount = Object.values(nextState.evaluatedBySkill).reduce((sum, count) => sum + count, 0)
  if (evaluatedCount >= assessmentPolicy.commonScreeningMaxItems) {
    return { state: nextState, nextItem: null, shouldComplete: true }
  }

  if (nextState.stage === 'screening') {
    nextState.screeningSkillIndex += 1
    if (nextState.screeningSkillIndex >= commonScreeningSkillIds.length) {
      nextState.stage = 'branch'
      nextState.screeningSkillIndex = commonScreeningSkillIds.length - 1
      const lowestAccuracySkill = Object.entries(nextState.evaluatedBySkill)
        .filter(([, count]) => count > 0)
        .sort((left, right) => {
          const leftAccuracy = (nextState.correctBySkill[left[0]] ?? 0) / left[1]
          const rightAccuracy = (nextState.correctBySkill[right[0]] ?? 0) / right[1]
          return leftAccuracy - rightAccuracy
        })[0]?.[0]
      if (lowestAccuracySkill) {
        nextState.currentSkillId = lowestAccuracySkill
        nextState.currentDifficultyRank = 1
        const branchItem = selectAvailable(lowestAccuracySkill, 1, administeredItemIds, discardedItemIds)
        if (branchItem) return { state: nextState, nextItem: branchItem, shouldComplete: false }
      }
    } else {
      nextState.currentSkillId = commonScreeningSkillIds[nextState.screeningSkillIndex] ?? currentItem.skillId
      nextState.currentDifficultyRank = 1
      const screeningItem = selectAvailable(nextState.currentSkillId, 1, administeredItemIds, discardedItemIds)
      if (screeningItem) return { state: nextState, nextItem: screeningItem, shouldComplete: false }
    }
  }

  let targetSkillId = currentItem.skillId
  let targetDifficulty = currentItem.difficultyRank
  if (response.isEvaluable && response.isCorrect) {
    if (nextState.consecutiveIndependentCorrect >= assessmentPolicy.consecutiveIndependentCorrectToAdvance) {
      targetDifficulty = Math.min(5, targetDifficulty + 1)
      nextState.consecutiveIndependentCorrect = 0
    }
  } else if (response.isEvaluable) {
    const repeatedError = response.observedErrorCodes.some(
      (code) => (nextState.errorEvidence[code] ?? 0) >= assessmentPolicy.repeatedErrorEvidenceCount,
    )
    if (repeatedError) {
      const prerequisite = skillById.get(currentItem.skillId)?.prerequisiteSkillIds[0]
      if (prerequisite) targetSkillId = prerequisite
      else targetDifficulty = Math.max(1, targetDifficulty - 1)
    }
  }

  nextState.currentSkillId = targetSkillId
  nextState.currentDifficultyRank = targetDifficulty
  let nextItem = selectAvailable(targetSkillId, targetDifficulty, administeredItemIds, discardedItemIds)
  if (!nextItem) {
    const fallbackSkills = commonScreeningSkillIds.filter((skillId) => skillId !== targetSkillId)
    nextItem = fallbackSkills
      .map((skillId) => selectAvailable(skillId, 2, administeredItemIds, discardedItemIds))
      .find((item): item is AssessmentItem => item !== null) ?? null
  }

  const shouldComplete =
    !nextItem || (evaluatedCount >= assessmentPolicy.commonScreeningTargetItems && nextState.stage === 'branch')
  return { state: nextState, nextItem: shouldComplete ? null : nextItem, shouldComplete }
}

