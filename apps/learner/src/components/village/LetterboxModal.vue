<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VillageModal from './VillageModal.vue'

interface VillageLetter {
  id: string
  sender: string
  role: string
  subject: string
  message: string
  date: string
  stamp: string
  color: string
}

const emit = defineEmits<{ close: [] }>()

const letters: VillageLetter[] = [
  {
    id: 'teacher-1', sender: '김 선생님', role: '선생님', subject: '끝까지 읽은 윤정이에게',
    message: '윤정아, 오늘 어려운 글도 천천히 끝까지 읽었구나. 포기하지 않고 다시 읽는 모습이 정말 멋졌어. 내일도 선생님이 응원할게!',
    date: '오늘', stamp: '★', color: '#7aa8ef',
  },
  {
    id: 'rabbit-1', sender: '토리', role: '이야기 친구', subject: '우리 또 모험하자!',
    message: '윤정아, 나를 이야기에서 만나 줘서 고마워! 네가 만든 마을을 구경하고 싶어. 나를 마을에 초대해 주면 신나게 뛰어놀게!',
    date: '어제', stamp: '♥', color: '#f49aaa',
  },
  {
    id: 'parent-1', sender: '엄마', role: '가족', subject: '우리 윤정이 최고',
    message: '오늘도 스스로 책을 펼친 윤정이가 정말 자랑스러워. 조금씩 읽어도 괜찮아. 언제나 네 편이야. 사랑해!',
    date: '7월 22일', stamp: '✿', color: '#f2b965',
  },
  {
    id: 'ant-1', sender: '단단이', role: '이야기 친구', subject: '부지런한 친구에게',
    message: '윤정아, 오늘 모은 글자들이 차곡차곡 쌓이고 있어! 나처럼 한 걸음씩 가다 보면 어느새 멋진 이야기를 완성할 거야.',
    date: '7월 21일', stamp: '●', color: '#72b76c',
  },
]

const loadReadIds = () => {
  try { return JSON.parse(localStorage.getItem('iread-village-read-letters') ?? '[]') as string[] }
  catch { return [] }
}
const readIds = ref<string[]>(loadReadIds())
const selectedId = ref(letters[0]?.id ?? '')
const selectedLetter = computed(() => letters.find((letter) => letter.id === selectedId.value) ?? letters[0]!)

const openLetter = (letter: VillageLetter) => {
  selectedId.value = letter.id
  if (!readIds.value.includes(letter.id)) {
    readIds.value.push(letter.id)
    localStorage.setItem('iread-village-read-letters', JSON.stringify(readIds.value))
  }
}

onMounted(() => openLetter(selectedLetter.value))
</script>

<template>
  <VillageModal title="우리 마을 편지함" description="가족과 선생님, 이야기 친구들이 마음을 보냈어요." @close="emit('close')">
    <div class="letterbox-layout">
      <nav class="letter-list" aria-label="받은 편지 목록">
        <button
          v-for="letter in letters"
          :key="letter.id"
          type="button"
          :class="{ active: selectedId === letter.id, unread: !readIds.includes(letter.id) }"
          @click="openLetter(letter)"
        >
          <span class="sender-mark" :style="{ background: letter.color }">{{ letter.stamp }}</span>
          <span class="letter-summary"><strong>{{ letter.sender }}</strong><small>{{ letter.subject }}</small></span>
          <time>{{ letter.date }}</time>
          <i v-if="!readIds.includes(letter.id)" aria-label="읽지 않은 편지"></i>
        </button>
      </nav>

      <article class="letter-paper">
        <span class="paper-tape" aria-hidden="true"></span>
        <header>
          <div class="big-stamp" :style="{ '--stamp-color': selectedLetter.color }">{{ selectedLetter.stamp }}</div>
          <div><small>{{ selectedLetter.role }}</small><h3>{{ selectedLetter.sender }}</h3></div>
          <time>{{ selectedLetter.date }}</time>
        </header>
        <h4>{{ selectedLetter.subject }}</h4>
        <p>{{ selectedLetter.message }}</p>
        <strong class="signature">{{ selectedLetter.sender }}가</strong>
        <span class="paper-flower" aria-hidden="true">✿</span>
      </article>
    </div>
  </VillageModal>
