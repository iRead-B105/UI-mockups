<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import GrowthFlowerBed from '../../components/growth/GrowthFlowerBed.vue'
import growthBackground from '../../assets/growth/growth-background.png'
import fenceFront from '../../assets/growth/environment/fence-front.png'
import alice from '../../assets/growth/characters/alice.png'
import grasshopper from '../../assets/growth/characters/grasshopper.png'
import wateringCan from '../../assets/growth/icons/watering-can.png'

type FieldId = 'phonology' | 'phonics' | 'word' | 'fluency'
type FieldColor = 'pink' | 'yellow' | 'purple' | 'white'

interface GrowthField {
  id: FieldId
  title: string
  icon: string
  color: FieldColor
}

interface PlacedCharacter {
  id: string
  image: string
  name: string
  x: number
  y: number
}

const fields: GrowthField[] = [
  { id: 'phonology', title: '음운 연습', icon: '♪', color: 'pink' },
  { id: 'phonics', title: '파닉스 연습', icon: 'ABC', color: 'yellow' },
  { id: 'word', title: '단어 연습', icon: '▤', color: 'purple' },
  { id: 'fluency', title: '유창성 훈련', icon: '★', color: 'white' },
]

const fieldImages = import.meta.glob<string>('../../assets/growth/fields/*.png', {
  eager: true,
  import: 'default',
})

const stages = reactive<Record<FieldId, number>>({
  phonology: 1,
  phonics: 1,
  word: 1,
  fluency: 1,
})
const growingField = ref<FieldId | null>(null)
const isDecorating = ref(false)
const announcement = ref('꽃밭을 눌러서 학습 정원을 키워보세요.')
let growthTimer: ReturnType<typeof setTimeout> | undefined

// Story friends for decoration
const availableCharacters = ref([
  { id: 'alice', image: alice, name: '앨리스' },
  { id: 'grasshopper', image: grasshopper, name: '배짱이' },
])

const placedCharacters = ref<PlacedCharacter[]>([])
const draggingCharacter = ref<string | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

const imageFor = (field: GrowthField) => {
  const stage = String(stages[field.id]).padStart(2, '0')
  return fieldImages[`../../assets/growth/fields/${field.color}-${stage}.png`] ?? ''
}

const grow = (field: GrowthField) => {
  if (stages[field.id] < 5) stages[field.id] += 1
  growingField.value = field.id
  announcement.value = stages[field.id] === 5
    ? `${field.title} 꽃밭이 활짝 피었어요!`
    : `${field.title} 꽃밭이 ${stages[field.id]}단계로 자랐어요!`
  window.clearTimeout(growthTimer)
  growthTimer = window.setTimeout(() => { growingField.value = null }, 680)
}

const waterAll = () => {
  fields.forEach((field) => {
    if (stages[field.id] < 5) stages[field.id] += 1
  })
  growingField.value = null
  announcement.value = '모든 꽃밭에 물을 주었어요!'
}

// Drag and drop handlers
const startDrag = (event: MouseEvent, charId: string) => {
  if (!isDecorating.value) return

  draggingCharacter.value = charId
  const character = placedCharacters.value.find(c => c.id === charId)
  if (character) {
    dragOffset.value = {
      x: event.clientX - character.x,
      y: event.clientY - character.y,
    }
  }
}

const onDrag = (event: MouseEvent) => {
  if (!draggingCharacter.value) return

  const character = placedCharacters.value.find(c => c.id === draggingCharacter.value)
  if (character) {
    character.x = event.clientX - dragOffset.value.x
    character.y = event.clientY - dragOffset.value.y
  }
}

const endDrag = () => {
  draggingCharacter.value = null
}

const addCharacterToGarden = (char: { id: string; image: string; name: string }) => {
  // Add to center of garden area
  const gardenArea = document.querySelector('.growth-page')
  if (gardenArea) {
    const rect = gardenArea.getBoundingClientRect()
    placedCharacters.value.push({
      ...char,
      x: rect.width / 2 - 60,
      y: rect.height / 2 - 60,
    })
  }
}

const removeCharacter = (charId: string) => {
  const index = placedCharacters.value.findIndex(c => c.id === charId)
  if (index !== -1) {
    placedCharacters.value.splice(index, 1)
  }
}

