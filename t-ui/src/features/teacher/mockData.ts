// import type은 실행 코드가 아니라 TypeScript의 자료형 검사에만 사용하는 가져오기입니다.
import type {
  CurriculumItem,
  EncouragementMessage,
  GuardianComment,
  LearningEvent,
  LearningRecord,
  RecommendedCurriculumItem,
  ShareLink,
  Student,
  TeacherNote,
  TrainingSession,
} from './types'

// 서버가 연결되지 않은 UI 목업에서 화면을 채우기 위한 가짜 학생 목록입니다.
// Student[]는 배열의 모든 항목이 Student 설계도를 따라야 한다는 의미입니다.
export const students: Student[] = [
  {
    id: 1,
    name: '김OO',
    age: 10,
    birthDate: '2016-04-12',
    gender: '남자',
    phone: '010-1234-5678',
    school: 'OO초등학교',
    guardianName: '이OO',
    guardianRelation: '어머니',
    guardianPhone: '010-1234-5678',
    guardianEmail: 'ssafy123@ssafy.com',
    address: '서울특별시 강남구 테헤란로 212',
    lastLearningDate: '2026-07-18',
    lastTestDate: '2026-07-14',
    totalLearningTime: '13시간',
    latestTraining: '문장 이해력 향상',
    lastAccess: '오늘 09:20',
    learningStartDate: '2026-07-10',
    weeklyAttendance: '33% (1일/3일)',
  },
  {
    id: 2,
    name: '박OO',
    age: 12,
    birthDate: '2014-11-03',
    gender: '여자',
    phone: '010-9876-5432',
    school: 'OO중학교',
    guardianName: '최OO',
    guardianRelation: '아버지',
    guardianPhone: '010-9876-5432',
    guardianEmail: 'guardian@example.com',
    address: '서울특별시 송파구 올림픽로 120',
    lastLearningDate: '2026-07-17',
    lastTestDate: '2026-07-17',
    totalLearningTime: '33시간',
    latestTraining: '문장 이해력 향상',
    lastAccess: '어제 18:40',
    learningStartDate: '2026-06-21',
    weeklyAttendance: '67% (2일/3일)',
  },
]

// 여러 화면이 같은 학생을 표시하도록 목록의 첫 학생을 현재 선택 학생으로 사용합니다.
// 끝의 !는 이 위치에는 값이 반드시 있다고 TypeScript에 알려 주는 표시입니다.
export const selectedStudent = students[0]!

// 커리큘럼 목록과 달성률 표시에 쓰는 목업 데이터입니다.
export const curriculumItems: CurriculumItem[] = [
  { id: 1, category: '음운 인식', order: 1, title: '첫소리와 끝소리 구분', achievement: 92 },
  { id: 2, category: '음운 인식', order: 2, title: '음절 분리와 합성', achievement: 86 },
  { id: 3, category: '파닉스', order: 3, title: 'ㄱㄴㄷㄹㅁㅂ 받침 훈련', achievement: 100 },
  { id: 4, category: '파닉스', order: 4, title: 'ㄲㅆ 받침 훈련', achievement: 75 },
  { id: 5, category: '유창성', order: 5, title: '짧은 문장 유창하게 읽기', achievement: 62 },
  { id: 6, category: '유창성', order: 6, title: '문장 억양과 끊어 읽기', achievement: 57 },
  { id: 7, category: '이해력', order: 7, title: '핵심 문장 찾기', achievement: 48 },
  { id: 8, category: '이해력', order: 8, title: '문맥으로 낱말 뜻 추론', achievement: 41 },
]

// 다음 회차 추천 목록은 실행 횟수와 전체 훈련 id를 함께 보관합니다.
export const recommendedCurriculum: RecommendedCurriculumItem[] = [
  { id: 1, trainingId: 3, category: '파닉스', title: 'ㄱㄴㄷㄹㅁㅂ 받침 훈련', count: 2 },
  { id: 2, trainingId: 4, category: '파닉스', title: 'ㄲㅆ 받침 훈련', count: 1 },
  { id: 3, trainingId: 5, category: '유창성', title: '짧은 문장 유창하게 읽기', count: 1 },
  { id: 4, trainingId: 7, category: '이해력', title: '핵심 문장 찾기', count: 1 },
]

// 훈련 이력 카드에 반복 출력할 세션 목록입니다.
export const trainingSessions: TrainingSession[] = [
  {
    id: 1,
    title: '훈련 1. 받침 소리 구분',
    date: '2026-07-14 15:44',
    achievement: 88,
    curriculum: '파닉스(ㄱㄴㄷㄹㅁㅂ 받침 훈련)',
    summary: '받침이 포함된 낱말 12개 중 10개를 정확하게 읽었습니다.',
  },
  {
    id: 2,
    title: '훈련 2. 짧은 문장 읽기',
    date: '2026-07-14 15:41',
    achievement: 100,
    curriculum: '유창성(짧은 문장 읽기)',
    summary: '문장 속도와 억양이 안정적으로 유지되었습니다.',
  },
  {
    id: 3,
    title: '훈련 3. 핵심 내용 찾기',
    date: '2026-07-14 15:38',
    achievement: 50,
    curriculum: '이해력(핵심 내용 찾기)',
    summary: '핵심어를 찾는 과정에서 교수자의 추가 안내가 필요했습니다.',
  },
]

