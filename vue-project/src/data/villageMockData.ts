import type { VillageItem } from '../types/village'
import bench from '../assets/village/village_bench.png'
import flowerBed from '../assets/village/village_flower_bed.png'
import gazebo from '../assets/village/village_gazebo.png'
import lamp from '../assets/village/village_street_lamp.png'
import mailbox from '../assets/village/village_mailbox.png'
import rabbit from '../assets/village/rabbit.png'
import crocodile from '../assets/village/crocodile.png'
import ant from '../assets/village/ant.png'
import lion from '../assets/village/lion.png'
import penguin from '../assets/village/penguin.png'

export const shopItems: VillageItem[] = [
  { id: 'flower-bed', name: '꽃밭', image: flowerBed, kind: 'decoration', price: 50, category: '꽃' },
  { id: 'wood-bench', name: '나무 벤치', image: bench, kind: 'decoration', price: 80, category: '가구' },
  { id: 'street-lamp', name: '마을 가로등', image: lamp, kind: 'decoration', price: 100, category: '조명' },
  { id: 'mailbox', name: '빨간 우체통', image: mailbox, kind: 'decoration', price: 120, category: '장식' },
  { id: 'gazebo', name: '포근한 정자', image: gazebo, kind: 'decoration', price: 220, category: '휴식' },
]

export const storyFriends: VillageItem[] = [
  { id: 'rabbit', name: '토리', image: rabbit, kind: 'character', storyTitle: '토리의 책 소풍', unlocked: true },
  { id: 'crocodile', name: '초록이', image: crocodile, kind: 'character', storyTitle: '초록이의 새 책', unlocked: true },
  { id: 'ant', name: '단단이', image: ant, kind: 'character', storyTitle: '개미와 베짱이', unlocked: true },
  { id: 'lion', name: '해님이', image: lion, kind: 'character', storyTitle: '용감한 사자의 약속', unlocked: false },
  { id: 'penguin', name: '보들이', image: penguin, kind: 'character', storyTitle: '눈 나라의 편지', unlocked: false },
]

export const allVillageItems = [...shopItems, ...storyFriends]
