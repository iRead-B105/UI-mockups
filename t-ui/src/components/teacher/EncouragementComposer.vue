<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    teacherName: string
    editing?: boolean
    busy?: boolean
  }>(),
  { editing: false, busy: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [deliveryTiming: 'immediate' | 'next-login']
  cancelEdit: []
}>()

const deliveryTiming = ref<'immediate' | 'next-login'>('next-login')
const templates = [
  { label: '과정 칭찬', text: '어려운 부분도 포기하지 않고 끝까지 읽어 낸 과정이 정말 멋졌어!' },
  { label: '노력 인정', text: '조금씩 더 정확하게 읽으려고 노력한 모습이 참 대견해!' },
  { label: '다음 도전 격려', text: '지금처럼 천천히 도전하면 다음 이야기에서도 분명 잘해 낼 거야!' },
]

const canSubmit = computed(() => props.modelValue.trim().length > 0 && !props.busy)

function useTemplate(text: string) {
  emit('update:modelValue', text)
}
</script>

<template>
  <section class="encouragement-composer" aria-labelledby="encouragement-compose-title">
    <div class="composer-heading">
      <div>
        <h3 id="encouragement-compose-title">
          {{ editing ? '전달 전 응원 수정' : '새 응원 작성' }}
        </h3>
        <p>공개 범위 · <strong>아동에게 전달</strong></p>
      </div>
    </div>

    <div class="template-list" aria-label="응원 문장 틀">
      <button
        v-for="template in templates"
        :key="template.label"
        type="button"
        @click="useTemplate(template.text)"
      >
        {{ template.label }}
      </button>
    </div>

    <label class="composer-field">
      <span>전달 문장</span>
      <textarea
        class="textarea"
        :value="modelValue"
        maxlength="180"
        placeholder="아동에게 전할 응원을 작성해 주세요."
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
      <small>{{ modelValue.length }}/180자</small>
    </label>

    <div class="character-preview" aria-label="아동에게 보일 응원 미리보기">
      <span class="character-preview__avatar" aria-hidden="true">★</span>
      <div>
        <small>{{ teacherName }}</small>
        <p>{{ modelValue.trim() || '작성한 응원이 이 말풍선에 표시됩니다.' }}</p>
      </div>
    </div>

    <fieldset class="delivery-timing">
      <legend>전달 시점</legend>
      <label>
        <input v-model="deliveryTiming" type="radio" value="immediate" />
        바로 전달
      </label>
      <label>
        <input v-model="deliveryTiming" type="radio" value="next-login" />
        다음 로그인 때 전달
      </label>
    </fieldset>

    <div class="composer-actions">
      <button
        v-if="editing"
        class="button button--secondary button--small"
        type="button"
        @click="emit('cancelEdit')"
      >
        수정 취소
      </button>
      <button
        class="button button--small"
        type="button"
        :disabled="!canSubmit"
        @click="emit('submit', deliveryTiming)"
      >
        {{ busy ? '처리 중…' : editing ? '수정 내용 저장' : '응원 전달' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.encouragement-composer { display: grid; gap: 14px; }
.composer-heading { display: flex; justify-content: space-between; gap: 12px; }
.composer-heading h3 { margin: 0; font-size: 14px; }
.composer-heading p { margin: 4px 0 0; color: var(--slate-500); font-size: 11px; }
.composer-heading strong { color: var(--primary-700); }
.template-list { display: flex; flex-wrap: wrap; gap: 7px; }
.template-list button { min-height: 30px; padding: 0 10px; border: 1px solid var(--slate-300); border-radius: 999px; background: var(--white); color: var(--slate-600); font-size: 11px; font-weight: 700; }
.template-list button:hover { border-color: var(--primary-500); color: var(--primary-700); }
.composer-field { display: grid; gap: 6px; }
.composer-field > span,
.delivery-timing legend { color: var(--slate-700); font-size: 12px; font-weight: 700; }
.composer-field .textarea { min-height: 88px; }
.composer-field small { justify-self: end; color: var(--slate-400); font-size: 10px; }
.character-preview { display: grid; align-items: end; gap: 10px; padding: 14px; border-radius: var(--radius-sm); background: var(--primary-50); grid-template-columns: 34px minmax(0, 1fr); }
.character-preview__avatar { display: grid; width: 34px; height: 34px; border-radius: 50%; background: var(--primary-600); color: var(--white); place-items: center; }
.character-preview div { position: relative; padding: 10px 12px; border-radius: 11px 11px 11px 3px; background: var(--white); }
.character-preview small { color: var(--slate-500); font-size: 10px; }
.character-preview p { margin: 3px 0 0; color: var(--slate-700); font-size: 12px; line-height: 1.55; }
.delivery-timing { display: flex; align-items: center; gap: 16px; margin: 0; padding: 0; border: 0; }
.delivery-timing legend { float: left; margin-right: 14px; }
.delivery-timing label { display: inline-flex; align-items: center; gap: 5px; color: var(--slate-600); font-size: 11px; }
.composer-actions { display: flex; justify-content: flex-end; gap: 7px; }
</style>
