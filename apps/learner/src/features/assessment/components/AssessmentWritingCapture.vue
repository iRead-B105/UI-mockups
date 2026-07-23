<script setup lang="ts">
import { computed, ref } from 'vue'

type Point = { x: number; y: number }

const emit = defineEmits<{ changed: [strokes: Point[][]] }>()
const strokes = ref<Point[][]>([])
const activeStroke = ref<Point[] | null>(null)
const hasWriting = computed(() => strokes.value.some((stroke) => stroke.length > 1))

const pointFrom = (event: PointerEvent): Point => {
  const box = (event.currentTarget as SVGElement).getBoundingClientRect()
  return {
    x: Math.round(((event.clientX - box.left) / box.width) * 320),
    y: Math.round(((event.clientY - box.top) / box.height) * 240),
  }
}

const start = (event: PointerEvent) => {
  ;(event.currentTarget as SVGElement).setPointerCapture(event.pointerId)
  activeStroke.value = [pointFrom(event)]
  strokes.value = [...strokes.value, activeStroke.value]
}

const move = (event: PointerEvent) => {
  if (!activeStroke.value) return
  activeStroke.value.push(pointFrom(event))
}

const finish = () => {
  activeStroke.value = null
  emit('changed', strokes.value.map((stroke) => [...stroke]))
}

const erase = () => {
  strokes.value = []
  activeStroke.value = null
  emit('changed', [])
}
</script>

<template>
  <div class="writing-capture">
    <svg
      viewBox="0 0 320 240"
      role="img"
      aria-label="글자를 쓰는 칸"
      @pointerdown.prevent="start"
      @pointermove.prevent="move"
      @pointerup.prevent="finish"
      @pointercancel="finish"
    >
      <path d="M160 0v240M0 120h320" class="guide" />
      <polyline
        v-for="(stroke, index) in strokes"
        :key="index"
        :points="stroke.map((point) => `${point.x},${point.y}`).join(' ')"
        class="stroke"
      />
    </svg>
    <button type="button" :disabled="!hasWriting" @click="erase">지우고 다시 쓰기</button>
  </div>
</template>

<style scoped>
.writing-capture{display:grid;justify-items:center;gap:12px}.writing-capture svg{width:min(380px,78vw);touch-action:none;border:4px solid #8eb8cf;border-radius:24px;background:#fff;box-shadow:0 6px 0 #d3e3eb}.guide{fill:none;stroke:#dbe8ef;stroke-dasharray:8 8;stroke-width:2}.stroke{fill:none;stroke:#174d72;stroke-linecap:round;stroke-linejoin:round;stroke-width:10}.writing-capture button{min-height:44px;padding:0 18px;border:2px solid #9bb6c7;border-radius:14px;background:#fff;color:#345d75;font-weight:800}.writing-capture button:disabled{opacity:.45}
</style>

