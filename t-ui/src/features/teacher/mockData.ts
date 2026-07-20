// import type은 실행 코드가 아니라 TypeScript의 자료형 검사에만 사용하는 가져오기입니다.
import type {
  CurriculumItem,
  RecommendedCurriculumItem,
  Student,
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

// 학습 로그 표의 행이며, 내부 배열은 날짜·활동·상태·점수 순서입니다.
export const learningLogs = [
  ['2026-07-14 15:44', '커리큘럼 전체', '종료', '88%'],
  ['2026-07-14 15:44', '훈련(음운 연습)', '종료', '100%'],
  ['2026-07-14 15:39', '훈련(음운 연습)', '시작', 'N/A'],
  ['2026-07-14 15:38', '훈련(파닉스)', '종료', '50%'],
]