// Add mouse move/up listeners for drag
onBeforeUnmount(() => {
  window.clearTimeout(growthTimer)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
})

// Add drag listeners when decorating mode is active
const addDragListeners = () => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}

const removeDragListeners = () => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}
</script>

<template>
  <main class="growth-page" :style="{ '--growth-background': `url(${growthBackground})` }">
    <section class="welcome-card" aria-label="학습자 환영 메시지">
      <span class="welcome-sparkle" aria-hidden="true">✦</span>
      <h1>안녕, <strong>윤정</strong>아!</h1>
      <p>오늘도 재미있게 훈련하고<br />멋지게 성장해보자!</p>
      <span class="welcome-flower" aria-hidden="true">🌷</span>
    </section>

    <section class="mission-card" aria-label="오늘의 미션">
      <span class="mission-calendar" aria-hidden="true">✓</span>
      <div>
        <h2>오늘의 미션</h2>
        <p>꽃밭을 3번 성장시켜 보세요!</p>
        <div class="mission-progress"><i></i></div>
      </div>
      <strong>2 / 3</strong>
      <span class="mission-arrow" aria-hidden="true">›</span>
    </section>

    <button
      class="decorate-button"
      :class="{ 'decorate-button--active': isDecorating }"
      type="button"
      :aria-pressed="isDecorating"
      @click="isDecorating = !isDecorating; isDecorating ? addDragListeners() : removeDragListeners()"
    >
      <span aria-hidden="true">🌿</span>
      {{ isDecorating ? '정원 꾸미기 완료' : '나의 성장 정원 꾸미기' }}
    </button>

    <Transition name="decorate-hint">
      <p v-if="isDecorating" class="decorate-hint">이야기 친구를 꽃밭에 드래그해서 꾸며보세요!</p>
    </Transition>

    <!-- Character picker for decoration mode -->
    <Transition name="fade">
      <div v-if="isDecorating" class="character-picker">
        <div
          v-for="char in availableCharacters.filter(c => !placedCharacters.find(p => p.id === c.id))"
          :key="char.id"
          class="character-option"
          @click="addCharacterToGarden(char)"
        >
          <img :src="char.image" :alt="char.name" />
          <span>{{ char.name }}</span>
        </div>
      </div>
    </Transition>

    <!-- Placed characters in garden -->
      <div
        v-for="char in placedCharacters"
        :key="char.id"
        class="placed-character"
        :class="{ dragging: draggingCharacter === char.id, 'decorating-mode': isDecorating }"
        :style="{ left: `${char.x}px`, top: `${char.y}px` }"
        @mousedown="startDrag($event, char.id)"
      >
        <img :src="char.image" :alt="char.name" />
        <button
          v-if="isDecorating"
          class="remove-character"
          @click.stop="removeCharacter(char.id)"
          aria-label="삭제"
        >
          <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

    <section class="flower-garden" aria-label="나의 학습 꽃밭">
      <GrowthFlowerBed
        v-for="(field, index) in fields"
        :key="field.id"
        :title="field.title"
        :icon="field.icon"
        :image="imageFor(field)"
        :stage="stages[field.id]"
        :is-growing="growingField === field.id"
        :depth="index < 2 ? 'back' : 'front'"
        @grow="grow(field)"
      />
    </section>

    <img class="scene-layer fence-front" :src="fenceFront" alt="" />

    <button class="watering-button" type="button" aria-label="모든 꽃밭에 물주기" @click="waterAll">
      <img :src="wateringCan" alt="" />
      <span>모두 물주기</span>
    </button>

    <p class="garden-guide">꽃밭을 눌러서<br />쑥쑥 키워봐!</p>
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </main>
</template>

<style scoped>
.growth-page {
  --scene-scale: min(1vw, 1.78vh);
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 620px;
  overflow: hidden;
  isolation: isolate;
  background: var(--growth-background) center / cover no-repeat;
  color: #403a34;
  font-family: var(--learner-font-reading);
}

.scene-layer { position:absolute;z-index:1;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none; }
.fence-front { z-index:8; }

