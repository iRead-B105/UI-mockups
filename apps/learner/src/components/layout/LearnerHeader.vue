<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iReadMainLogo from '../../assets/header/iread-main.png'
import headerCloudBackground from '../../assets/header/iread-header-true-alpha.png'

withDefaults(defineProps<{ userName?: string; stars?: number }>(), { userName: '윤정', stars: undefined })

const router = useRouter()
const eyeTrackerConnected = ref(true)
const speechRecognitionActive = ref(false)

const handleLogout = async () => {
  localStorage.removeItem('iread-auth')
  localStorage.removeItem('iread-user')
  sessionStorage.removeItem('iread-auth')
  await router.replace({ name: 'login' })
}
</script>

<template>
  <header class="learner-header">
    <img class="header-cloud-background" :src="headerCloudBackground" alt="" aria-hidden="true" />

    <div class="profile-cluster">
      <div v-if="stars !== undefined" class="star-balance" :aria-label="`별 ${stars}개`">
        <span aria-hidden="true">☆</span><strong>{{ stars }}</strong>
      </div>
      <div class="profile" :aria-label="`${userName} 프로필`">
        <span class="avatar" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle class="avatar-bg" cx="32" cy="32" r="30" />
            <circle class="avatar-hair-side" cx="14" cy="30" r="10" />
            <circle class="avatar-hair-side" cx="50" cy="30" r="10" />
            <path class="avatar-hair" d="M14 31c0-15 8-24 18-24s18 9 18 24v8H14v-8Z" />
            <circle class="avatar-face" cx="32" cy="32" r="17" />
            <path class="avatar-bangs" d="M16 27c3-12 9-18 17-18 9 0 15 7 16 19-5-1-9-4-12-8-4 5-11 8-21 7Z" />
            <circle class="avatar-eye" cx="25" cy="33" r="2.1" />
            <circle class="avatar-eye" cx="39" cy="33" r="2.1" />
            <path class="avatar-smile" d="M27 40c3 3 7 3 10 0" />
            <path class="avatar-shirt" d="M18 58c2-10 7-14 14-14s12 4 14 14H18Z" />
            <circle class="avatar-star" cx="32" cy="51" r="3" />
          </svg>
        </span>
        <strong>{{ userName }}</strong>
      </div>
    </div>

    <RouterLink class="brand" :to="{ name: 'learner-home' }" aria-label="아이리드 홈으로 이동">
      <img :src="iReadMainLogo" alt="아이리드" />
    </RouterLink>

    <nav class="device-actions" aria-label="학습 장치 상태와 나가기">
      <button
        class="device-button"
        :class="{ active: eyeTrackerConnected }"
        type="button"
        :aria-pressed="eyeTrackerConnected"
        :aria-label="eyeTrackerConnected ? '아이트래커 연결됨' : '아이트래커 연결 안 됨'"
        @click="eyeTrackerConnected = !eyeTrackerConnected"
      >
        <span class="device-icon" aria-hidden="true">
          <svg class="eyes-icon" viewBox="0 0 48 48">
            <ellipse class="eye-white" cx="15" cy="24" rx="10" ry="14" />
            <ellipse class="eye-white" cx="33" cy="24" rx="10" ry="14" />
            <ellipse class="eye-pupil" cx="17" cy="26" rx="5.5" ry="8" />
            <ellipse class="eye-pupil" cx="35" cy="26" rx="5.5" ry="8" />
            <circle class="eye-shine" cx="19" cy="22" r="2.2" />
            <circle class="eye-shine" cx="37" cy="22" r="2.2" />
          </svg>
          <i></i>
        </span>
        <span class="visually-hidden">시선</span>
      </button>

      <button
        class="device-button device-button--voice"
        :class="{ active: speechRecognitionActive }"
        type="button"
        :aria-pressed="speechRecognitionActive"
        :aria-label="speechRecognitionActive ? '음성 인식 중' : '음성 인식 대기 중'"
        @click="speechRecognitionActive = !speechRecognitionActive"
      >
        <span class="device-icon" aria-hidden="true">
          <svg class="microphone-icon" viewBox="0 0 48 48">
            <rect class="mic-body" x="17" y="7" width="14" height="24" rx="7" />
            <path class="mic-line" d="M11.5 25.5a12.5 12.5 0 0 0 25 0M24 38v5M17 43h14" />
            <path class="mic-shine" d="M21 12v10" />
          </svg>
          <i></i>
        </span>
        <span class="visually-hidden">음성</span>
      </button>

      <button class="exit-button" type="button" aria-label="로그아웃하고 나가기" @click="handleLogout">
        <svg class="exit-icon" viewBox="0 0 48 48" aria-hidden="true">
          <path class="exit-door" d="M7 7h20v34H7z" />
          <path class="exit-door-face" d="m12 11 15-4v34l-15-4z" />
          <circle class="exit-knob" cx="23" cy="25" r="1.8" />
          <path class="exit-arrow" d="M23 24h18M34 17l7 7-7 7" />
        </svg>
        <span class="visually-hidden">나가기</span>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.learner-header{position:absolute;z-index:20;top:0;right:0;left:0;height:var(--learner-header-height);display:flex;align-items:flex-start;justify-content:space-between;padding:clamp(28px,2.8vw,46px) clamp(32px,5vw,84px) 0;background:none;font-family:var(--learner-font-display);isolation:isolate;overflow:visible;pointer-events:none}
