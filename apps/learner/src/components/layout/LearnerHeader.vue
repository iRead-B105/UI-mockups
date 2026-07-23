<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import iReadHeaderLogo from '../../assets/header/iread-header.png'

withDefaults(defineProps<{ userName?: string; stars?: number }>(), { userName: '윤정', stars: undefined })

interface LearnerSettings {
  sound: boolean
  motion: boolean
}

const SETTINGS_KEY = 'iread-learner-settings'
const router = useRouter()
const profileArea = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const settingsOpen = ref(false)

const loadSettings = (): LearnerSettings => {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<LearnerSettings>
    return { sound: saved.sound ?? true, motion: saved.motion ?? true }
  } catch {
    return { sound: true, motion: true }
  }
}

const initialSettings = loadSettings()
const soundEnabled = ref(initialSettings.sound)
const motionEnabled = ref(initialSettings.motion)

const applyMotionSetting = () => {
  document.documentElement.dataset.ireadMotion = motionEnabled.value ? 'full' : 'reduced'
}

const closeMenu = () => {
  menuOpen.value = false
  settingsOpen.value = false
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  if (!menuOpen.value) settingsOpen.value = false
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  if (profileArea.value?.contains(event.target as Node)) return
  closeMenu()
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

const handleLogout = async () => {
  closeMenu()
  localStorage.removeItem('iread-auth')
  localStorage.removeItem('iread-user')
  sessionStorage.removeItem('iread-auth')
  await router.replace({ name: 'login' })
}

watch([soundEnabled, motionEnabled], () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    sound: soundEnabled.value,
    motion: motionEnabled.value,
  }))
  applyMotionSetting()
})

