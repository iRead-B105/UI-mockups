<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dadokReading from '../../assets/story/dadok-reading.png'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  const image = new Image()
  image.src = dadokReading
  image.onload = () => {
    const target = canvas.value
    const context = target?.getContext('2d', { willReadFrequently: true })
    if (!target || !context) return

    context.drawImage(image, 0, 0, target.width, target.height)
    const frame = context.getImageData(0, 0, target.width, target.height)
    const pixels = frame.data
    const total = target.width * target.height
    const outside = new Uint8Array(total)
    const queue = new Int32Array(total)
    let head = 0
    let tail = 0

    const isBackground = (position: number) => {
      const index = position * 4
      const red = pixels[index]!
      const green = pixels[index + 1]!
      const blue = pixels[index + 2]!
      return Math.min(red, green, blue) > 210 && Math.max(red, green, blue) - Math.min(red, green, blue) < 18
    }

    const enqueue = (position: number) => {
      if (position < 0 || position >= total || outside[position] || !isBackground(position)) return
      outside[position] = 1
      queue[tail++] = position
    }

    for (let x = 0; x < target.width; x++) {
      enqueue(x)
      enqueue((target.height - 1) * target.width + x)
    }
    for (let y = 0; y < target.height; y++) {
      enqueue(y * target.width)
      enqueue(y * target.width + target.width - 1)
    }

    while (head < tail) {
      const position = queue[head++]!
      const x = position % target.width
      if (x > 0) enqueue(position - 1)
      if (x < target.width - 1) enqueue(position + 1)
      enqueue(position - target.width)
      enqueue(position + target.width)
    }

    for (let position = 0; position < total; position++) {
      if (outside[position]) pixels[position * 4 + 3] = 0
    }
    context.putImageData(frame, 0, 0)
  }
})
</script>

<template>
  <canvas ref="canvas" class="croc-image" width="701" height="561" role="img" aria-label="책을 읽으며 연필을 든 다독 악어"></canvas>
</template>

<style scoped>
.croc-image { display: block; width: 100%; height: 100%; object-fit: contain; }
</style>
