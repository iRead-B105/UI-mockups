<script setup lang="ts">
import { useTobiiGazeBridge } from './composables/useTobiiGazeBridge'

// 전역 시선 추적 생산자: 로컬 Tobii 브릿지 서버(ws://127.0.0.1:8765/gaze)에서
// 시선 프레임을 받아 window `iread:gaze` 이벤트로 발생시킨다.
// 장치가 없으면 조용히 재연결을 시도만 하고, 기존 소비자(StoryReader 등)는
// pointermove 폴백으로 동작한다.
useTobiiGazeBridge()
</script>

<template>
  <RouterView />
</template>