.header-cloud-background{position:absolute;z-index:0;top:clamp(-84px,-4.5vw,-42px);left:0;width:100%;height:auto;display:block;pointer-events:none;user-select:none}
.brand{position:absolute;z-index:3;top:clamp(-37px,0vw,-30px);left:50%;width:clamp(190px,15.84vw,290px);height:clamp(100px,11.23vw,167px);display:block;text-decoration:none;pointer-events:auto;transform:translateX(-50%);transition:transform var(--learner-duration-fast),filter var(--learner-duration-fast)}
.brand img{display:block;width:100%;height:100%;object-fit:contain}
.brand:hover{transform:translateX(-50%) translateY(-2px) scale(1.035);filter:brightness(1.04)}
.brand:active{transform:translateX(-50%) translateY(1px) scale(.99)}
.brand:focus-visible,.device-button:focus-visible,.exit-button:focus-visible{outline:none;box-shadow:var(--learner-shadow-focus)}
.profile-cluster{position:relative;z-index:3;display:flex;align-items:center;gap:var(--learner-space-3);pointer-events:auto;transform:translateY(-22px)}
.profile{min-width:clamp(170px,13vw,210px);height:clamp(64px,5.4vw,80px);display:flex;align-items:center;gap:clamp(9px,1vw,14px);padding:5px clamp(18px,1.7vw,26px) 5px 7px;border:4px solid rgba(255,255,255,.96);border-radius:999px;background:#78cef4;color:#173454;box-shadow:0 6px 0 #4da8d4,0 10px 20px rgb(41 100 145 / 20%);transition:transform var(--learner-duration-fast),background var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.profile:hover{transform:translateY(-2px);background:#86daf7;box-shadow:0 8px 0 #4da8d4,0 13px 24px rgb(41 100 145 / 22%)}
.star-balance{height:var(--learner-control-height-large);min-width:140px;display:flex;align-items:center;justify-content:center;gap:var(--learner-space-3);padding:0 var(--learner-space-6);border-radius:var(--learner-radius-pill);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-small);color:#4d4539}
.star-balance span{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:#ffd968;color:#fff;font-size:34px;font-weight:900;line-height:1;text-shadow:0 2px #e3a82f}
.star-balance strong{font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy)}
.avatar{width:clamp(52px,4.3vw,64px);height:clamp(52px,4.3vw,64px);display:grid;place-items:center;overflow:hidden;flex:0 0 auto;border:4px solid #fff;border-radius:50%;background:#f1edf5;box-shadow:0 3px 9px rgba(34,91,130,.18)}.avatar svg{width:100%;height:100%}.avatar-bg{fill:#fff7e4}.avatar-hair,.avatar-hair-side,.avatar-bangs{fill:#6d3b25}.avatar-face{fill:#ffd6ad}.avatar-eye{fill:#39261d}.avatar-smile{fill:none;stroke:#e45c56;stroke-width:2.5;stroke-linecap:round}.avatar-shirt{fill:#ef8296}.avatar-star{fill:#ffd248}
.profile strong{font-size:clamp(20px,1.55vw,25px);font-weight:var(--learner-font-weight-heavy);letter-spacing:-.02em;text-shadow:0 1px 0 rgba(255,255,255,.55)}
.device-actions{position:relative;z-index:3;display:flex;align-items:center;gap:clamp(8px,1vw,14px);pointer-events:auto;transform:translateY(-22px)}
.device-button,.exit-button{width:clamp(58px,4.8vw,72px);height:clamp(58px,4.8vw,72px);display:grid;place-items:center;padding:0;border:4px solid rgba(255,255,255,.96);border-radius:50%;background:#78cef4;color:#17497b;box-shadow:0 6px 0 #4da8d4,0 10px 20px rgb(41 100 145 / 20%);font-family:var(--learner-font-display);cursor:pointer;transition:transform var(--learner-duration-fast),background var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.device-button:hover,.exit-button:hover{transform:translateY(-2px);box-shadow:0 10px 23px rgb(100 89 45 / 17%)}
.device-button:active,.exit-button:active{transform:translateY(4px);box-shadow:0 2px 0 #4da8d4,0 5px 10px rgb(41 100 145 / 16%)}
.device-icon{position:relative;width:clamp(38px,3.2vw,48px);height:clamp(38px,3.2vw,48px);display:grid;place-items:center}.device-icon svg,.exit-button svg{width:100%;height:100%;overflow:visible}.device-icon i{position:absolute;right:-2px;bottom:0;width:12px;height:12px;border:2px solid #fff;border-radius:50%;background:#aeb7c4}.device-button.active{background:#86daf7;color:#17497b}.device-button.active .device-icon i{background:#42c768;box-shadow:0 0 0 3px rgba(66,199,104,.16)}.device-button--voice.active{background:#86daf7;color:#17497b}.device-button--voice.active .device-icon i{background:#438af0;box-shadow:0 0 0 3px rgba(67,138,240,.16)}.eyes-icon .eye-white{fill:#fff;stroke:#173454;stroke-width:2.6}.eyes-icon .eye-pupil{fill:#173454}.eyes-icon .eye-shine{fill:#fff}.microphone-icon .mic-body{fill:#236aa2}.microphone-icon .mic-line{fill:none;stroke:#17497b;stroke-width:3.8;stroke-linecap:round;stroke-linejoin:round}.microphone-icon .mic-shine{fill:none;stroke:#92e2fb;stroke-width:2.8;stroke-linecap:round}.exit-button{background:#78cef4;color:#17497b}.exit-button svg{width:clamp(38px,3.15vw,47px);height:clamp(38px,3.15vw,47px)}.exit-door{fill:#dff4ff;stroke:#17497b;stroke-width:3;stroke-linejoin:round}.exit-door-face{fill:#bce9fb;stroke:#17497b;stroke-width:3;stroke-linejoin:round}.exit-knob{fill:#17497b}.exit-arrow{fill:none;stroke:#17497b;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
:global(html[data-iread-motion="reduced"] *){animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
@media(max-width:1100px){.learner-header{padding-inline:30px}.device-button,.exit-button{width:58px;height:58px}.star-balance{min-width:auto;padding-inline:var(--learner-space-3)}.star-balance strong{font-size:20px}}
@media(max-width:700px){.learner-header{padding-inline:var(--learner-space-4)}.brand{width:126px;height:72px}.profile{min-width:auto;padding-right:8px}.profile>strong{display:none}.device-actions{gap:5px}.device-button,.exit-button{width:50px;height:52px;border-radius:17px}.star-balance{display:none}}
</style>
