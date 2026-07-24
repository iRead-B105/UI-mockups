import { computed, ref } from 'vue'
import {
  learnerSessionStudents,
  type LearnerSessionStudent,
} from '../data/learnerSessionMock'

export type LearnerInputMode = 'gaze' | 'pointer'
export type CalibrationStatus = 'not_started' | 'success' | 'fallback'

interface LearnerAccessState {
  educatorId: string | null
  educatorName: string | null
  selectedStudentId: string | null
  calibrationStatus: CalibrationStatus
  inputMode: LearnerInputMode | null
  calibrationCompletedAt: string | null
  readyNoticeAcknowledged: boolean
}

const STORAGE_KEY = 'iread-learner-access-session-v1'

const createEmptyState = (): LearnerAccessState => ({
  educatorId: null,
  educatorName: null,
  selectedStudentId: null,
  calibrationStatus: 'not_started',
  inputMode: null,
  calibrationCompletedAt: null,
  readyNoticeAcknowledged: false,
})

const parseStoredState = (): LearnerAccessState => {
  if (typeof window === 'undefined') return createEmptyState()

  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<LearnerAccessState>
    const selectedStudentExists = learnerSessionStudents.some(
      (student) => student.id === saved.selectedStudentId,
    )
    const calibrationStatus: CalibrationStatus =
      saved.calibrationStatus === 'success' || saved.calibrationStatus === 'fallback'
        ? saved.calibrationStatus
        : 'not_started'
    const inputMode: LearnerInputMode | null =
      saved.inputMode === 'gaze' || saved.inputMode === 'pointer' ? saved.inputMode : null

    return {
      educatorId: typeof saved.educatorId === 'string' ? saved.educatorId : null,
      educatorName: typeof saved.educatorName === 'string' ? saved.educatorName : null,
      selectedStudentId: selectedStudentExists ? saved.selectedStudentId ?? null : null,
      calibrationStatus: selectedStudentExists ? calibrationStatus : 'not_started',
      inputMode: selectedStudentExists ? inputMode : null,
      calibrationCompletedAt:
        selectedStudentExists && typeof saved.calibrationCompletedAt === 'string'
          ? saved.calibrationCompletedAt
          : null,
      readyNoticeAcknowledged:
        selectedStudentExists
        && calibrationStatus !== 'not_started'
        && saved.readyNoticeAcknowledged === true,
    }
  } catch {
    return createEmptyState()
  }
}

const state = ref<LearnerAccessState>(parseStoredState())

const persist = () => {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
}

const educatorAuthenticated = computed(() => Boolean(state.value.educatorId))
const selectedStudent = computed<LearnerSessionStudent | null>(() => (
  learnerSessionStudents.find((student) => student.id === state.value.selectedStudentId) ?? null
))
const calibrationComplete = computed(() => (
  state.value.calibrationStatus === 'success' || state.value.calibrationStatus === 'fallback'
))
const learnerSessionReady = computed(() => (
  educatorAuthenticated.value
  && Boolean(selectedStudent.value)
  && calibrationComplete.value
  && state.value.readyNoticeAcknowledged
))

export const useLearnerAccessSession = () => {
  const load = () => {
    state.value = parseStoredState()
    return state.value
  }

  const login = (educatorId: string) => {
    const normalizedId = educatorId.trim()
    state.value = {
      ...createEmptyState(),
      educatorId: normalizedId,
      educatorName: normalizedId,
    }
    persist()
  }

  const logout = () => {
    state.value = createEmptyState()
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY)
  }

  const selectStudent = (studentId: string) => {
    const student = learnerSessionStudents.find((item) => item.id === studentId)
    if (!student || !educatorAuthenticated.value) return null

    state.value = {
      ...state.value,
      selectedStudentId: student.id,
      calibrationStatus: 'not_started',
      inputMode: null,
      calibrationCompletedAt: null,
      readyNoticeAcknowledged: false,
    }
    persist()
    return student
  }

  const saveCalibration = (inputMode: LearnerInputMode) => {
    if (!selectedStudent.value) return
    state.value = {
      ...state.value,
      calibrationStatus: inputMode === 'gaze' ? 'success' : 'fallback',
      inputMode,
      calibrationCompletedAt: new Date().toISOString(),
      readyNoticeAcknowledged: false,
    }
    persist()
  }

  const acknowledgeReadyNotice = () => {
    if (!calibrationComplete.value) return
    state.value = {
      ...state.value,
      readyNoticeAcknowledged: true,
    }
    persist()
  }

  return {
    state,
    students: learnerSessionStudents,
    educatorAuthenticated,
    selectedStudent,
    calibrationComplete,
    learnerSessionReady,
    load,
    login,
    logout,
    selectStudent,
    saveCalibration,
    acknowledgeReadyNotice,
  }
}
