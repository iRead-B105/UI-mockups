<script setup lang="ts">
import { ref } from 'vue'
import type { PlacedVillageItem, VillageItem } from '../../types/village'
import background from '../../assets/village/village-background-v2.png'

interface PositionedVillageItem extends PlacedVillageItem { item: VillageItem }

defineProps<{ positionedItems: PositionedVillageItem[]; selectedItem: VillageItem | null; unreadLetters: number }>()
const emit = defineEmits<{
  move: [itemId: string, x: number, y: number]
  moved: [itemName: string]
  selectPlaced: [itemId: string]
  remove: [itemId: string]
  openLetters: []
}>()

const sceneRef = ref<HTMLElement | null>(null)
const draggingId = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

const itemStyle = (placed: PositionedVillageItem) => ({
  left: `${placed.x}%`,
  top: `${placed.y}%`,
  zIndex: 20 + Math.round(placed.y),
})

const positionFromPointer = (event: PointerEvent) => {
  const rect = sceneRef.value?.getBoundingClientRect()
  if (!rect) return null
  return { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 }
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
  if (hasMoved.value) emit('moved', placed.item.name)
  else emit('selectPlaced', placed.itemId)
}
</script>

<template>
  <div ref="sceneRef" class="scene" :class="{ 'scene--placing': selectedItem }">
    <img class="scene-background" :src="background" alt="꽃과 나무, 작은 집이 있는 윤정이의 마을" draggable="false" />
    <div class="sun-glow" aria-hidden="true"></div>

    <button class="mailbox-hotspot" type="button" aria-label="우리 마을 편지함 열기" @click="emit('openLetters')">
      <span class="mail-envelope" aria-hidden="true"><i></i></span>
      <strong v-if="unreadLetters > 0">{{ unreadLetters }}</strong>
      <small>편지함</small>
    </button>

    <div
      v-for="placed in positionedItems"
      :key="placed.itemId"
      class="placed-item"
      :class="[`placed-item--${placed.item.kind}`, { 'placed-item--dragging': draggingId === placed.itemId, 'placed-item--selected': selectedItem?.id === placed.itemId }]"
      :style="itemStyle(placed)"
      role="button"
      tabindex="0"
      :aria-label="`${placed.item.name} — 끌어서 이동`"
      @pointerdown="startDrag($event, placed)"
      @pointermove="dragItem($event, placed)"
      @pointerup="finishDrag($event, placed)"
      @pointercancel="draggingId = null"
      @keydown.enter.prevent="emit('selectPlaced', placed.itemId)"
      @keydown.space.prevent="emit('selectPlaced', placed.itemId)"
    >
      <img :src="placed.item.image" :alt="placed.item.name" draggable="false" />
      <button v-if="selectedItem?.id === placed.itemId" class="placed-delete" type="button" :aria-label="`${placed.item.name} 보관함으로 옮기기`" @pointerdown.stop @click.stop="emit('remove', placed.itemId)">×</button>
    </div>

    <div v-if="selectedItem" class="placement-wash" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.scene{position:absolute;inset:0;overflow:hidden;background:#7fd5f6;isolation:isolate}.scene-background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;user-select:none;pointer-events:none}.sun-glow{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 36%,rgba(88,133,29,.06));pointer-events:none}.placement-wash{position:absolute;inset:0;z-index:9;border:5px solid rgba(255,255,255,.88);box-shadow:inset 0 0 50px rgba(255,242,157,.2);pointer-events:none}
.mailbox-hotspot{position:absolute;z-index:15;left:81.7%;top:49%;width:clamp(84px,7vw,118px);height:clamp(102px,9vw,145px);padding:0;border:0;background:transparent;cursor:pointer;transform:translate(-50%,-50%);filter:drop-shadow(0 8px 7px rgba(72,78,32,.2))}.mailbox-hotspot:before{position:absolute;inset:8% 13% 18%;border:4px solid transparent;border-radius:50%;content:'';transition:border-color .18s ease,background .18s ease,transform .18s ease}.mailbox-hotspot:hover:before,.mailbox-hotspot:focus-visible:before{border-color:rgba(255,255,255,.95);background:rgba(255,240,144,.18);transform:scale(1.08)}.mailbox-hotspot:focus-visible{outline:none}.mail-envelope{position:absolute;right:-2px;top:5px;width:44px;height:34px;border:3px solid #d88424;border-radius:9px;background:#fff8d9;box-shadow:0 4px 9px rgba(89,57,17,.18);animation:mail-bob 2.1s ease-in-out infinite}.mail-envelope:before,.mail-envelope:after{position:absolute;top:5px;width:23px;height:3px;background:#e6aa53;content:''}.mail-envelope:before{left:1px;transform:rotate(32deg)}.mail-envelope:after{right:1px;transform:rotate(-32deg)}.mailbox-hotspot strong{position:absolute;right:-11px;top:-7px;min-width:30px;height:30px;display:grid;place-items:center;padding:0 7px;border:3px solid #fff;border-radius:999px;background:#ff6558;color:#fff;font-size:16px;font-weight:900}.mailbox-hotspot small{position:absolute;left:50%;bottom:0;padding:5px 12px;border:3px solid #fff;border-radius:999px;background:rgba(43,95,52,.9);color:#fff;font-size:14px;font-weight:900;white-space:nowrap;transform:translateX(-50%)}
.placed-item{position:absolute;width:clamp(190px,16.5vw,300px);aspect-ratio:1;transform:translate(-50%,-50%);border:0;background:transparent;cursor:grab;touch-action:none;user-select:none}.placed-item--decoration{width:clamp(94px,8vw,148px)}.placed-item img{width:100%;height:100%;object-fit:contain;pointer-events:none;filter:saturate(1.08) drop-shadow(0 12px 8px rgba(55,76,25,.22));transition:transform .18s ease,filter .18s ease}.placed-item:hover img,.placed-item--selected img{transform:scale(1.045);filter:saturate(1.14) drop-shadow(0 0 7px #fff) drop-shadow(0 13px 8px rgba(55,76,25,.25))}.placed-item--dragging{z-index:140!important;cursor:grabbing}.placed-item--dragging img{transform:scale(1.1) rotate(-2deg);filter:saturate(1.18) drop-shadow(0 20px 13px rgba(36,70,22,.32))}.placed-item:focus-visible{outline:5px solid #ffd94b;outline-offset:3px;border-radius:45%}.placed-delete{position:absolute;right:4%;top:4%;width:45px;height:45px;display:grid;place-items:center;border:3px solid #fff;border-radius:50%;background:#ee675f;color:#fff;box-shadow:0 5px 12px rgba(88,38,26,.28);font-size:29px;font-weight:900;line-height:1;cursor:pointer}.placed-delete:hover{transform:scale(1.08)}
@keyframes mail-bob{0%,100%{transform:translateY(0) rotate(2deg)}50%{transform:translateY(-7px) rotate(-3deg)}}
@media(max-width:900px){.mailbox-hotspot{left:82.5%;top:50%}.placed-item{width:clamp(150px,20vw,220px)}}
@media(prefers-reduced-motion:reduce){.mail-envelope{animation:none}.placed-item img{transition:none}}
</style>
