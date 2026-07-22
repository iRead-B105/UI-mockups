<script setup lang="ts">
import { computed, nextTick, onUnmounted, reactive, ref } from 'vue'
import type { HangulBattleRound, HangulBattleTile, TrainingQuestion } from '@/types/training'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { useTrainingSession } from '@/composables/useTrainingSession'

import rabbitSmile from '@/assets/battle/rabbit-smile.png'
import rabbitJump from '@/assets/battle/rabbit-jump.png'
import rabbitCry from '@/assets/battle/rabbit-cry.png'
import turtleSmile from '@/assets/battle/turtle-smile.png'
import turtleJump from '@/assets/battle/turtle-jump.png'
import turtleCry from '@/assets/battle/turtle-cry.png'
import antSmile from '@/assets/battle/ant-smile.png'
import antJump from '@/assets/battle/ant-jump.png'
import antCry from '@/assets/battle/ant-cry.png'

const props = defineProps<{ question: TrainingQuestion }>()
const emit = defineEmits<{ next: [] }>()

const session = useTrainingSession()
const audio = useAudioPlayer()

type GamePhase = 'ready' | 'speaking' | 'racing' | 'round-result' | 'match-result'
type RoundWinner = 'player' | 'opponent'

const phase = ref<GamePhase>('ready')
const roundIndex = ref(0)
const playerWins = ref(0)
const opponentWins = ref(0)
const roundWinner = ref<RoundWinner | null>(null)
const opponentFilledCount = ref(0)
const placements = reactive<Record<number, string>>({})
const draggedTileId = ref<string | null>(null)
const activeSlot = ref<number | null>(null)
const suppressSlotClick = ref<number | null>(null)
const boardWrong = ref(false)
let opponentTimer: ReturnType<typeof setInterval> | null = null
let wrongTimer: ReturnType<typeof setTimeout> | null = null

const rounds = computed<HangulBattleRound[]>(() => props.question.battleRounds ?? [])
const currentRound = computed(() => rounds.value[roundIndex.value] ?? null)
const opponentId = computed(() => props.question.battleOpponent ?? 'rabbit')
const opponentName = computed(() => ({ rabbit: '토끼', turtle: '거북이', ant: '개미' })[opponentId.value])
const isRacing = computed(() => phase.value === 'racing')
const usedTileIds = computed(() => new Set(Object.values(placements)))
const allFilled = computed(() => {
  const target = currentRound.value
  if (!target) return false
  return target.answer.every((_, index) => Boolean(placements[index]))
})
const isFinalRound = computed(() => roundIndex.value === rounds.value.length - 1)
const playerWonMatch = computed(() => playerWins.value > opponentWins.value)

const opponentImages = {
  rabbit: { smile: rabbitSmile, jump: rabbitJump, cry: rabbitCry },
  turtle: { smile: turtleSmile, jump: turtleJump, cry: turtleCry },
  ant: { smile: antSmile, jump: antJump, cry: antCry },
}

const opponentImage = computed(() => {
  const images = opponentImages[opponentId.value]
  if (phase.value === 'match-result') return playerWonMatch.value ? images.cry : images.jump
  if (phase.value === 'round-result') return roundWinner.value === 'player' ? images.cry : images.jump
  return images.smile
})

const tileById = (id: string | undefined): HangulBattleTile | undefined =>
  currentRound.value?.tiles.find((tile) => tile.id === id)
const textFor = (id: string | undefined) => tileById(id)?.text ?? ''

const clearTimers = () => {
  if (opponentTimer) clearInterval(opponentTimer)
  if (wrongTimer) clearTimeout(wrongTimer)
  opponentTimer = null
  wrongTimer = null
}

const clearBoard = () => {
  Object.keys(placements).forEach((key) => delete placements[Number(key)])
  draggedTileId.value = null
  activeSlot.value = null
  suppressSlotClick.value = null
  opponentFilledCount.value = 0
  boardWrong.value = false
}

