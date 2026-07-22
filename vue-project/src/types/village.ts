export type VillageItemKind = 'decoration' | 'character'

export interface VillageItem {
  id: string
  name: string
  image: string
  kind: VillageItemKind
  price?: number
  category?: string
  storyTitle?: string
  unlocked?: boolean
}

export interface PlacedVillageItem {
  itemId: string
  x: number
  y: number
}
