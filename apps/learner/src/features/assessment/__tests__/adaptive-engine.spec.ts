import { describe, expect, it } from 'vitest'
import { assessmentItems } from '../data/assessment-items'
import { createInitialEngineState, selectParallelAssessmentItem } from '../engine/adaptive-engine'

describe('adaptive item selection', () => {
  it('starts with common screening state', () => {
    const state = createInitialEngineState()
    expect(state.stage).toBe('screening')
    expect(state.currentSkillId).toBe('phoneme-initial')
  })

  it('does not reuse a discarded item when resuming', () => {
    const item = assessmentItems.find((value) =>
      assessmentItems.some((candidate) => candidate.id !== value.id && candidate.parallelGroupId === value.parallelGroupId),
    )
    expect(item).toBeDefined()
    if (!item) return
    const parallel = selectParallelAssessmentItem(item, [], [item.id])
    expect(parallel?.id).not.toBe(item.id)
    expect(parallel?.skillId).toBe(item.skillId)
  })
})


