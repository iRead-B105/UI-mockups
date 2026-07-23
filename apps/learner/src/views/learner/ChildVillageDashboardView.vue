<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useVillageDecoration } from '../../composables/useVillageDecoration'
import LetterboxModal from '../../components/village/LetterboxModal.vue'
import PointShopModal from '../../components/village/PointShopModal.vue'
import StoryFriendsModal from '../../components/village/StoryFriendsModal.vue'
import VillageScene from '../../components/village/VillageScene.vue'
import type { VillageItem } from '../../types/village'

const shopOpen = ref(false)
const friendsOpen = ref(false)
const lettersOpen = ref(false)
const dashboardRef = ref<HTMLElement | null>(null)
const placementDragging = ref(false)
const dragPosition = ref({ x: 0, y: 0 })

const readLetterIds = () => {
  try { return JSON.parse(localStorage.getItem('iread-village-read-letters') ?? '[]') as string[] }
  catch { return [] }
}
const unreadLetters = ref(Math.max(0, 4 - readLetterIds().length))

const {
  points, selectedItem, toast, placedVillageItems,
  isOwned, isPlaced, purchase, beginPlacement, placeAt, moveItem,
  selectPlaced, removeSelected, removePlaced, cancelPlacement, showToast,
} = useVillageDecoration()

const chooseItem = (item: VillageItem) => {
  shopOpen.value = false
  friendsOpen.value = false
  beginPlacement(item)
}

const openLetters = () => { lettersOpen.value = true }
const closeLetters = () => {
  lettersOpen.value = false
  unreadLetters.value = Math.max(0, 4 - readLetterIds().length)
}

const stopPlacementDrag = () => {
  placementDragging.value = false
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', movePlacementPreview)
  window.removeEventListener('pointerup', finishPlacementDrag)
  window.removeEventListener('pointercancel', stopPlacementDrag)
}

const movePlacementPreview = (event: PointerEvent) => { dragPosition.value = { x: event.clientX, y: event.clientY } }

const finishPlacementDrag = (event: PointerEvent) => {
  const rect = dashboardRef.value?.getBoundingClientRect()
  if (rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
    placeAt(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100)
  } else {
    showToast('마을 안쪽에 놓아 주세요.')
  }
  stopPlacementDrag()
}

const startPlacementDrag = (event: PointerEvent) => {
  event.preventDefault()
  placementDragging.value = true
  dragPosition.value = { x: event.clientX, y: event.clientY }
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', movePlacementPreview)
  window.addEventListener('pointerup', finishPlacementDrag)
  window.addEventListener('pointercancel', stopPlacementDrag)
}

onBeforeUnmount(stopPlacementDrag)
</script>

