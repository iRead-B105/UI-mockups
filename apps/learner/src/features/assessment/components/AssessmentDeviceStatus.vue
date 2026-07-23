<script setup lang="ts">
import { computed, ref } from 'vue'

const microphoneChecked = ref(false)
const microphoneReady = ref(false)
const checking = ref(false)
const gazeConfirmed = ref(false)
const touchReady = computed(() => navigator.maxTouchPoints > 0)

const checkMicrophone = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    microphoneChecked.value = true
    return
  }
  checking.value = true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    microphoneReady.value = true
  } catch {
    microphoneReady.value = false
  } finally {
    microphoneChecked.value = true
    checking.value = false
  }
}
</script>

<template>
  <section class="device-status" aria-labelledby="device-title">
    <h2 id="device-title">선생님과 기기를 확인해 주세요</h2>
    <ul>
      <li :class="{ ready: gazeConfirmed }"><span>시선 추적기</span><b>{{ gazeConfirmed ? '확인됨' : '확인 필요' }}</b></li>
      <li :class="{ ready: microphoneReady }"><span>마이크</span><b>{{ microphoneReady ? '사용 가능' : microphoneChecked ? '확인 필요' : '확인 전' }}</b></li>
      <li :class="{ ready: touchReady }"><span>터치 입력</span><b>{{ touchReady ? '사용 가능' : '마우스 사용' }}</b></li>
    </ul>
    <div class="actions">
      <button type="button" @click="gazeConfirmed = !gazeConfirmed">시선 추적기 {{ gazeConfirmed ? '확인 취소' : '연결 확인' }}</button>
      <button type="button" :disabled="checking" @click="checkMicrophone">{{ checking ? '확인 중…' : '마이크 확인' }}</button>
    </div>
    <p>시선 추적기 연결 상태는 브라우저에서 자동 판단하지 않으므로 교수자가 직접 확인합니다.</p>
  </section>
</template>

<style scoped>
.device-status{width:min(660px,100%);padding:24px;border:3px solid #b9d5e4;border-radius:24px;background:#fff;text-align:left}.device-status h2{margin:0 0 14px;color:#173d57;font-size:20px}.device-status ul{display:grid;gap:8px;margin:0;padding:0;list-style:none}.device-status li{display:flex;justify-content:space-between;padding:11px 14px;border-radius:12px;background:#f1f5f7;color:#526c7b}.device-status li.ready{background:#eaf8f0;color:#246b45}.actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.actions button{min-height:44px;padding:0 15px;border:2px solid #1769aa;border-radius:12px;background:#fff;color:#1769aa;font-weight:800}.device-status p{margin:12px 0 0;color:#647f8e;font-size:13px;line-height:1.5}
</style>


