<script setup lang="ts">
import { storyFriends } from '../../data/villageMockData'
import type { VillageItem } from '../../types/village'
import VillageModal from './VillageModal.vue'

defineProps<{ isPlaced: (id: string) => boolean }>()
const emit = defineEmits<{ close: []; select: [item: VillageItem]; locked: [] }>()
</script>

<template>
  <VillageModal title="이야기 친구들" description="이야기를 읽고 만난 친구들과 함께 놀아요." @close="emit('close')">
    <div class="grid">
      <article v-for="friend in storyFriends" :key="friend.id" class="friend" :class="{ locked: !friend.unlocked }">
        <div class="portrait"><img :src="friend.image" :alt="friend.name" /></div>
        <div class="copy">
          <span v-if="!friend.unlocked" class="state">잠겨 있음</span>
          <span v-else-if="isPlaced(friend.id)" class="state placed">마을에 있어요</span>
          <span v-else class="state ready">만난 친구</span>
          <h3>{{ friend.name }}</h3><p>{{ friend.storyTitle }}</p>
        </div>
        <button v-if="friend.unlocked" type="button" @click="emit('select', friend)">{{ isPlaced(friend.id) ? '자리 옮기기' : '배치하기' }}</button>
        <button v-else type="button" class="lock-button" @click="emit('locked')">이야기 더 읽기</button>
      </article>
    </div>
  </VillageModal>
</template>

<style scoped>
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:0 32px 32px}.friend{display:grid;grid-template-columns:112px 1fr;gap:14px;align-items:center;padding:16px;border:2px solid #e4edf5;border-radius:24px;background:white}.portrait{width:112px;height:112px;border-radius:22px;background:#ecf8df;overflow:hidden}.portrait img{width:100%;height:100%;object-fit:contain}.copy{min-width:0}.state{display:inline-block;padding:3px 9px;border-radius:999px;background:#e7ebef;color:#607080;font-size:13px;font-weight:800}.state.ready{background:#e6f7e9;color:#32844c}.state.placed{background:#e6f1ff;color:#2f6ebf}.friend h3{margin-top:6px;color:#203b5a;font-size:22px;font-weight:900}.friend p{overflow:hidden;color:#67788a;font-size:15px;white-space:nowrap;text-overflow:ellipsis}.friend button{grid-column:1/-1;min-height:48px;border:0;border-radius:15px;background:#43ad63;color:white;font-size:17px;font-weight:900;cursor:pointer}.friend.locked .portrait img{filter:grayscale(1);opacity:.45}.friend .lock-button{background:#e6ebef;color:#687887}@media(max-width:700px){.grid{grid-template-columns:1fr;padding:0 18px 24px}}
</style>