<template>
  <main ref="dashboardRef" class="village-dashboard">
    <VillageScene
      :positioned-items="placedVillageItems"
      :selected-item="selectedItem"
      :unread-letters="unreadLetters"
      @move="moveItem"
      @moved="showToast(`${$event}의 자리를 옮겼어요.`)"
      @select-placed="selectPlaced"
      @remove="removePlaced"
      @open-letters="openLetters"
    />

    <section class="village-name" aria-label="마을 이름">
      <span aria-hidden="true">✦</span>
      <div><h1>윤정이의 마을</h1><p>오늘도 반짝반짝 자라고 있어요</p></div>
    </section>

    <Transition name="tray">
      <section v-if="selectedItem" class="placement-tray" aria-label="아이템 자유 배치">
        <button class="drag-handle" type="button" :aria-label="`${selectedItem.name}을 잡고 마을에 놓기`" @pointerdown="startPlacementDrag">
          <img :src="selectedItem.image" alt="" draggable="false" />
          <span>잡고 끌기</span>
        </button>
        <div class="placement-copy"><small>마을에 놓을 친구</small><strong>{{ selectedItem.name }}</strong><p>그림을 잡고 원하는 곳에 놓아 주세요.</p></div>
        <button v-if="isPlaced(selectedItem.id)" class="tray-remove" type="button" @click="removeSelected">보관하기</button>
        <button class="tray-cancel" type="button" aria-label="배치 취소" @click="cancelPlacement">×</button>
      </section>
    </Transition>

    <Teleport to="body">
      <img v-if="placementDragging && selectedItem" class="placement-ghost" :class="`placement-ghost--${selectedItem.kind}`" :src="selectedItem.image" alt="" :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }" />
    </Teleport>

    <nav class="village-dock" aria-label="마을 메뉴">
      <button class="dock-button shop" type="button" @click="shopOpen = true">
        <span class="dock-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M8 19h32v23H8z"/><path d="M5 18 9 7h30l4 11c0 4-5 6-9 2-3 4-8 4-10 0-3 4-8 4-10 0-4 4-9 2-9-2Z"/><path d="M14 29h9v13m6-13h6v7h-6z"/></svg></span>
        <span><small>{{ points.toLocaleString() }}P로 꾸미기</small><strong>포인트 상점</strong></span>
        <b aria-hidden="true">›</b>
      </button>
      <button class="dock-button friends" type="button" @click="friendsOpen = true">
        <span class="friend-faces" aria-hidden="true"><i>🐰</i><i>🐊</i></span>
        <span><small>읽은 이야기에서 만난</small><strong>이야기 친구들</strong></span>
        <b aria-hidden="true">›</b>
      </button>
    </nav>

    <Transition name="toast"><p v-if="toast" class="toast" role="status">{{ toast }}</p></Transition>
    <Transition name="modal"><PointShopModal v-if="shopOpen" :points="points" :is-owned="isOwned" @close="shopOpen = false" @purchase="purchase" @place="chooseItem" /></Transition>
    <Transition name="modal"><StoryFriendsModal v-if="friendsOpen" :is-placed="isPlaced" @close="friendsOpen = false" @select="chooseItem" @locked="showToast('이야기를 완료하면 만날 수 있어요.')" /></Transition>
    <Transition name="modal"><LetterboxModal v-if="lettersOpen" @close="closeLetters" /></Transition>
  </main>
</template>

