export interface MainMapMenuItem {
  id: 'growth' | 'game' | 'letter' | 'challenge'
  label: string
  color: string
  position: { left: string; top: string }
}

export const mainMapMenu: MainMapMenuItem[] = [
  { id: 'growth', label: '나의 성장', color: 'var(--learner-home-growth)', position: { left: '23%', top: '27%' } },
  { id: 'game', label: '이야기 나라', color: 'var(--learner-home-story)', position: { left: '50%', top: '15%' } },
  { id: 'letter', label: '글자 연습', color: 'var(--learner-home-training)', position: { left: '78%', top: '29%' } },
  { id: 'challenge', label: '실력 도전', color: 'var(--learner-home-challenge)', position: { left: '52%', top: '56%' } },
]
