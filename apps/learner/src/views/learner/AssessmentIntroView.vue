<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AssessmentDeviceStatus from '@/features/assessment/components/AssessmentDeviceStatus.vue'
import { useAssessmentSession } from '@/features/assessment/composables/useAssessmentSession'

const router = useRouter()
const { session, canResume, prepare, start, resume } = useAssessmentSession()
onMounted(() => prepare('initial'))

const proceed = () => {
  if (canResume.value) resume()
  else start()
  router.push({ name: 'assessment-session' })
}
</script>

<template>
  <main class="assessment-intro">
    <section class="intro-copy">
      <span class="badge">실력 도전</span>
      <h1>{{ canResume ? '이어 할 준비가 되었나요?' : '지금의 읽기 모습을 알아봐요' }}</h1>
      <p>정답이나 오답은 바로 알려 주지 않아요.<br />모르면 가장 알맞다고 생각하는 것을 한 번 골라 주세요.</p>
      <ul>
        <li>듣기 소리는 처음 들려주고, 필요하면 한 번 더 들을 수 있어요.</li>
        <li>선택을 마치기 전에는 바꿀 수 있어요.</li>
        <li>힘들면 언제든 위쪽 홈 버튼을 눌러 쉴 수 있어요.</li>
      </ul>
    </section>
    <AssessmentDeviceStatus />
    <button class="start-button" type="button" :disabled="!session?.currentItemId" @click="proceed">
      {{ canResume ? '이어서 하기' : '시작하기' }}
    </button>
  </main>
</template>

<style scoped>
.assessment-intro{min-height:100%;display:grid;align-content:center;justify-items:center;gap:24px;padding:34px;background:linear-gradient(180deg,#eaf8ff,#f8fcff);font-family:var(--learner-font-reading);overflow:auto}.intro-copy{max-width:720px;text-align:center}.badge{display:inline-block;padding:8px 15px;border-radius:999px;background:#1769aa;color:#fff;font-weight:900}.intro-copy h1{margin:16px 0 10px;color:#173d57;font-size:clamp(30px,4vw,46px)}.intro-copy p{margin:0;color:#48697c;font-size:19px;line-height:1.65}.intro-copy ul{display:grid;gap:7px;margin:18px auto 0;padding:0;list-style:none;color:#365c72;font-weight:700}.start-button{min-width:220px;min-height:66px;border:0;border-radius:22px;background:#1769aa;color:#fff;font-size:22px;font-weight:900;box-shadow:0 6px 0 #0c4776}.start-button:disabled{background:#aebcc5;box-shadow:none}
</style>

