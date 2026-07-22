<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useVillageDecoration } from '../../composables/useVillageDecoration'
import PointShopModal from '../../components/village/PointShopModal.vue'
import StoryFriendsModal from '../../components/village/StoryFriendsModal.vue'
import VillageScene from '../../components/village/VillageScene.vue'
import type { VillageItem } from '../../types/village'

const shopOpen = ref(false)
const friendsOpen = ref(false)
const dashboardRef = ref<HTMLElement | null>(null)
const placementDragging = ref(false)
const dragPosition = ref({ x: 0, y: 0 })
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

const stopPlacementDrag = () => {
  placementDragging.value = false
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', movePlacementPreview)
  window.removeEventListener('pointerup', finishPlacementDrag)
  window.removeEventListener('pointercancel', stopPlacementDrag)
}

const movePlacementPreview = (event: PointerEvent) => {
  dragPosition.value = { x: event.clientX, y: event.clientY }
}

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
      @move="moveItem"
      @moved="showToast(`${$event}의 자리를 옮겼어요.`)"
      @select-placed="selectPlaced"
      @remove="removePlaced"
    />

    <aside class="praise-card" aria-label="오늘의 칭찬">
      <!-- TODO: Additional resource asset required: teacher profile photo -->
      <div class="teacher-avatar" aria-hidden="true">김</div>
      <div><span>오늘의 칭찬 · 김선생님</span><p><strong>윤정아, 오늘도 또박또박 정말 멋졌어!</strong><br />끝까지 집중한 점이 최고야.</p></div>
      <i aria-hidden="true">♥</i>
    </aside>

    <div v-if="selectedItem" class="placement-guide" role="status">
      <button class="drag-handle" type="button" :aria-label="`${selectedItem.name}을 마을로 끌어 놓기`" @pointerdown="startPlacementDrag">
        <img :src="selectedItem.image" alt="" draggable="false" /><span>잡고 끌기</span>
      </button>
      <div><small>자유 배치</small><strong>{{ selectedItem.name }}</strong><span>왼쪽 이미지를 잡고 원하는 곳에 놓아 주세요.</span></div>
      <button v-if="isPlaced(selectedItem.id)" type="button" class="remove" @click="removeSelected">마을에서 빼기</button>
      <button type="button" class="cancel" @click="cancelPlacement">취소</button>
    </div>

    <Teleport to="body">
      <img
        v-if="placementDragging && selectedItem"
        class="placement-ghost"
        :class="`placement-ghost--${selectedItem.kind}`"
        :src="selectedItem.image"
        alt=""
        :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
      />
    </Teleport>

    <div class="bottom-actions">
      <button class="action shop" type="button" @click="shopOpen = true"><span class="store-icon" aria-hidden="true"><i></i></span><b>포인트 상점</b><em>›</em></button>
      <button class="action friends" type="button" @click="friendsOpen = true"><span class="faces" aria-hidden="true"><i></i><i></i></span><b>이야기 친구들</b><em>›</em></button>
    </div>

    <Transition name="toast"><p v-if="toast" class="toast" role="status">{{ toast }}</p></Transition>
    <Transition name="modal"><PointShopModal v-if="shopOpen" :points="points" :is-owned="isOwned" @close="shopOpen = false" @purchase="purchase" @place="chooseItem" /></Transition>
    <Transition name="modal"><StoryFriendsModal v-if="friendsOpen" :is-placed="isPlaced" @close="friendsOpen = false" @select="chooseItem" @locked="showToast('이야기를 완료하면 만날 수 있어요.')" /></Transition>
  </main>
</template>

