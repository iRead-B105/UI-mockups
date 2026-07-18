import type { CurriculumItem, Student, TrainingSession } from './types'

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
    lastTestDate: '2026-07-17',
    totalLearningTime: '33시간',
    latestTraining: '문장 이해력 향상',
    lastAccess: '어제 18:40',
    learningStartDate: '2026-06-21',
    weeklyAttendance: '67% (2일/3일)',
  },
]

export const selectedStudent = students[0]!

export const curriculumItems: CurriculumItem[] = [
  { id: 1, category: '파닉스', order: 1, title: 'ㄱㄴㄷㄹㅁㅂ 받침 훈련', achievement: 100 },
  { id: 2, category: '파닉스', order: 2, title: 'ㄲㅆ 받침 훈련', achievement: 75 },
  { id: 3, category: '유창성', order: 3, title: '짧은 문장 유창하게 읽기', achievement: 62 },
  { id: 4, category: '이해력', order: 4, title: '핵심 문장 찾기', achievement: 48 },
]

export const recommendedCurriculum = [
  '파닉스 ㄱㄴㄷㄹㅁㅂ 받침 훈련',
  '파닉스 ㄲㅆ 받침 훈련',
  '짧은 문장 소리 내어 읽기',
  '핵심 문장 찾기',
]

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

export const learningLogs = [
  ['2026-07-14 15:44', '커리큘럼 전체', '종료', '88%'],
  ['2026-07-14 15:44', '훈련(음운 연습)', '종료', '100%'],
  ['2026-07-14 15:39', '훈련(음운 연습)', '시작', 'N/A'],
  ['2026-07-14 15:38', '훈련(파닉스)', '종료', '50%'],
]
