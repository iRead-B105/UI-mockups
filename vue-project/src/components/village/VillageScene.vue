<script setup lang="ts">
// 마을 씬: 배경 위에 "학습자가 직접 배치한" 아이템만 보여 줍니다.
// 처음에는 어떤 에셋도 배치되어 있지 않은 빈 캔버스(0) 상태에서 시작하며,
// 학습자가 포인트 상점/이야기 친구들에서 골라 직접 끌어다 놓습니다.
// 과거 버전에는 길/울타리/벤치/나무/오두막/분수 등 고정 장식이 처음부터 깔려 있었으나
// "0에서부터 직접 배치" 요청에 따라 모두 제거했습니다. (에셋 파일 자체는 상점용으로 보존)
import { ref } from 'vue'
import type { PlacedVillageItem, VillageItem } from '../../types/village'
import background from '../../assets/village/background.png'

interface PositionedVillageItem extends PlacedVillageItem {
  item: VillageItem
}

defineProps<{
  positionedItems: PositionedVillageItem[]
  selectedItem: VillageItem | null
}>()

const emit = defineEmits<{
  move: [itemId: string, x: number, y: number]
  moved: [itemName: string]
  selectPlaced: [itemId: string]
  remove: [itemId: string]
}>()

const sceneRef = ref<HTMLElement | null>(null)
const draggingId = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

const itemStyle = (placed: PositionedVillageItem) => ({ left: `${placed.x}%`, top: `${placed.y}%` })

const positionFromPointer = (event: PointerEvent) => {
  const rect = sceneRef.value?.getBoundingClientRect()
  if (!rect) return null
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

const startDrag = (event: PointerEvent, placed: PositionedVillageItem) => {
  if (event.button !== 0) return
  event.preventDefault()
  draggingId.value = placed.itemId
  dragStart.value = { x: event.clientX, y: event.clientY }
  hasMoved.value = false
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

const dragItem = (event: PointerEvent, placed: PositionedVillageItem) => {
  if (draggingId.value !== placed.itemId) return
  if (Math.hypot(event.clientX - dragStart.value.x, event.clientY - dragStart.value.y) > 4) hasMoved.value = true
  const position = positionFromPointer(event)
  if (position) emit('move', placed.itemId, position.x, position.y)
}

const finishDrag = (event: PointerEvent, placed: PositionedVillageItem) => {
  if (draggingId.value !== placed.itemId) return
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  draggingId.value = null
  if (hasMoved) emit('moved', placed.item.name)
  else emit('selectPlaced', placed.itemId)
}
</script>

<template>
  <div ref="sceneRef" class="scene" :class="{ 'scene--placing': selectedItem }" :style="{ backgroundImage: `url(${background})` }">
    <div class="color-wash" aria-hidden="true"></div>

    <!-- 빈 캔버스 안내: 아직 아무것도 배치하지 않았을 때 -->
    <div v-if="positionedItems.length === 0" class="scene-empty" role="note">
      <strong>나만의 마을을 꾸며봐요!</strong>
      <span>아래에서 아이템을 골라 끌어다 놓아 보세요.</span>
    </div>

    <!-- 학습자가 직접 배치한 아이템만 표시. 최초에는 비어 있음(0) -->
    <!-- 한 번 누르면 선택 → 해당 자리에 × 삭제 버튼이 나타나 지울 수 있음 -->
    <div
      v-for="placed in positionedItems"
      :key="placed.itemId"
      class="placed-item"
      :class="[
        `placed-item--${placed.item.kind}`,
        { 'placed-item--dragging': draggingId === placed.itemId, 'placed-item--selected': selectedItem?.id === placed.itemId },
      ]"
      :style="itemStyle(placed)"
      role="button"
      tabindex="0"
      :aria-label="`${placed.item.name} — 끌어서 이동, 다시 눌러 삭제`"
      @pointerdown="startDrag($event, placed)"
      @pointermove="dragItem($event, placed)"
      @pointerup="finishDrag($event, placed)"
      @pointercancel="draggingId = null"
      @keydown.enter.prevent="emit('selectPlaced', placed.itemId)"
      @keydown.space.prevent="emit('selectPlaced', placed.itemId)"
    >
      <img :src="placed.item.image" :alt="placed.item.name" draggable="false" />
      <span>끌어서 이동</span>
      <button
        v-if="selectedItem?.id === placed.itemId"
        type="button"
        class="placed-delete"
        :aria-label="`${placed.item.name} 마을에서 삭제`"
        @pointerdown.stop
        @click.stop="emit('remove', placed.itemId)"
      >×</button>
    </div>

    <div v-if="selectedItem" class="free-placement-hint" aria-hidden="true">마을 어디든 자유롭게 놓을 수 있어요</div>
  </div>
</template>

<style scoped>
.scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}
.color-wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(0, 168, 244, 0.16) 0 29%, rgba(151, 213, 34, 0.16) 30% 100%);
  mix-blend-mode: multiply;
}
.scene--placing {
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, 0.75);
}