<style scoped>
.village-dashboard{position:relative;width:100%;height:100dvh;min-height:620px;overflow:hidden;font-family:var(--learner-font-reading);color:#1d3756}.floating-nav{position:absolute;inset:24px 34px auto;z-index:30;display:grid;grid-template-columns:240px 1fr auto;align-items:center;pointer-events:none}.floating-nav>*{pointer-events:auto}.logo{width:200px;height:76px;object-fit:contain;transform:scale(1.75);transform-origin:left center}.home-button{justify-self:center;display:flex;align-items:center;gap:10px;min-width:112px;height:62px;padding:0 22px;border:3px solid rgba(255,255,255,.85);border-radius:999px;background:white;color:#1475d8;box-shadow:0 8px 22px rgba(31,87,130,.17);font-size:22px;cursor:pointer}.home-button b{font-weight:900}.home-icon{position:relative;width:25px;height:20px;border-radius:3px;background:#1683eb}.home-icon:before{content:'';position:absolute;left:-3px;top:-9px;border-left:15px solid transparent;border-right:15px solid transparent;border-bottom:14px solid #1683eb}.account{display:flex;align-items:center;gap:12px}.profile{display:flex;align-items:center;gap:10px;padding:4px 13px 4px 4px;border:0;border-radius:999px;background:rgba(255,255,255,.94);color:#155fb0;box-shadow:0 7px 18px rgba(31,87,130,.18);font-size:22px;cursor:pointer}.avatar,.teacher-avatar{display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#ffd7b9,#ff9b77);color:#7f361f;font-weight:900}.avatar{width:50px;height:50px;border:3px solid white}.profile strong{font-weight:900}.points{display:flex;align-items:center;gap:10px;height:62px;padding:7px 21px 7px 10px;border:2px solid rgba(255,255,255,.75);border-radius:999px;background:#087ee3;color:white;box-shadow:0 8px 20px rgba(0,88,173,.2)}.point-star{display:grid;place-items:center;width:45px;height:45px;border:4px solid #f2a500;border-radius:50%;background:#ffd43d;color:#976000;font-size:12px;font-weight:900}.points span:last-child{display:flex;flex-direction:column;line-height:1.04}.points small{font-size:13px;font-weight:700}.points strong{font-size:25px;font-weight:900}.round-button{position:relative;width:58px;height:58px;border:3px solid rgba(255,255,255,.7);border-radius:50%;background:#087ee3;color:white;box-shadow:0 8px 20px rgba(0,88,173,.2);cursor:pointer}.round-button:hover,.action:hover,.home-button:hover{transform:translateY(-2px) scale(1.02)}.bell span{position:absolute;left:17px;top:16px;width:20px;height:22px;border-radius:12px 12px 7px 7px;background:white}.bell span:after{content:'';position:absolute;left:7px;bottom:-5px;width:7px;height:5px;border-radius:50%;background:white}.bell b{position:absolute;right:-4px;top:-9px;display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#ff4936;color:white;font-weight:900}.settings span{font-size:30px}.praise-card{position:absolute;left:5.5%;top:14%;z-index:22;display:grid;grid-template-columns:68px 1fr auto;align-items:center;gap:15px;width:min(510px,35vw);padding:17px 20px;border:3px solid rgba(255,255,255,.82);border-radius:25px;background:rgba(255,251,242,.95);box-shadow:0 9px 24px rgba(83,83,46,.2)}.teacher-avatar{width:66px;height:66px;font-size:25px}.praise-card span{color:#b56f1d;font-size:14px;font-weight:800}.praise-card p{margin-top:3px;color:#2f3334;font-size:16px;line-height:1.55}.praise-card strong{font-size:18px;font-weight:900}.praise-card i{align-self:end;color:#ff5b70;font-size:26px;font-style:normal}.bottom-actions{position:absolute;left:50%;bottom:25px;z-index:28;display:flex;gap:18px;transform:translateX(-50%)}.action{display:flex;align-items:center;gap:16px;min-width:270px;height:70px;padding:0 23px;border:3px solid rgba(255,255,255,.9);border-radius:999px;background:#fffdf9;box-shadow:0 10px 24px rgba(47,80,32,.2);cursor:pointer;transition:transform .18s ease}.action b{font-size:22px;font-weight:900}.action em{margin-left:auto;font-size:38px;font-style:normal;line-height:1}.shop{color:#1278d4}.friends{color:#238647}.store-icon{position:relative;width:42px;height:35px;border:3px solid #b86425;border-radius:4px;background:#ffe09a}.store-icon:before{content:'';position:absolute;left:-5px;top:-11px;width:46px;height:13px;border-radius:5px;background:repeating-linear-gradient(90deg,#fa6b43 0 8px,#fff1bd 8px 16px)}.store-icon i{position:absolute;left:7px;bottom:0;width:11px;height:17px;background:#5ebee7}.faces{display:flex;align-items:flex-end;width:48px}.faces i{display:block;width:28px;height:28px;border:3px solid white;border-radius:50%;background:#ffcf8d;box-shadow:0 1px 5px rgba(0,0,0,.2)}.faces i:last-child{margin-left:-8px;background:#8fd774}.placement-guide{position:absolute;left:50%;top:105px;z-index:35;display:flex;align-items:center;gap:12px;min-width:500px;padding:9px 12px;border:3px solid white;border-radius:20px;background:rgba(28,76,105,.92);color:white;box-shadow:0 9px 24px rgba(24,59,70,.25);transform:translateX(-50%)}.placement-guide img{width:58px;height:58px;object-fit:contain}.placement-guide div{display:flex;flex-direction:column;line-height:1.2}.placement-guide small{color:#bfe6a0;font-weight:800}.placement-guide strong{font-size:19px;font-weight:900}.placement-guide span{font-size:14px}.placement-guide button{min-height:43px;padding:0 13px;border:0;border-radius:13px;font-weight:800;cursor:pointer}.placement-guide .remove{margin-left:auto;background:#fff0e5;color:#b1502a}.placement-guide .cancel{background:white;color:#31536a}.toast{position:absolute;left:50%;bottom:112px;z-index:120;margin:0;padding:13px 24px;border-radius:999px;background:#203c58;color:white;box-shadow:0 8px 22px rgba(0,0,0,.2);font-size:18px;font-weight:800;transform:translateX(-50%)}button:focus-visible{outline:5px solid #ffd43d;outline-offset:4px}.toast-enter-active,.toast-leave-active,.modal-enter-active,.modal-leave-active{transition:opacity .2s ease}.toast-enter-from,.toast-leave-to,.modal-enter-from,.modal-leave-to{opacity:0}@media(max-width:1200px){.floating-nav{inset-inline:22px;grid-template-columns:180px 1fr auto}.logo{width:150px}.account{gap:7px}.profile strong{display:none}.profile{padding-right:4px}.points{padding-right:14px}.praise-card{width:390px}.action{min-width:235px}.home-button{justify-self:start}.placement-guide{top:88px}}@media(max-width:850px){.village-dashboard{min-height:560px}.floating-nav{top:12px;grid-template-columns:140px 1fr auto}.logo{width:125px}.home-button{min-width:56px;width:56px;padding:0}.home-button b{display:none}.points small{display:none}.points{height:54px}.round-button{width:52px;height:52px}.profile{display:none}.praise-card{top:12%;left:3%;width:340px;padding:12px}.teacher-avatar{width:52px;height:52px}.praise-card p{font-size:14px}.praise-card strong{font-size:16px}.bottom-actions{bottom:14px}.action{min-width:210px;height:60px}.action b{font-size:18px}.placement-guide{top:auto;bottom:85px;min-width:min(520px,90vw)}}@media(prefers-reduced-motion:reduce){.action,.round-button,.home-button{transition:none}}
.village-dashboard{height:100%;min-height:0}
.floating-nav{top:20px;grid-template-columns:240px 1fr 700px}
.logo{filter:drop-shadow(0 3px 2px rgba(0,79,145,.16))}
.account{justify-content:space-between;gap:18px}
.praise-card{left:6.5%;top:4%;width:min(500px,35vw);background:rgba(255,251,242,.96)}
.action{min-width:320px;padding-inline:25px}
@media(max-width:1500px){.floating-nav{grid-template-columns:210px 1fr 520px}.account{gap:10px}.profile strong{display:none}.profile{padding-right:4px}.action{min-width:280px}}
@media(max-width:1200px){.floating-nav{grid-template-columns:180px 1fr auto}.action{min-width:250px}}
@media(max-width:850px){.floating-nav{grid-template-columns:140px 1fr auto}.action{min-width:210px}}
.placement-guide .drag-handle{position:relative;width:68px;height:68px;min-height:68px;padding:0;border:3px solid #d9f3bb;border-radius:17px;background:#f3ffe9;cursor:grab;touch-action:none;flex:0 0 auto}.placement-guide .drag-handle:active{cursor:grabbing}.placement-guide .drag-handle img{width:100%;height:100%;padding:3px;object-fit:contain;pointer-events:none}.placement-guide .drag-handle span{position:absolute;left:50%;bottom:-8px;padding:2px 7px;border-radius:999px;background:#72b43e;color:white;font-size:10px;font-weight:900;white-space:nowrap;transform:translateX(-50%)}
.placement-ghost{position:fixed;z-index:1000;width:clamp(110px,9vw,164px);height:clamp(110px,9vw,164px);object-fit:contain;pointer-events:none;transform:translate(-50%,-50%) scale(1.08);filter:saturate(1.15) drop-shadow(0 16px 12px rgba(28,70,30,.3))}
.placement-ghost{width:clamp(208px,18vw,328px);height:clamp(208px,18vw,328px)}
.placement-ghost--decoration{width:clamp(96px,8.4vw,154px);height:clamp(96px,8.4vw,154px)}
</style>