</template>

<style scoped>
.letterbox-layout{display:grid;grid-template-columns:minmax(270px,.78fr) minmax(390px,1.22fr);gap:22px;padding:0 30px 32px}.letter-list{display:flex;flex-direction:column;gap:10px}.letter-list button{position:relative;display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:12px;min-height:76px;padding:10px 14px;border:2px solid #e5eced;border-radius:20px;background:#fff;color:#30485c;text-align:left;cursor:pointer;transition:transform .16s ease,border-color .16s ease,background .16s ease}.letter-list button:hover{transform:translateX(3px);border-color:#a8c989}.letter-list button.active{border-color:#7eb05e;background:#eff9e8;box-shadow:0 7px 16px rgba(77,122,50,.12)}.sender-mark{width:46px;height:46px;display:grid;place-items:center;border:3px solid #fff;border-radius:15px;color:#fff;box-shadow:0 3px 8px rgba(45,67,45,.18);font-size:23px;font-weight:900}.letter-summary{min-width:0;display:flex;flex-direction:column}.letter-summary strong{font-size:18px;font-weight:900}.letter-summary small{overflow:hidden;color:#718090;font-size:14px;font-weight:700;white-space:nowrap;text-overflow:ellipsis}.letter-list time{align-self:start;padding-top:4px;color:#8b969f;font-size:13px;font-weight:700}.letter-list i{position:absolute;right:12px;bottom:12px;width:10px;height:10px;border-radius:50%;background:#f06956;box-shadow:0 0 0 4px #ffe2dc}.letter-paper{position:relative;min-height:430px;padding:46px 44px 34px;border:2px solid #ead8ac;border-radius:10px 24px 18px 14px;background:repeating-linear-gradient(0deg,transparent 0 35px,rgba(112,149,188,.12) 35px 37px),#fffaf0;box-shadow:0 12px 28px rgba(95,72,30,.16);transform:rotate(.25deg)}.letter-paper:before{position:absolute;inset:12px;border:2px dashed rgba(223,172,92,.5);border-radius:8px 18px 14px 10px;content:'';pointer-events:none}.paper-tape{position:absolute;top:-9px;left:50%;width:116px;height:31px;background:rgba(255,218,111,.72);transform:translateX(-50%) rotate(-2deg);clip-path:polygon(3% 10%,97% 0,100% 88%,0 100%)}.letter-paper header{position:relative;display:flex;align-items:center;gap:13px;padding:0;background:transparent}.big-stamp{width:58px;height:58px;display:grid;place-items:center;border:4px dotted var(--stamp-color);border-radius:50%;color:var(--stamp-color);font-size:28px;font-weight:900;transform:rotate(-8deg)}.letter-paper header div:nth-child(2){flex:1}.letter-paper header small{color:#829071;font-size:14px;font-weight:800}.letter-paper h3{margin:0;color:#355132;font-family:var(--learner-font-display);font-size:25px;font-weight:900}.letter-paper header time{color:#85795f;font-size:14px;font-weight:700}.letter-paper h4{position:relative;margin:27px 0 17px;color:#604b2f;font-family:var(--learner-font-display);font-size:clamp(23px,2vw,30px);font-weight:900}.letter-paper p{position:relative;margin:0;color:#4f4a40;font-size:clamp(18px,1.5vw,22px);font-weight:700;line-height:1.85;word-break:keep-all}.signature{position:relative;display:block;margin-top:28px;color:#6f7958;font-size:18px;text-align:right}.paper-flower{position:absolute;right:23px;bottom:12px;color:#efb75f;font-size:34px;transform:rotate(12deg)}
@media(max-width:760px){.letterbox-layout{grid-template-columns:1fr;padding-inline:18px}.letter-list{max-height:220px;overflow:auto}.letter-paper{min-height:360px;padding:38px 28px 28px}}
</style>
