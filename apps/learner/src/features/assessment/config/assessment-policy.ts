import type { AssessmentPolicy } from '../types'

// 수치는 테스트 운영 후 조정해야 하는 미확정 정책이다.
export const assessmentPolicy: AssessmentPolicy = {
  version: 'draft-2026-07-22',
  status: 'draft',
  commonScreeningTargetItems: 20,
  commonScreeningMaxItems: 25,
  domainMinEvaluableItems: 5,
  maxTargetAudioReplay: 1,
  maxInstructionRepeat: 1,
  repeatedErrorEvidenceCount: 2,
  consecutiveIndependentCorrectToAdvance: 2,
  consecutiveNoResponsePause: 3,
  stableAccuracyReference: 0.8,
  practiceAccuracyReference: 0.5,
  progressAnchorItemRatio: 0.2,
  speechInputQualityThreshold: 0.55,
  neutralFeedbackDurationMs: 700,
  // 실제 입력 장치가 연결되기 전까지 문항 흐름을 끝까지 확인하기 위한 목업 전용 설정이다.
  mockNavigationEnabled: true,
}

