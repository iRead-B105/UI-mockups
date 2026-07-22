<script setup lang="ts">
import { shopItems } from '../../data/villageMockData'
import type { VillageItem } from '../../types/village'
import VillageModal from './VillageModal.vue'

defineProps<{ points: number; isOwned: (id: string) => boolean }>()
const emit = defineEmits<{ close: []; purchase: [item: VillageItem]; place: [item: VillageItem] }>()
</script>

<template>
  <VillageModal title="포인트 상점" description="모은 포인트로 우리 마을을 꾸며 보세요." @close="emit('close')">
    <div class="point-balance"><span class="coin">별</span><span>보유 포인트</span><strong>{{ points.toLocaleString() }}P</strong></div>
    <div class="grid">
      <article v-for="item in shopItems" :key="item.id" class="item-card">
        <span class="category">{{ item.category }}</span>
        <img :src="item.image" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <p v-if="isOwned(item.id)" class="owned">보유 중</p>
        <p v-else class="price"><span class="small-coin">별</span>{{ item.price }}P</p>
        <button v-if="isOwned(item.id)" type="button" class="place" @click="emit('place', item)">마을에 놓기</button>
        <button v-else type="button" class="buy" @click="emit('purchase', item)">구매하기</button>
      </article>
    </div>
  </VillageModal>
</template>

<style scoped>
.point-balance{display:flex;align-items:center;gap:10px;margin:0 32px 22px;padding:13px 18px;border-radius:18px;background:#eaf5ff;color:#315675;font-size:18px;font-weight:700}.point-balance strong{margin-left:auto;color:#126dd5;font-size:28px;font-weight:900}.coin,.small-coin{display:inline-grid;place-items:center;border-radius:50%;background:#ffc728;color:#8c5700;font-weight:900}.coin{width:38px;height:38px}.small-coin{width:25px;height:25px;margin-right:6px;font-size:11px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:0 32px 32px}.item-card{position:relative;display:flex;flex-direction:column;align-items:center;min-height:300px;padding:16px;border:2px solid #e6edf3;border-radius:24px;background:#fff;box-shadow:0 6px 18px rgba(40,80,120,.08)}.category{position:absolute;top:14px;left:14px;padding:4px 10px;border-radius:999px;background:#f0f6eb;color:#4f8324;font-size:14px;font-weight:700}.item-card img{width:140px;height:140px;object-fit:contain}.item-card h3{font-size:21px;font-weight:900;color:#29425d}.price,.owned{min-height:34px;font-size:18px;font-weight:800}.price{color:#e69600}.owned{color:#3b9a4b}.item-card button{width:100%;min-height:48px;margin-top:auto;border:0;border-radius:15px;color:white;font-size:17px;font-weight:900;cursor:pointer}.buy{background:#ff9f36}.place{background:#43ad63}.item-card button:hover{transform:translateY(-2px)}@media(max-width:700px){.grid{grid-template-columns:repeat(2,1fr);padding:0 18px 24px}.point-balance{margin-inline:18px}.item-card{min-height:280px}}
</style>
