import type { AssessmentResult, AssessmentSession } from '../types'

export interface AssessmentRepository {
  getSession(learnerId: string): AssessmentSession | null
  saveSession(session: AssessmentSession): void
  clearSession(learnerId: string): void
  getResults(learnerId: string): AssessmentResult[]
  saveResult(result: AssessmentResult): void
}

const sessionKey = (learnerId: string) => `iread:assessment:session:${learnerId}`
const resultKey = (learnerId: string) => `iread:assessment:results:${learnerId}`

const parse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export class LocalAssessmentRepository implements AssessmentRepository {
  getSession(learnerId: string): AssessmentSession | null {
    return parse<AssessmentSession | null>(window.localStorage.getItem(sessionKey(learnerId)), null)
  }

  saveSession(session: AssessmentSession): void {
    window.localStorage.setItem(sessionKey(session.learnerId), JSON.stringify(session))
  }

  clearSession(learnerId: string): void {
    window.localStorage.removeItem(sessionKey(learnerId))
  }

  getResults(learnerId: string): AssessmentResult[] {
    return parse<AssessmentResult[]>(window.localStorage.getItem(resultKey(learnerId)), [])
  }

  saveResult(result: AssessmentResult): void {
    const results = this.getResults(result.learnerId).filter((value) => value.sessionId !== result.sessionId)
    results.unshift(result)
    window.localStorage.setItem(resultKey(result.learnerId), JSON.stringify(results))
  }
}

export const assessmentRepository: AssessmentRepository = new LocalAssessmentRepository()


