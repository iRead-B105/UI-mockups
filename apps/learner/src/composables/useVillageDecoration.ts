import { computed, ref, watch } from 'vue'
import { allVillageItems, storyFriends } from '../data/villageMockData'
import type { PlacedVillageItem, VillageItem } from '../types/village'

const STORAGE_KEY = 'iread-village-free-placement-v2'

interface StoredVillageState { points: number; owned: string[]; placed: PlacedVillageItem[] }

const defaultState: StoredVillageState = {
  points: 1250,
  owned: ['wood-bench', 'flower-bed'],
  placed: [],
}

const loadState = (): StoredVillageState => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? { ...defaultState, ...JSON.parse(value) } : { ...defaultState, owned: [...defaultState.owned], placed: [] }
  } catch {
    return { ...defaultState, owned: [...defaultState.owned], placed: [] }
  }
}

const initial = loadState()
const points = ref(initial.points)
const ownedItemIds = ref<string[]>(initial.owned)
const placedItems = ref<PlacedVillageItem[]>(initial.placed)
const selectedItem = ref<VillageItem | null>(null)
const toast = ref('')
const clamp = (value: number) => Math.min(94, Math.max(6, value))

storyFriends.filter((friend) => friend.unlocked).forEach((friend) => {
  if (!ownedItemIds.value.includes(friend.id)) ownedItemIds.value.push(friend.id)
})

watch([points, ownedItemIds, placedItems], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ points: points.value, owned: ownedItemIds.value, placed: placedItems.value }))
}, { deep: true })

const showToast = (message: string) => {
  toast.value = message
  window.setTimeout(() => { if (toast.value === message) toast.value = '' }, 2200)
}
const isOwned = (id: string) => ownedItemIds.value.includes(id)
const isPlaced = (id: string) => placedItems.value.some((placed) => placed.itemId === id)

const purchase = (item: VillageItem) => {
  if (isOwned(item.id)) return showToast('이미 가지고 있는 아이템이에요.')
  if ((item.price ?? 0) > points.value) return showToast('포인트가 부족해요.')
  points.value -= item.price ?? 0
  ownedItemIds.value.push(item.id)
  showToast(`${item.name}을 구매했어요!`)
}

const beginPlacement = (item: VillageItem) => {
  if (item.kind === 'character' && !item.unlocked) return showToast('이야기를 완료하면 만날 수 있어요.')
  if (item.kind === 'decoration' && !isOwned(item.id)) return showToast('먼저 아이템을 구매해 주세요.')
  selectedItem.value = item
  showToast(`${item.name}을 잡고 마을로 끌어다 놓아 주세요.`)
}

const placeAt = (x: number, y: number) => {
  if (!selectedItem.value) return
  const item = selectedItem.value
  placedItems.value = placedItems.value.filter((placed) => placed.itemId !== item.id)
  placedItems.value.push({ itemId: item.id, x: clamp(x), y: clamp(y) })
  selectedItem.value = null
  showToast(`${item.name}을 마을에 놓았어요!`)
}

const moveItem = (itemId: string, x: number, y: number) => {
  placedItems.value = placedItems.value.map((placed) => placed.itemId === itemId ? { ...placed, x: clamp(x), y: clamp(y) } : placed)
}

const selectPlaced = (itemId: string) => {
  const item = allVillageItems.find((candidate) => candidate.id === itemId)
  if (item) selectedItem.value = item
}

const removeSelected = () => {
  if (!selectedItem.value) return
  const item = selectedItem.value
  placedItems.value = placedItems.value.filter((placed) => placed.itemId !== item.id)
  selectedItem.value = null
  showToast(`${item.name}을 보관함으로 옮겼어요.`)
}

const removePlaced = (itemId: string) => {
  const item = allVillageItems.find((candidate) => candidate.id === itemId)
  placedItems.value = placedItems.value.filter((placed) => placed.itemId !== itemId)
  if (selectedItem.value?.id === itemId) selectedItem.value = null
  showToast(`${item?.name ?? '아이템'}을 보관함으로 옮겼어요.`)
}

const cancelPlacement = () => { selectedItem.value = null }
const placedVillageItems = computed(() => placedItems.value.flatMap((placed) => {
  const item = allVillageItems.find((candidate) => candidate.id === placed.itemId)
  return item ? [{ ...placed, item }] : []
}))

export function useVillageDecoration() {
  return {
    points, ownedItemIds, placedItems, placedVillageItems, selectedItem, toast,
    isOwned, isPlaced, purchase, beginPlacement, placeAt, moveItem,
    selectPlaced, removeSelected, removePlaced, cancelPlacement, showToast,
  }
}