const playWord = () => {
  if (currentRound.value) void audio.replay(currentRound.value.word, 0.82)
}

const startOpponent = () => {
  const target = currentRound.value
  if (!target) return
  const startedAt = Date.now()
  opponentTimer = setInterval(() => {
    const ratio = Math.min((Date.now() - startedAt) / target.opponentDurationMs, 1)
    if (ratio >= 1) {
      opponentFilledCount.value = target.answer.length
      finishRound('opponent')
    } else {
      opponentFilledCount.value = Math.min(
        Math.max(target.answer.length - 1, 0),
        Math.floor(ratio * target.answer.length),
      )
    }
  }, 120)
}

const startRace = async () => {
  if (!currentRound.value || phase.value !== 'ready') return
  phase.value = 'speaking'
  await audio.replay(currentRound.value.word, 0.82)
  clearBoard()
  phase.value = 'racing'
  startOpponent()
}

const boardIsCorrect = () => {
  const target = currentRound.value
  if (!target) return false
  return target.answer.every((answerText, index) => textFor(placements[index]) === answerText)
}

const finishRound = (winner: RoundWinner) => {
  if (phase.value !== 'racing') return
  clearTimers()
  roundWinner.value = winner
  if (winner === 'player') playerWins.value += 1
  else opponentWins.value += 1
  phase.value = 'round-result'
  if (currentRound.value) void audio.replay(currentRound.value.word, 0.82)
}

const checkBoard = () => {
  if (!allFilled.value || !isRacing.value) return
  if (boardIsCorrect()) {
    finishRound('player')
  } else {
    boardWrong.value = true
    if (wrongTimer) clearTimeout(wrongTimer)
    wrongTimer = setTimeout(() => { boardWrong.value = false }, 650)
  }
}

const placeTile = (tileId: string, slotIndex: number) => {
  if (!isRacing.value) return
  Object.keys(placements).forEach((key) => {
    if (placements[Number(key)] === tileId) delete placements[Number(key)]
  })
  placements[slotIndex] = tileId
  void nextTick(checkBoard)
}

