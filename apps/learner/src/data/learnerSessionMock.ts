export interface LearnerSessionStudent {
  id: string
  name: string
  age: 6 | 7 | 8
  gradeLabel: string
  groupLabel: string
  learnerCode: string
  lastSessionLabel: string
  avatarTone: 'coral' | 'blue' | 'green'
}

export const learnerSessionStudents: LearnerSessionStudent[] = [
  {
    id: 'learner-yoon',
    name: '윤정',
    age: 7,
    gradeLabel: '초등 1학년',
    groupLabel: '햇살반',
    learnerCode: 'L-001',
    lastSessionLabel: '오늘 첫 회기',
    avatarTone: 'coral',
  },
  {
    id: 'learner-minjun',
    name: '민준',
    age: 8,
    gradeLabel: '초등 2학년',
    groupLabel: '나무반',
    learnerCode: 'L-002',
    lastSessionLabel: '마지막 학습 2일 전',
    avatarTone: 'blue',
  },
  {
    id: 'learner-seoyun',
    name: '서윤',
    age: 6,
    gradeLabel: '취학 준비',
    groupLabel: '새싹반',
    learnerCode: 'L-003',
    lastSessionLabel: '마지막 학습 5일 전',
    avatarTone: 'green',
  },
]
