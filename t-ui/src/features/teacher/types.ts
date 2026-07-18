export interface Student {
  id: number
  name: string
  age: number
  birthDate: string
  gender: '남자' | '여자'
  phone: string
  school: string
  guardianName: string
  guardianRelation: string
  guardianPhone: string
  guardianEmail: string
  address: string
  lastTestDate: string
  totalLearningTime: string
  latestTraining: string
  lastAccess: string
  learningStartDate: string
  weeklyAttendance: string
}

export interface CurriculumItem {
  id: number
  category: string
  order: number
  title: string
  achievement: number
}

export interface TrainingSession {
  id: number
  title: string
  date: string
  achievement: number
  curriculum: string
  summary: string
}