onMounted(() => {
  applyMotionSetting()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<template>
  <header class="learner-header">
    <RouterLink class="brand" :to="{ name: 'learner-home' }" aria-label="아이리드 학습자 홈">
      <img :src="iReadHeaderLogo" alt="아이리드" />
    </RouterLink>

    <RouterLink class="home-button" :to="{ name: 'learner-home' }" aria-label="학습자 홈">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <path class="home-cloud" d="M9 59h54c4 0 7-3 7-7s-3-7-7-7h-1c0-7-6-13-14-13-5 0-9 2-12 6-2-2-5-3-8-3-7 0-12 5-13 11-6 0-10 3-10 7s2 6 4 6Z" />
        <path class="home-roof" d="M17 36 36 19l19 17-4 5-15-13-15 13-4-5Z" />
        <path class="home-house" d="M22 37h28v23H22z" />
        <path class="home-door" d="M32 46h8v14h-8z" />
        <path class="home-window" d="M25 42h6v6h-6zm16 0h6v6h-6z" />
        <path class="home-star" d="m55 17 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L55 17Z" />
      </svg>
    </RouterLink>

    <div class="header-actions">
      <div v-if="stars !== undefined" class="star-balance" :aria-label="`별 ${stars}개`">
        <span aria-hidden="true">☆</span><strong>{{ stars }}</strong>
      </div>
      <div ref="profileArea" class="profile-area">
        <button
          class="profile"
          type="button"
          :aria-label="`${userName} 프로필 메뉴`"
          aria-controls="learner-profile-menu"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
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
          <svg class="profile-chevron" :class="{ open: menuOpen }" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <Transition name="profile-menu">
          <div v-if="menuOpen" id="learner-profile-menu" class="profile-menu">
            <template v-if="!settingsOpen">
              <div class="profile-summary">
                <span>{{ userName }}</span>
                <small>오늘도 즐겁게 읽어 봐요!</small>
              </div>
              <button class="menu-item" type="button" @click="settingsOpen = true">
                <span class="menu-icon settings-icon" aria-hidden="true">⚙</span>
                <strong>설정</strong>
                <span class="menu-arrow" aria-hidden="true">›</span>
              </button>
              <button class="menu-item menu-item--logout" type="button" @click="handleLogout">
                <span class="menu-icon" aria-hidden="true">↪</span>
                <strong>로그아웃</strong>
              </button>
            </template>

            <template v-else>
              <div class="settings-heading">
                <button type="button" aria-label="프로필 메뉴로 돌아가기" @click="settingsOpen = false">‹</button>
                <strong>설정</strong>
              </div>
              <label class="setting-row">
                <span><strong>효과음</strong><small>버튼과 활동 소리</small></span>
                <input v-model="soundEnabled" type="checkbox" />
                <i aria-hidden="true"></i>
              </label>
              <label class="setting-row">
                <span><strong>화면 움직임</strong><small>재미있는 동작 효과</small></span>
                <input v-model="motionEnabled" type="checkbox" />
                <i aria-hidden="true"></i>
              </label>
            </template>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.learner-header{position:relative;z-index:20;height:var(--learner-header-height);display:flex;align-items:center;justify-content:space-between;padding:0 var(--learner-page-padding);background:linear-gradient(135deg,var(--learner-color-primary),var(--learner-color-primary-dark));box-shadow:var(--learner-shadow-small);font-family:var(--learner-font-display)}
.brand{width:clamp(220px,22vw,340px);height:clamp(64px,9vh,90px);display:block;overflow:hidden;text-decoration:none}
.brand img{display:block;width:100%;height:100%;object-fit:contain;transform:translateY(3px) scale(2.8);transform-origin:center}
.home-button{position:absolute;left:50%;width:72px;height:68px;display:grid;place-items:center;transform:translateX(-50%);border:3px solid rgba(255,255,255,.9);border-radius:22px;background:linear-gradient(180deg,#fffdf4,#fff1bd);box-shadow:0 7px 0 rgba(38,73,177,.28),0 10px 20px rgba(28,49,128,.2);transition:transform var(--learner-duration-fast) var(--learner-easing-standard),box-shadow var(--learner-duration-fast)}
.home-button:hover{transform:translateX(-50%) translateY(-3px) rotate(-1deg);box-shadow:0 9px 0 rgba(38,73,177,.25),0 14px 24px rgba(28,49,128,.2)}
.home-button:active{transform:translateX(-50%) translateY(3px);box-shadow:0 3px 0 rgba(38,73,177,.25)}
.home-button svg{width:62px;height:62px;overflow:visible}.home-cloud{fill:#dff5ff}.home-roof{fill:#ff6e62}.home-house{fill:#ffd858}.home-door{fill:#39a6df}.home-window{fill:#fff}.home-star{fill:#ffb928}
.home-button:focus-visible,.profile:focus-visible,.brand:focus-visible{outline:none;box-shadow:var(--learner-shadow-focus)}
.profile-area{position:relative}
.profile{min-width:190px;height:var(--learner-control-height-large);display:flex;align-items:center;gap:12px;padding:5px 16px 5px 6px;border:3px solid rgba(255,255,255,.88);border-radius:var(--learner-radius-pill);background:linear-gradient(180deg,#fff,#fff7dc);color:var(--learner-color-text);box-shadow:0 6px 0 rgba(39,72,171,.22),var(--learner-shadow-small);cursor:pointer;transition:transform var(--learner-duration-fast),box-shadow var(--learner-duration-fast)}
.profile:hover{transform:translateY(-2px);box-shadow:0 8px 0 rgba(39,72,171,.2),var(--learner-shadow-card)}
.header-actions{display:flex;align-items:center;gap:var(--learner-space-5)}
.star-balance{height:var(--learner-control-height-large);min-width:140px;display:flex;align-items:center;justify-content:center;gap:var(--learner-space-3);padding:0 var(--learner-space-6);border-radius:var(--learner-radius-pill);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-small);color:#4d4539}
.star-balance span{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:#ffd968;color:#fff;font-size:34px;font-weight:900;line-height:1;text-shadow:0 2px #e3a82f}
.star-balance strong{font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy)}
.avatar{width:56px;height:56px;display:grid;place-items:center;overflow:hidden;border:3px solid #fff;border-radius:50%;background:#bcecff;box-shadow:0 3px 8px rgba(50,81,133,.18)}.avatar svg{width:100%;height:100%}.avatar-bg{fill:#9de3ff}.avatar-hair,.avatar-hair-side,.avatar-bangs{fill:#6d3b25}.avatar-face{fill:#ffd6ad}.avatar-eye{fill:#39261d}.avatar-smile{fill:none;stroke:#e45c56;stroke-width:2.5;stroke-linecap:round}.avatar-shirt{fill:#ff7f86}.avatar-star{fill:#ffd248}
.profile strong{font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy)}
.profile-chevron{width:22px;height:22px;margin-left:auto;fill:none;stroke:#61718a;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;transition:transform .18s ease}.profile-chevron.open{transform:rotate(180deg)}
.profile-menu{position:absolute;top:calc(100% + 15px);right:0;width:270px;overflow:hidden;padding:10px;border:3px solid #fff;border-radius:26px;background:#fffdf5;box-shadow:0 18px 38px rgba(30,49,101,.28);color:#263853}
.profile-menu::before{content:"";position:absolute;right:28px;top:-9px;width:18px;height:18px;background:#fffdf5;border-left:3px solid #fff;border-top:3px solid #fff;transform:rotate(45deg)}
.profile-summary{position:relative;display:flex;flex-direction:column;gap:3px;margin-bottom:8px;padding:13px 14px 15px;border-bottom:2px solid #f1e5c7}.profile-summary span{font-size:22px;font-weight:900}.profile-summary small{color:#738099;font-family:var(--learner-font-reading);font-size:14px;font-weight:700}
.menu-item{position:relative;width:100%;min-height:58px;display:flex;align-items:center;gap:12px;padding:8px 12px;border:0;border-radius:17px;background:transparent;color:#34465f;font-family:var(--learner-font-display);cursor:pointer}.menu-item:hover{background:#fff1bd}.menu-item strong{font-size:18px;font-weight:900}.menu-icon{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:#e9f3ff;color:#4d72dc;font-size:22px;font-weight:900}.settings-icon{background:#fff0b8;color:#d49319}.menu-arrow{margin-left:auto;color:#7c8a9d;font-size:29px}.menu-item--logout{color:#b34e4b}.menu-item--logout .menu-icon{background:#ffe5df;color:#df6259}
.settings-heading{display:flex;align-items:center;justify-content:center;min-height:54px;margin-bottom:8px;border-bottom:2px solid #f1e5c7}.settings-heading button{position:absolute;left:16px;width:36px;height:36px;border:0;border-radius:12px;background:#eef4ff;color:#4f6fc9;font-size:30px;line-height:1;cursor:pointer}.settings-heading strong{font-size:20px;font-weight:900}
.setting-row{position:relative;min-height:70px;display:flex;align-items:center;gap:12px;padding:9px 8px 9px 12px;border-radius:17px;cursor:pointer}.setting-row:hover{background:#fff8dc}.setting-row>span{display:flex;flex:1;flex-direction:column;gap:2px}.setting-row strong{font-size:17px;font-weight:900}.setting-row small{color:#7b8798;font-family:var(--learner-font-reading);font-size:13px;font-weight:700}.setting-row input{position:absolute;opacity:0;pointer-events:none}.setting-row i{position:relative;width:50px;height:30px;flex:0 0 auto;border-radius:999px;background:#c9d0da;transition:background .18s ease}.setting-row i::after{content:"";position:absolute;left:4px;top:4px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(40,55,80,.22);transition:transform .18s ease}.setting-row input:checked+i{background:#5d84e8}.setting-row input:checked+i::after{transform:translateX(20px)}.setting-row input:focus-visible+i{outline:4px solid #ffcf40;outline-offset:2px}
.profile-menu-enter-active,.profile-menu-leave-active{transition:opacity .16s ease,transform .16s ease}.profile-menu-enter-from,.profile-menu-leave-to{opacity:0;transform:translateY(-8px) scale(.97)}
:global(html[data-iread-motion="reduced"] *){animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
@media(max-width:900px){.star-balance{min-width:auto;padding-inline:var(--learner-space-3)}.star-balance strong{font-size:20px}.header-actions{gap:var(--learner-space-2)}}
@media(max-width:700px){.learner-header{padding-inline:var(--learner-space-4)}.brand{width:160px;height:62px}.home-button{width:62px;height:58px}.home-button svg{width:54px;height:54px}.profile{min-width:auto;padding-right:8px}.profile>strong,.profile-chevron{display:none}.star-balance span{width:34px;height:34px;font-size:27px}.profile-menu{right:-4px;width:min(270px,88vw)}}
</style>