/* Character picker for decoration mode */
.character-picker {
  position: absolute;
  z-index: 15;
  top: clamp(140px, 18vh, 200px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--learner-space-4);
  padding: var(--learner-space-4);
  border-radius: var(--learner-radius-large);
  background: rgb(255 255 255 / 90%);
  box-shadow: var(--learner-shadow-floating);
}

.character-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--learner-space-2);
  padding: var(--learner-space-3);
  border-radius: var(--learner-radius-medium);
  cursor: pointer;
  transition: all var(--learner-duration-fast);
}

.character-option:hover {
  background: rgb(255 255 255 / 80%);
  transform: scale(1.05);
}

.character-option img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.character-option span {
  font-family: var(--learner-font-display);
  font-size: var(--learner-font-size-body);
  font-weight: var(--learner-font-weight-bold);
}

/* Placed characters in garden */
.placed-character {
  position: absolute;
  z-index: 6;
  width: 120px;
  height: 120px;
  cursor: default;
  transition: transform 180ms var(--learner-easing-standard);
  pointer-events: none;
}

.placed-character.decorating-mode {
  cursor: grab;
  pointer-events: auto;
}

.placed-character.dragging {
  cursor: grabbing;
  transform: scale(1.1);
  z-index: 20;
}

.placed-character img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgb(0 0 0 / 20%));
}

.remove-character {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: var(--learner-color-error);
  color: white;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--learner-duration-fast);
}

.placed-character:hover .remove-character {
  opacity: 1;
  transform: scale(1);
}