export const learningRecords: LearningRecord[] = [
  {
    id: 1,
    studentId: 1,
    occurredAt: '2026-07-18 15:44',
    activity: '구름 마을의 비밀 · 받침 소리 구분',
    result: 'completed',
    score: 88,
  },
  {
    id: 2,
    studentId: 1,
    occurredAt: '2026-07-18 15:31',
    activity: '토끼의 우체국 · 짧은 문장 읽기',
    result: 'completed',
    score: 76,
    eventId: 101,
  },
  {
    id: 3,
    studentId: 1,
    occurredAt: '2026-07-16 16:05',
    activity: '바닷속 도서관 · 핵심 내용 찾기',
    result: 'completed',
    score: 64,
    eventId: 102,
  },
  {
    id: 4,
    studentId: 2,
    occurredAt: '2026-07-17 18:20',
    activity: '별빛 캠핑 · 문장 유창하게 읽기',
    result: 'completed',
    score: 91,
  },
]

export const learningEvents: LearningEvent[] = [
  {
    id: 101,
    studentId: 1,
    recordId: 2,
    occurredAt: '2026-07-18 15:34',
    storyTitle: '토끼의 우체국',
    sceneTitle: '편지를 읽어요',
    type: 'speech-recognition-low-confidence',
    retryCount: 2,
    finalSucceeded: true,
    usedSafeFallback: false,
    learningOutcome: 'completed',
    status: 'needs-review',
    issueSegment: '받침이 포함된 짧은 구간',
    recognitionConfidence: 62,
    systemResponse: '속도를 낮춘 문장으로 다시 안내한 뒤 학습을 이어갔습니다.',
  },
  {
    id: 102,
    studentId: 1,
    recordId: 3,
    occurredAt: '2026-07-16 16:12',
    storyTitle: '바닷속 도서관',
    sceneTitle: '다음 장면을 골라요',
    type: 'safety-restriction',
    retryCount: 0,
    finalSucceeded: true,
    usedSafeFallback: true,
    learningOutcome: 'completed',
    status: 'follow-up-needed',
    systemResponse: '중립적인 기본 이야기 분기로 이동해 학습을 마쳤습니다.',
  },
]

export const teacherNotes: TeacherNote[] = [
  {
    id: 201,
    studentId: 1,
    source: 'teacher',
    audience: 'teacher-only',
    status: 'active',
    author: '이OO 선생님',
    text: '글자와 소리의 대응이 빠르게 향상되고 있습니다. 받침이 포함된 문장을 읽을 때 속도가 흔들리는 경향이 있어 반복 연습이 필요합니다.',
    createdAt: '2026-07-18 17:10',
    updatedAt: '2026-07-18 17:10',
  },
]

export const encouragementMessages: EncouragementMessage[] = [
  {
    id: 301,
    studentId: 1,
    source: 'teacher',
    audience: 'child',
    status: 'seen-by-child',
    author: '이OO 선생님',
    originalText: '어려운 받침도 끝까지 읽어 낸 노력이 정말 멋졌어!',
    deliveryText: '어려운 받침도 끝까지 읽어 낸 노력이 정말 멋졌어!',
    deliveryTiming: 'immediate',
    deliveredAt: '2026-07-17 16:42',
    seenAt: '2026-07-17 18:03',
    createdAt: '2026-07-17 16:40',
    updatedAt: '2026-07-17 18:03',
  },
  {
    id: 302,
    studentId: 1,
    source: 'guardian',
    audience: 'child',
    status: 'pending-approval',
    author: '이OO 보호자',
    originalText: '요즘 스스로 책을 펼치는 모습이 대견해. 천천히 해도 괜찮아!',
    deliveryText: '스스로 책을 펼치는 모습이 정말 대견해. 천천히 해도 괜찮아!',
    deliveryTiming: 'next-login',
    createdAt: '2026-07-20 20:14',
    updatedAt: '2026-07-20 20:14',
  },
]

export const guardianComments: GuardianComment[] = [
  {
    id: 401,
    studentId: 1,
    source: 'guardian',
    audience: 'teacher-only',
    status: 'unread',
    author: '이OO 보호자',
    reportVersion: 1,
    text: '집에서도 소리 내어 읽는 시간이 늘었습니다. 다음 단계에서 집에서 도울 방법이 있을까요?',
    createdAt: '2026-07-20 20:09',
    updatedAt: '2026-07-20 20:09',
  },
]

export const activeShareLink: ShareLink = {
  id: 501,
  reportVersionId: 1,
  status: 'active',
  maskedUrl: 'iread.kr/r/••••••8K2P',
  copyValue: 'https://iread.kr/r/mock-8K2P',
  expiresAt: '2026-08-20',
  createdAt: '2026-07-20 18:30',
  firstViewedAt: '2026-07-20 20:02',
  lastViewedAt: '2026-07-20 20:14',
  guardianAuthentication: 'verified',
  guardianContactHint: '010-****-5678',
}
