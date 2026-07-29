/**
 * 아동용 UI 데이터 접근 경계입니다.
 *
 * 현재는 learnerRuntimeMock을 반환합니다. 백엔드 연결 시 각 함수 내부만
 * API 요청으로 교체하면 뷰와 컴포넌트는 수정하지 않아도 됩니다.
 */

import {
  learnerRuntimeMock,
  type MockCurrentCurriculum,
  type MockGrowthArea,
  type MockLinkedStudent,
  type MockStoryDetail,
  type MockStorySession,
  type MockStoryTemplate,
} from '@/mocks/learnerRuntimeMock'
import type { VillageItem } from '@/types/village'

const replaceStudentName = (value: string, studentName: string) =>
  value.replaceAll('{studentName}', studentName)

export const getCachedStudent = (): MockLinkedStudent => {
  try {
    const cached = JSON.parse(localStorage.getItem('iread-user') ?? '{}') as Partial<MockLinkedStudent>
    if (typeof cached.studentId === 'string' && typeof cached.name === 'string') {
      return {
        studentId: cached.studentId,
        name: cached.name,
        age: typeof cached.age === 'number' ? cached.age : 0,
        profileColor: typeof cached.profileColor === 'string' ? cached.profileColor : '#f18ca4',
        profileImageUrl: typeof cached.profileImageUrl === 'string' ? cached.profileImageUrl : null,
      }
    }
  } catch {
    // 손상된 로컬 캐시는 목업 기본 아동으로 복구합니다.
  }

  return learnerRuntimeMock.auth.linkedStudents.find(
    (student) => student.studentId === learnerRuntimeMock.auth.selectedStudentId,
  )!
}

// POST /api/auth/app/teacher-login 응답의 linkedStudents로 교체
export const fetchLinkedStudents = async (): Promise<MockLinkedStudent[]> =>
  learnerRuntimeMock.auth.linkedStudents.map((student) => ({ ...student }))

export const saveTeacherBootstrapSession = () => {
  sessionStorage.setItem(
    'iread-teacher-session',
    learnerRuntimeMock.auth.teacherSessionToken,
  )
}

// POST /api/auth/app/student-login 성공 응답 저장
export const saveSelectedStudentSession = (student: MockLinkedStudent) => {
  localStorage.setItem('iread-auth', JSON.stringify({
    accessToken: learnerRuntimeMock.auth.learningAccessToken,
    studentId: student.studentId,
  }))
  localStorage.setItem('iread-user', JSON.stringify(student))
}

// GET /api/app/training/{studentId}/current-curriculum
export const fetchCurrentCurriculum = async (): Promise<MockCurrentCurriculum> => ({
  ...learnerRuntimeMock.currentCurriculum,
  trainings: learnerRuntimeMock.currentCurriculum.trainings.map((training) => ({ ...training })),
})

// GET /api/app/story/{studentId}
export const fetchStoryLibrary = async (): Promise<{
  stories: MockStorySession[]
  templates: MockStoryTemplate[]
}> => ({
  stories: learnerRuntimeMock.storyLibrary.stories.map((story) => ({ ...story })),
  templates: learnerRuntimeMock.storyLibrary.templates.map((template) => ({ ...template })),
})

// GET /api/app/story/{studentId}/{storyId}/lines
export const getStoryDetail = (storyId: string): MockStoryDetail => {
  const storyDetails: Record<string, MockStoryDetail> = learnerRuntimeMock.storyDetails
  const detail = storyDetails[storyId] ?? storyDetails.alice!

  return {
    ...detail,
    pages: detail.pages.map((page) => ({ ...page, lines: [...page.lines] })),
  }
}

// GET /api/app/student/{studentId}/growth
export const fetchGrowthAreas = async (): Promise<MockGrowthArea[]> =>
  learnerRuntimeMock.growthAreas.map((area) => ({ ...area }))

// GET /api/app/mypage/character
export const fetchStoryFriends = async (): Promise<VillageItem[]> =>
  learnerRuntimeMock.storyFriends.map((friend) => ({ ...friend }))

// GET /api/app/gaze/device/status와 로컬 마이크 권한 확인 결과의 초기 목업
export const getInitialDeviceStatus = () => ({ ...learnerRuntimeMock.deviceStatus })

export const personalizeRuntimeValue = <T>(value: T): T => {
  const studentName = getCachedStudent().name

  const visit = (item: unknown): unknown => {
    if (typeof item === 'string') return replaceStudentName(item, studentName)
    if (Array.isArray(item)) return item.map(visit)
    if (item && typeof item === 'object') {
      return Object.fromEntries(
        Object.entries(item).map(([key, child]) => [key, visit(child)]),
      )
    }
    return item
  }

  return visit(value) as T
}