.remove-character svg {
  width: 16px;
  height: 16px;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--learner-duration-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.welcome-card,.mission-card {
  position:absolute;
  z-index:12;
  top:clamp(18px,3vh,34px);
  border:2px solid rgb(221 185 103 / 35%);
  border-radius:clamp(20px,2vw,30px);
  background:linear-gradient(135deg,rgb(255 255 255 / 94%),rgb(255 251 232 / 94%));
  box-shadow:0 8px 18px rgb(62 104 80 / 16%),inset 0 0 25px rgb(255 235 167 / 24%);
}

.welcome-card { left:2%;width:clamp(280px,25vw,390px);padding:clamp(18px,2vh,25px) clamp(24px,2vw,34px); }
.welcome-card h1 { margin:0 0 9px;font-family:var(--learner-font-display);font-size:clamp(24px,2.1vw,35px);font-weight:900;line-height:1.1; }
.welcome-card h1 strong { color:#4d80e9;font-weight:900; }
.welcome-card p { margin:0;font-size:clamp(14px,1.25vw,19px);font-weight:700;line-height:1.55; }
.welcome-sparkle { position:absolute;right:30px;top:17px;color:#ffd75f;font-size:34px; }.welcome-flower { position:absolute;right:24px;bottom:8px;font-size:34px; }

.mission-card { right:2%;width:clamp(360px,29vw,475px);min-height:112px;display:flex;align-items:center;gap:16px;padding:16px 22px; }
.mission-calendar { width:62px;height:68px;display:grid;place-items:center;flex:0 0 auto;border:4px solid #d9e1dd;border-top:16px solid #4f83ee;border-radius:10px;background:#fff;color:#63b85a;font-size:38px;font-weight:900;box-shadow:0 4px 0 #c6d1cc; }
.mission-card>div { min-width:0;flex:1; }.mission-card h2 { margin:0 0 5px;font-family:var(--learner-font-display);font-size:clamp(18px,1.55vw,25px);font-weight:900; }.mission-card p { margin:0 0 10px;font-size:clamp(12px,1vw,16px);font-weight:700;white-space:nowrap; }
.mission-progress { height:13px;overflow:hidden;border-radius:999px;background:#dce4e4; }.mission-progress i { display:block;width:66%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#407cf0,#6ca3ff); }
.mission-card>strong { align-self:flex-end;margin-bottom:16px;font-size:16px;font-weight:900;white-space:nowrap; }.mission-arrow { display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#fff;color:#5d91ed;font-size:32px;font-weight:900;box-shadow:0 3px 8px #89a4bc38; }

.decorate-button { position:absolute;z-index:14;top:clamp(25px,3.8vh,39px);left:50%;height:clamp(52px,7.2vh,68px);display:flex;align-items:center;justify-content:center;gap:9px;padding:0 clamp(20px,2vw,30px);border:3px solid #fff;border-radius:999px;background:linear-gradient(180deg,#72c959,#4fad46);box-shadow:0 5px 0 #378b35,0 10px 20px rgb(49 112 48 / 20%);color:#fff;font-family:var(--learner-font-display);font-size:clamp(15px,1.35vw,21px);font-weight:900;cursor:pointer;transform:translateX(-50%);transition:transform 160ms var(--learner-easing-bounce),background 160ms ease;white-space:nowrap; }
.decorate-button:hover,.decorate-button:focus-visible { outline:none;transform:translateX(-50%) translateY(-3px) scale(1.025);box-shadow:var(--learner-shadow-focus),0 5px 0 #378b35; }
.decorate-button--active { background:linear-gradient(180deg,#ffb858,#ed8b38);box-shadow:0 5px 0 #bd692b,0 10px 20px rgb(142 86 38 / 20%); }
.decorate-button>span { font-size:clamp(20px,2vw,28px); }
.decorate-hint { position:absolute;z-index:14;top:clamp(82px,11vh,105px);left:50%;margin:0;padding:7px 15px;border-radius:999px;background:rgb(255 255 255 / 94%);box-shadow:0 5px 12px rgb(64 105 49 / 15%);color:#54743d;font-size:clamp(11px,.95vw,14px);font-weight:900;transform:translateX(-50%);white-space:nowrap; }
.decorate-hint-enter-active,.decorate-hint-leave-active { transition:opacity 160ms ease,transform 160ms ease; }
.decorate-hint-enter-from,.decorate-hint-leave-to { opacity:0;transform:translate(-50%,-5px); }

.flower-garden {
  position:absolute;
  z-index:5;
  top:22%;
  left:50%;
  transform:translateX(-50%);
  width:min(94%,1500px);
  height:min(72%,750px);
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  grid-template-rows:repeat(2,minmax(0,1fr));
  column-gap:clamp(1%,2vw,4%);
  row-gap:0;
  padding:0;
}

.watering-button { position:absolute;z-index:16;right:2.2%;bottom:2.2%;width:clamp(90px,9vw,140px);aspect-ratio:1;border:7px solid #fff;border-radius:50%;background:linear-gradient(145deg,#fff9d8,#fff1ad);box-shadow:0 0 0 4px #f3c94c,0 10px 22px rgb(72 100 36 / 24%);cursor:pointer;transition:transform 180ms var(--learner-easing-bounce); }
.watering-button:hover,.watering-button:focus-visible { outline:none;transform:rotate(-6deg) scale(1.06); }.watering-button img { width:76%;height:76%;object-fit:contain; }.watering-button span { position:absolute;right:50%;bottom:-9px;padding:4px 10px;border-radius:999px;background:#4782e8;color:#fff;font-size:11px;font-weight:900;transform:translateX(50%);white-space:nowrap; }
.garden-guide { position:absolute;z-index:14;right:11%;bottom:18%;margin:0;padding:13px 18px;border-radius:22px;background:rgb(255 255 255 / 93%);box-shadow:0 7px 15px rgb(75 103 39 / 16%);font-family:var(--learner-font-display);font-size:clamp(13px,1.2vw,18px);font-weight:900;line-height:1.35;text-align:center; }
.garden-guide::after { position:absolute;right:18px;top:100%;border:13px solid transparent;border-top-color:rgb(255 255 255 / 93%);content:''; }

.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }

@media (max-width: 980px) {
  .welcome-card { left:1.5%;transform:scale(.82);transform-origin:top left; }
  .mission-card { right:1.5%;transform:scale(.82);transform-origin:top right; }
  .flower-garden { width:96%;top:20%;height:70%; }
  .garden-guide { display:none; }
  .character-picker { top:140px; }
}

@media (max-width: 700px) {
  .growth-page { min-height:760px;overflow:auto;background-position:center top; }
  .welcome-card { top:12px;max-width:62%; }.mission-card { top:120px;right:2%;width:96%;transform:scale(.72); }
  .flower-garden { top:18%;width:98%;height:74%; }
  .watering-button { bottom:18px; }
  .character-picker { top:120px;flex-wrap:wrap;justify-content:center; }
}
</style>
