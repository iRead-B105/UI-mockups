import { onUnmounted, ref } from 'vue'

export function useTemporaryNotice(duration = 2200) {
  const visible = ref(false)
  let timer: ReturnType<typeof window.setTimeout> | undefined

  function show() {
    if (timer) window.clearTimeout(timer)

    visible.value = true
    timer = window.setTimeout(() => {
      visible.value = false
      timer = undefined
    }, duration)
  }

  onUnmounted(() => {
    if (timer) window.clearTimeout(timer)
  })

  return { visible, show }
}