<style scoped>
.village-dashboard{position:relative;width:100%;height:100%;min-height:560px;overflow:hidden;color:#233c50;font-family:var(--learner-font-reading)}
.village-name{position:absolute;z-index:120;left:clamp(18px,3vw,50px);top:clamp(16px,3vh,32px);display:flex;align-items:center;gap:14px;padding:15px 23px 15px 17px;border:3px solid rgba(255,255,255,.9);border-radius:25px;background:rgba(255,253,241,.92);box-shadow:0 10px 26px rgba(47,85,43,.17);backdrop-filter:blur(7px)}.village-name>span{width:48px;height:48px;display:grid;place-items:center;border-radius:17px;background:linear-gradient(145deg,#ffde63,#f6b534);color:#fff;font-size:26px;text-shadow:0 2px 0 #d69d20}.village-name h1{margin:0;color:#355b32;font-family:var(--learner-font-display);font-size:clamp(22px,2vw,30px);font-weight:900;line-height:1}.village-name p{margin:6px 0 0;color:#6b7b60;font-size:clamp(13px,1.1vw,16px);font-weight:800}
.village-dock{position:absolute;z-index:120;left:50%;bottom:clamp(15px,2.6vh,26px);display:flex;gap:16px;transform:translateX(-50%)}.dock-button{min-width:clamp(250px,21vw,330px);height:76px;display:grid;grid-template-columns:52px 1fr 24px;align-items:center;gap:13px;padding:8px 18px 8px 10px;border:3px solid rgba(255,255,255,.95);border-radius:999px;background:rgba(255,253,247,.96);box-shadow:0 11px 27px rgba(48,80,32,.2);text-align:left;cursor:pointer;transition:transform .17s ease,box-shadow .17s ease}.dock-button:hover{transform:translateY(-4px);box-shadow:0 15px 31px rgba(48,80,32,.25)}.dock-button:focus-visible{outline:6px solid #ffdb55;outline-offset:3px}.dock-button>span:nth-child(2){display:flex;flex-direction:column}.dock-button small{color:#748073;font-size:13px;font-weight:800}.dock-button strong{font-family:var(--learner-font-display);font-size:21px;font-weight:900}.dock-button>b{color:currentColor;font-size:38px;font-weight:700;line-height:1}.shop{color:#1879d0}.friends{color:#288349}.dock-icon{width:52px;height:52px;display:grid;place-items:center;border-radius:18px;background:#fff2c9}.dock-icon svg{width:38px;fill:#ffb93c;stroke:#be7025;stroke-width:2.5;stroke-linejoin:round}.friend-faces{position:relative;width:56px;height:52px}.friend-faces i{position:absolute;bottom:0;width:42px;height:42px;display:grid;place-items:center;border:3px solid #fff;border-radius:50%;background:#e8f7d7;box-shadow:0 3px 8px rgba(42,82,31,.16);font-size:24px;font-style:normal}.friend-faces i:last-child{right:0;background:#dff4ec}
.placement-tray{position:absolute;z-index:150;left:50%;bottom:112px;display:flex;align-items:center;gap:13px;min-width:min(600px,88vw);padding:10px 14px;border:3px solid #fff;border-radius:27px;background:rgba(42,82,61,.94);box-shadow:0 12px 30px rgba(23,58,43,.3);color:#fff;transform:translateX(-50%);backdrop-filter:blur(7px)}.drag-handle{position:relative;width:78px;height:78px;flex:0 0 auto;padding:0;border:3px solid #d8f2bb;border-radius:21px;background:#f3ffe8;cursor:grab;touch-action:none}.drag-handle:active{cursor:grabbing}.drag-handle img{width:100%;height:100%;padding:3px;object-fit:contain;pointer-events:none}.drag-handle span{position:absolute;left:50%;bottom:-9px;padding:3px 8px;border-radius:999px;background:#79b649;color:#fff;font-size:11px;font-weight:900;white-space:nowrap;transform:translateX(-50%)}.placement-copy{min-width:0;display:flex;flex:1;flex-direction:column}.placement-copy small{color:#c9eca5;font-size:13px;font-weight:800}.placement-copy strong{font-family:var(--learner-font-display);font-size:21px;font-weight:900}.placement-copy p{margin:2px 0 0;font-size:14px;font-weight:700}.placement-tray>button:not(.drag-handle){height:44px;border:0;border-radius:14px;font-weight:900;cursor:pointer}.tray-remove{padding:0 16px;background:#fff1dc;color:#9c552c}.tray-cancel{width:44px;background:#fff;color:#436151;font-size:25px}
.placement-ghost{position:fixed;z-index:1000;width:clamp(190px,16.5vw,300px);height:clamp(190px,16.5vw,300px);object-fit:contain;pointer-events:none;transform:translate(-50%,-50%) scale(1.08) rotate(-2deg);filter:saturate(1.15) drop-shadow(0 18px 12px rgba(28,70,30,.3))}.placement-ghost--decoration{width:clamp(94px,8vw,148px);height:clamp(94px,8vw,148px)}
.toast{position:absolute;z-index:300;left:50%;bottom:116px;margin:0;padding:13px 24px;border:3px solid rgba(255,255,255,.7);border-radius:999px;background:#24475a;color:#fff;box-shadow:0 9px 22px rgba(0,0,0,.2);font-size:17px;font-weight:900;transform:translateX(-50%)}.toast-enter-active,.toast-leave-active,.modal-enter-active,.modal-leave-active,.tray-enter-active,.tray-leave-active{transition:opacity .2s ease,transform .2s ease}.toast-enter-from,.toast-leave-to,.modal-enter-from,.modal-leave-to,.tray-enter-from,.tray-leave-to{opacity:0}.tray-enter-from,.tray-leave-to{transform:translate(-50%,12px)}
@media(max-width:850px){.village-name{transform:scale(.82);transform-origin:top left}.village-dock{gap:9px}.dock-button{min-width:210px;height:66px}.dock-button small{display:none}.dock-button strong{font-size:17px}.placement-tray{bottom:92px}}
@media(max-width:560px){.village-dock{width:94%;}.dock-button{min-width:0;flex:1;grid-template-columns:44px 1fr;padding-right:13px}.dock-button>b{display:none}.village-name p{display:none}}
@media(prefers-reduced-motion:reduce){.dock-button{transition:none}}
</style>