.placed-item {
  position: absolute;
  z-index: 10;
  width: clamp(208px, 18vw, 328px);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.placed-item--decoration {
  width: clamp(96px, 8.4vw, 154px);
}
.placed-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: saturate(1.12) drop-shadow(0 10px 7px rgba(60, 80, 20, 0.18));
  transition: transform 0.18s ease;
}
.placed-item span {
  position: absolute;
  left: 50%;
  bottom: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(28, 70, 76, 0.82);
  color: white;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 5px);
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.placed-item:hover span,
.placed-item:focus-visible span,
.placed-item--dragging span {
  opacity: 1;
  transform: translate(-50%, 0);
}
.placed-item:hover img {
  transform: scale(1.04);
}
.placed-item--dragging {
  z-index: 20;
  cursor: grabbing;
}
.placed-item--dragging img {
  transform: scale(1.1);
  filter: saturate(1.2) drop-shadow(0 16px 10px rgba(37, 73, 28, 0.3));
}
.placed-item:focus-visible {
  outline: 5px solid #ffd43d;
  outline-offset: 2px;
  border-radius: 50%;
}

/* 선택된 배치 아이템: 살짝 커지고 흰빛 강조 */
.placed-item--selected {
  z-index: 15;
}
.placed-item--selected img {
  transform: scale(1.05);
  filter: saturate(1.18) drop-shadow(0 0 6px rgba(255, 255, 255, 0.95)) drop-shadow(0 10px 7px rgba(60, 80, 20, 0.18));
}

/* 선택 시 해당 자리에 뜨는 삭제 버튼 */
.placed-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  width: clamp(40px, 4vw, 56px);
  height: clamp(40px, 4vw, 56px);
  display: grid;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--learner-color-error);
  color: #fff;
  font-size: clamp(22px, 2.4vw, 32px);
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
  transition: transform var(--learner-duration-fast), background var(--learner-duration-fast);
}
.placed-delete:hover {
  background: #d85555;
  transform: scale(1.08);
}
.placed-delete:focus-visible {
  outline: 3px solid #ffd43d;
  outline-offset: 2px;
}

.free-placement-hint {
  position: absolute;
  left: 50%;
  bottom: 90px;
  z-index: 25;
  padding: 10px 20px;
  border: 3px dashed white;
  border-radius: 999px;
  background: rgba(67, 142, 54, 0.72);
  color: white;
  font-size: 16px;
  font-weight: 900;
  transform: translateX(-50%);
  pointer-events: none;
}

/* 빈 캔버스 안내: 아직 아무것도 배치하지 않았을 때 */
.scene-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 5;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  color: #2f4a63;
}
.scene-empty strong {
  display: block;
  font-family: var(--learner-font-display);
  font-size: clamp(26px, 3vw, 40px);
  font-weight: 900;
}
.scene-empty span {
  display: block;
  margin-top: 8px;
  font-size: clamp(16px, 1.6vw, 22px);
  font-weight: 700;
  opacity: 0.85;
}

@media (prefers-reduced-motion: reduce) {
  .placed-item img,
  .placed-item span {
    transition: none;
  }
}
</style>
