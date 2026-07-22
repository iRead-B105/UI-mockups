<script setup lang="ts">
import iReadHeaderLogo from '../../assets/header/iread-header.png'

withDefaults(defineProps<{ userName?: string; stars?: number }>(), { userName: '윤정', stars: undefined })
</script>

<template>
  <header class="learner-header">
    <RouterLink class="brand" :to="{ name: 'learner-home' }" aria-label="아이리드 학습자 홈">
      <img :src="iReadHeaderLogo" alt="아이리드" />
    </RouterLink>

    <RouterLink class="home-button" :to="{ name: 'learner-home' }" aria-label="학습자 홈">
      <span class="roof"></span><span class="house"></span>
    </RouterLink>

    <div class="header-actions">
      <div v-if="stars !== undefined" class="star-balance" :aria-label="`별 ${stars}개`">
        <span aria-hidden="true">☆</span><strong>{{ stars }}</strong>
      </div>
      <button class="profile" type="button" :aria-label="`${userName} 프로필`">
        <span class="avatar" aria-hidden="true">👧</span><strong>{{ userName }}</strong>
      </button>
    </div>
  </header>
</template>

<style scoped>
.learner-header{position:relative;z-index:20;height:var(--learner-header-height);display:flex;align-items:center;justify-content:space-between;padding:0 var(--learner-page-padding);background:linear-gradient(135deg,var(--learner-color-primary),var(--learner-color-primary-dark));box-shadow:var(--learner-shadow-small);font-family:var(--learner-font-display)}
.brand{width:clamp(220px,22vw,340px);height:clamp(64px,9vh,90px);display:block;overflow:hidden;text-decoration:none}
.brand img{display:block;width:100%;height:100%;object-fit:contain;transform:translateY(3px) scale(2.8);transform-origin:center}
.home-button{position:absolute;left:50%;width:var(--learner-control-height-large);height:var(--learner-control-height-large);transform:translateX(-50%);border-radius:var(--learner-radius-medium);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-card);transition:transform var(--learner-duration-fast) var(--learner-easing-standard)}
.home-button:hover{transform:translateX(-50%) translateY(-2px)}
.home-button:focus-visible,.profile:focus-visible,.brand:focus-visible{outline:none;box-shadow:var(--learner-shadow-focus)}
.roof{position:absolute;left:17px;top:15px;border-left:19px solid transparent;border-right:19px solid transparent;border-bottom:20px solid var(--learner-color-primary-light)}
.house{position:absolute;left:23px;top:32px;width:28px;height:24px;border-radius:2px;background:var(--learner-color-primary-light)}
.profile{min-width:190px;height:var(--learner-control-height-large);display:flex;align-items:center;gap:var(--learner-space-4);padding:var(--learner-space-1) var(--learner-space-6) var(--learner-space-1) var(--learner-space-2);border:0;border-radius:var(--learner-radius-pill);background:var(--learner-color-surface);color:var(--learner-color-text);box-shadow:var(--learner-shadow-small);cursor:pointer}
.header-actions{display:flex;align-items:center;gap:var(--learner-space-5)}
.star-balance{height:var(--learner-control-height-large);min-width:140px;display:flex;align-items:center;justify-content:center;gap:var(--learner-space-3);padding:0 var(--learner-space-6);border-radius:var(--learner-radius-pill);background:var(--learner-color-surface);box-shadow:var(--learner-shadow-small);color:#4d4539}
.star-balance span{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:#ffd968;color:#fff;font-size:34px;font-weight:900;line-height:1;text-shadow:0 2px #e3a82f}
.star-balance strong{font-family:var(--learner-font-display);font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy)}
.avatar{width:56px;height:56px;display:grid;place-items:center;border-radius:50%;background:#ffe2a4;font-size:38px}
.profile strong{font-size:var(--learner-font-size-button);font-weight:var(--learner-font-weight-heavy)}
@media(max-width:900px){.star-balance{min-width:auto;padding-inline:var(--learner-space-3)}.star-balance strong{font-size:20px}.header-actions{gap:var(--learner-space-2)}}
@media(max-width:700px){.learner-header{padding-inline:var(--learner-space-4)}.brand{width:160px;height:62px}.profile{min-width:auto}.profile strong{display:none}.star-balance span{width:34px;height:34px;font-size:27px}}
</style>