const startDrag = (event: DragEvent, tileId: string) => {
  if (!isRacing.value) return
  draggedTileId.value = tileId
  event.dataTransfer?.setData('text/plain', tileId)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const startPointerDrag = (tileId: string) => {
  if (isRacing.value) draggedTileId.value = tileId
}

const dropOn = (event: DragEvent, slotIndex: number) => {
  const tileId = event.dataTransfer?.getData('text/plain') || draggedTileId.value
  draggedTileId.value = null
  activeSlot.value = null
  if (tileId) placeTile(tileId, slotIndex)
}

const pointerDropOn = (slotIndex: number) => {
  const tileId = draggedTileId.value
  if (!tileId) return
  suppressSlotClick.value = slotIndex
  placeTile(tileId, slotIndex)
  draggedTileId.value = null
  activeSlot.value = null
}

const clearSlot = (slotIndex: number) => {
  if (suppressSlotClick.value === slotIndex) {
    suppressSlotClick.value = null
    return
  }
  if (!isRacing.value || !placements[slotIndex]) return
  delete placements[slotIndex]
  boardWrong.value = false
}

const advanceRound = () => {
  if (phase.value !== 'round-result') return
  if (isFinalRound.value) {
    phase.value = 'match-result'
    session.markRecordingComplete({ isMock: true, audioUrl: null })
    return
  }
  roundIndex.value += 1
  roundWinner.value = null
  clearBoard()
  phase.value = 'ready'
}

const finishMatch = () => emit('next')

const releasePointer = () => {
  draggedTileId.value = null
  activeSlot.value = null
}

window.addEventListener('pointerup', releasePointer)
onUnmounted(() => {
  clearTimers()
  window.removeEventListener('pointerup', releasePointer)
})
</script>

<template>
  <section class="battle" :aria-label="question.instruction">
    <header class="scoreboard">
      <strong>윤정</strong>
      <span>{{ playerWins }}</span>
      <b>:</b>
      <span>{{ opponentWins }}</span>
      <strong>{{ opponentName }}</strong>
      <div class="round-dots" :aria-label="`전체 ${rounds.length}판 중 ${roundIndex + 1}판`">
        <i v-for="index in rounds.length" :key="index" :class="{ active: index - 1 === roundIndex }"></i>
      </div>
    </header>

    <div class="battle-body">
      <aside class="opponent-panel">
        <span class="opponent-badge">{{ opponentName }}</span>
        <img :src="opponentImage" :alt="`${opponentName} 캐릭터`" />
        <strong v-if="phase === 'racing'">만드는 중!</strong>
      </aside>

      <main v-if="currentRound" class="game-board">
        <div class="word-row">
          <button class="sound-button" type="button" :disabled="audio.isPlaying.value" aria-label="낱말 다시 듣기" @click="playWord">
            <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 19h10L31 9v30L18 29H8z" fill="currentColor"/><path d="M36 17c4 4 4 10 0 14M41 12c7 7 7 17 0 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
          </button>
          <strong class="target-word">{{ currentRound.word }}</strong>
        </div>

        <div class="race-board opponent-board" aria-label="상대 조합 진행">
          <span
            v-for="(_, index) in currentRound.answer"
            :key="`opponent-${index}`"
            class="opponent-slot"
            :class="{ filled: index < opponentFilledCount }"
          ></span>
        </div>

        <div class="race-board player-board" :class="{ wrong: boardWrong }" aria-label="윤정 글자 조합판">
          <button
            v-for="(_, index) in currentRound.answer"
            :key="`player-${index}`"
            class="player-slot"
            :class="{ filled: placements[index], active: activeSlot === index }"
            type="button"
            :aria-label="`${index + 1}번째 글자 자리${placements[index] ? `, ${textFor(placements[index])} 놓임` : ''}`"
            @dragenter.prevent="activeSlot = index"
            @dragover.prevent
            @drop.prevent="dropOn($event, index)"
            @pointerenter="draggedTileId && (activeSlot = index)"
            @pointerleave="activeSlot === index && (activeSlot = null)"
            @pointerup="pointerDropOn(index)"
            @click="clearSlot(index)"
          >
            {{ placements[index] ? textFor(placements[index]) : index + 1 }}
          </button>
        </div>

        <div class="tile-pool" aria-label="한글 타일">
          <div
            v-for="tile in currentRound.tiles"
            :key="tile.id"
            class="hangul-tile"
            :class="{ used: usedTileIds.has(tile.id) }"
            :draggable="isRacing"
            role="button"
            :tabindex="isRacing ? 0 : -1"
            :aria-label="`${tile.text} 타일`"
            @dragstart="startDrag($event, tile.id)"
            @pointerdown="startPointerDrag(tile.id)"
          >
            {{ tile.text }}
          </div>
        </div>

        <div v-if="phase === 'ready' || phase === 'speaking'" class="board-overlay ready-overlay">
          <span>VS</span>
          <strong>{{ currentRound.word }}</strong>
          <button type="button" :disabled="phase === 'speaking'" @click="startRace">
            {{ phase === 'speaking' ? '낱말 듣는 중…' : '대결 시작!' }}
          </button>
        </div>

        <div v-else-if="phase === 'round-result'" class="board-overlay result-overlay" role="status">
          <div class="stars" aria-hidden="true">{{ roundWinner === 'player' ? '★ ★ ★' : '☆ ☆ ☆' }}</div>
          <strong>{{ roundWinner === 'player' ? '윤정 승리!' : `${opponentName} 승리!` }}</strong>
          <p>{{ currentRound.word }}</p>
          <button type="button" @click="advanceRound">{{ isFinalRound ? '최종 결과' : '다음 낱말' }}</button>
        </div>

        <div v-else-if="phase === 'match-result'" class="board-overlay match-overlay" role="status">
          <div class="stars" aria-hidden="true">{{ playerWonMatch ? '★ ★ ★' : '☆ ★ ☆' }}</div>
          <strong>{{ playerWonMatch ? '윤정 최종 승리!' : `${opponentName} 최종 승리!` }}</strong>
          <p>{{ playerWins }} : {{ opponentWins }}</p>
          <button type="button" @click="finishMatch">대결 끝내기</button>
        </div>
      </main>
    </div>
  </section>
</template>

<style scoped>
.battle{display:flex;flex-direction:column;gap:12px;width:100%;max-width:1180px;height:100%;min-height:0;padding:14px 20px 18px;border:4px solid rgba(255,255,255,.94);border-radius:30px;background:linear-gradient(180deg,#d8efff 0%,#eef8ff 55%,#e5f3cd 100%);box-shadow:inset 0 0 0 2px rgba(89,145,212,.2),0 12px 26px rgba(45,94,145,.14);overflow:hidden}.scoreboard{position:relative;display:flex;align-items:center;justify-content:center;gap:14px;min-height:54px;border:3px solid #fff;border-radius:22px;background:rgba(255,253,244,.92);color:#233d79;font-family:var(--learner-font-display);box-shadow:0 5px 14px rgba(55,87,130,.1)}.scoreboard strong{font-size:21px;font-weight:900}.scoreboard span{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#6789e8;color:#fff;font-size:23px;font-weight:900}.scoreboard b{font-size:24px}.round-dots{position:absolute;right:18px;display:flex;gap:7px}.round-dots i{width:10px;height:10px;border-radius:50%;background:#ded6c1}.round-dots i.active{background:#f1bd3e;transform:scale(1.25)}.battle-body{display:grid;grid-template-columns:205px minmax(0,1fr);gap:16px;flex:1;min-height:0}.opponent-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px;border:3px solid #fff;border-radius:25px;background:rgba(255,253,244,.9);box-shadow:0 6px 16px rgba(62,91,120,.1)}.opponent-panel img{width:100%;max-height:285px;object-fit:contain;filter:drop-shadow(0 8px 8px rgba(64,71,75,.14))}.opponent-panel strong{color:#4f72e1;font-family:var(--learner-font-display);font-size:18px;font-weight:900}.opponent-badge{padding:6px 14px;border-radius:999px;background:#fff0a8;color:#765b18;font-size:16px;font-weight:900}.game-board{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:11px;min-width:0;padding:14px 18px;border-radius:25px;background:rgba(255,255,255,.5);overflow:hidden}.word-row{display:flex;align-items:center;gap:12px}.sound-button{display:grid;place-items:center;width:52px;height:52px;border:0;border-radius:50%;background:#6688e7;color:#fff;box-shadow:0 5px 12px rgba(61,86,122,.18);cursor:pointer}.sound-button svg{width:28px;height:28px}.sound-button:disabled{opacity:.7}.target-word{min-width:150px;padding:8px 24px;border:3px solid #f1d278;border-radius:18px;background:#fff9d8;color:#263853;text-align:center;font-family:var(--learner-font-display);font-size:36px;font-weight:900}.race-board{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:58px}.opponent-slot{width:47px;height:48px;border:3px dashed #9aaaca;border-radius:12px;background:rgba(255,255,255,.58)}.opponent-slot.filled{border-style:solid;border-color:#7992c8;background:repeating-linear-gradient(135deg,#829ae0 0 8px,#7089d1 8px 16px);box-shadow:0 3px 8px rgba(58,78,130,.16)}.player-slot{display:grid;place-items:center;width:66px;height:68px;border:4px dashed #88a3dd;border-radius:16px;background:rgba(255,255,255,.75);color:#9ba8ba;font-family:var(--learner-font-display);font-size:29px;font-weight:900;cursor:pointer}.player-slot.filled{border-style:solid;border-color:#7191e9;background:#fffdf8;color:#263853;box-shadow:var(--learner-shadow-card)}.player-slot.active{border-color:#4f72e1;background:#edf3ff;transform:scale(1.05)}.player-board.wrong .player-slot.filled{border-color:#ef8a7f;background:#fff2ee;animation:board-shake .35s ease-out}.tile-pool{display:grid;grid-template-columns:repeat(8,62px);justify-content:center;gap:8px;min-height:68px}.hangul-tile{display:grid;place-items:center;height:62px;border:4px solid #eedfbd;border-radius:15px;background:#fffdf8;color:#263853;font-family:var(--learner-font-display);font-size:29px;font-weight:900;box-shadow:0 5px 10px rgba(64,82,103,.13);cursor:grab;user-select:none;transition:transform .15s,opacity .15s}.hangul-tile:hover{transform:translateY(-3px)}.hangul-tile.used{opacity:.42}.board-overlay{position:absolute;inset:10px;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;border:4px solid rgba(255,255,255,.9);border-radius:24px;background:rgba(239,248,255,.96);text-align:center;box-shadow:0 10px 24px rgba(45,79,119,.16)}.board-overlay span{color:#e35f54;font-family:var(--learner-font-display);font-size:46px;font-weight:900}.board-overlay strong{color:#233d79;font-family:var(--learner-font-display);font-size:42px;font-weight:900}.board-overlay p{margin:0;color:#45546a;font-family:var(--learner-font-display);font-size:30px;font-weight:900}.board-overlay button{min-width:190px;min-height:56px;padding:0 26px;border:0;border-radius:20px;background:linear-gradient(180deg,#7797f5,#4f72e1);color:#fff;font-family:var(--learner-font-display);font-size:21px;font-weight:900;box-shadow:0 7px 16px rgba(49,80,150,.24);cursor:pointer}.board-overlay button:disabled{opacity:.65}.result-overlay,.match-overlay{background:rgba(255,250,220,.97)}.stars{color:#f3bd39;font-size:36px;letter-spacing:8px;text-shadow:0 2px #c9861c}.match-overlay strong{font-size:46px}.sound-button:focus-visible,.player-slot:focus-visible,.board-overlay button:focus-visible{outline:5px solid #ffd54a;outline-offset:3px}@keyframes board-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@media(max-width:900px){.battle-body{grid-template-columns:160px minmax(0,1fr)}.opponent-panel img{max-height:220px}.tile-pool{grid-template-columns:repeat(4,62px)}.game-board{overflow-y:auto;justify-content:flex-start}.player-slot{width:58px;height:60px}}@media(max-width:700px){.battle{overflow-y:auto}.battle-body{grid-template-columns:1fr}.opponent-panel{display:grid;grid-template-columns:80px 1fr}.opponent-panel img{width:80px;height:90px}.opponent-badge{grid-column:2}.round-dots{display:none}}@media(max-height:800px){.battle{gap:8px;padding:10px 16px}.scoreboard{min-height:46px}.battle-body{grid-template-columns:180px minmax(0,1fr);gap:12px}.opponent-panel img{max-height:220px}.game-board{gap:7px;padding:10px 14px}.target-word{font-size:30px;padding-block:5px}.sound-button{width:44px;height:44px}.race-board{min-height:48px}.opponent-slot{width:42px;height:41px}.player-slot{width:58px;height:56px}.tile-pool{grid-template-columns:repeat(8,56px);min-height:58px}.hangul-tile{height:54px;font-size:26px}.board-overlay strong{font-size:38px}}@media(prefers-reduced-motion:reduce){.player-board.wrong .player-slot.filled{animation:none}.hangul-tile{transition:none}}
</style>
