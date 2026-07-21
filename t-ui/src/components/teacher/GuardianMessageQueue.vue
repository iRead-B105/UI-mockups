<script setup lang="ts">
import { reactive } from 'vue'
import { encouragementStatusLabels } from '@/features/teacher/displayLabels'
import type {
  AsyncContentState,
  EncouragementMessage,
  GuardianComment,
} from '@/features/teacher/types'

withDefaults(
  defineProps<{
    comments: GuardianComment[]
    encouragements: EncouragementMessage[]
    state?: AsyncContentState
    busyId?: number | null
  }>(),
  { state: 'ready', busyId: null },
)

const emit = defineEmits<{
  markRead: [commentId: number]
  addCommentToNote: [commentId: number]
  approve: [messageId: number, deliveryText: string]
  hold: [messageId: number, reason: string]
}>()

const deliveryDrafts = reactive<Record<number, string>>({})
const holdReasons = reactive<Record<number, string>>({})

function deliveryTextFor(message: EncouragementMessage) {
  if (deliveryDrafts[message.id] === undefined) {
    deliveryDrafts[message.id] = message.deliveryText
  }
  return deliveryDrafts[message.id] ?? ''
}

function formatDate(value: string) {
  return value.replaceAll('-', '.').slice(0, 16)
}
</script>

<template>
  <div class="guardian-queue">
    <p v-if="state === 'loading'" class="queue-state" aria-live="polite">
      보호자 메시지를 불러오는 중입니다.
    </p>
    <p v-else-if="state === 'error'" class="queue-state is-error" role="alert">
      보호자 메시지를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
    </p>

    <template v-else>
      <section aria-labelledby="guardian-comment-title">
        <header class="queue-heading">
          <div>
            <h3 id="guardian-comment-title">교수자에게 남긴 의견</h3>
            <p>교수자만 확인하며 아동에게 전달되지 않습니다.</p>
          </div>
        </header>

        <p v-if="comments.length === 0" class="queue-state">작성된 보호자 의견이 없습니다.</p>
        <ol v-else class="message-list">
          <li v-for="comment in comments" :key="comment.id">
            <header>
              <div>
                <strong>{{ comment.author }}</strong>
                <span>보고서 v{{ comment.reportVersion }} · {{ formatDate(comment.createdAt) }}</span>
              </div>
              <em :class="{ 'is-unread': comment.status === 'unread' }">
                {{ comment.status === 'unread' ? '읽지 않음' : '읽음' }}
              </em>
            </header>
            <p>{{ comment.text }}</p>
            <div class="message-actions">
              <button
                class="button button--secondary button--small"
                type="button"
                @click="emit('addCommentToNote', comment.id)"
              >
                내부 메모 추가
              </button>
              <button
                class="button button--small"
                type="button"
                :disabled="comment.status === 'read' || busyId === comment.id"
                @click="emit('markRead', comment.id)"
              >
                {{ busyId === comment.id ? '처리 중…' : comment.status === 'read' ? '읽음 처리됨' : '읽음 처리' }}
              </button>
            </div>
          </li>
        </ol>
      </section>

      <section aria-labelledby="guardian-encouragement-title">
        <header class="queue-heading">
          <div>
            <h3 id="guardian-encouragement-title">아이에게 전할 응원</h3>
            <p>교수자 승인 후에만 아동에게 전달됩니다.</p>
          </div>
        </header>

        <p v-if="encouragements.length === 0" class="queue-state">
          승인 대기 중인 보호자 응원이 없습니다.
        </p>
        <ol v-else class="approval-list">
          <li v-for="message in encouragements" :key="message.id">
            <header>
              <div>
                <strong>{{ message.author }}</strong>
                <span>{{ formatDate(message.createdAt) }}</span>
              </div>
              <em :class="`is-${message.status}`">{{ encouragementStatusLabels[message.status] }}</em>
            </header>

            <dl>
              <div>
                <dt>보호자 원문</dt>
                <dd>{{ message.originalText }}</dd>
              </div>
              <div>
                <dt>아동에게 전달할 문장</dt>
                <dd>
                  <span class="delivery-audience">공개 범위 · 아동에게 전달</span>
                  <textarea
                    class="textarea"
                    :value="deliveryTextFor(message)"
                    :disabled="message.status !== 'pending-approval'"
                    aria-label="아동에게 전달할 최종 문장"
                    @input="deliveryDrafts[message.id] = ($event.target as HTMLTextAreaElement).value"
                  ></textarea>
                </dd>
              </div>
            </dl>

            <div v-if="message.status === 'pending-approval'" class="hold-field">
              <label :for="`hold-reason-${message.id}`">보류 사유</label>
              <input
                :id="`hold-reason-${message.id}`"
                v-model="holdReasons[message.id]"
                class="input"
                placeholder="보류할 때만 내부 사유를 입력합니다."
              />
            </div>

            <div v-if="message.status === 'pending-approval'" class="message-actions">
              <button
                class="button button--secondary button--small"
                type="button"
                :disabled="!holdReasons[message.id]?.trim() || busyId === message.id"
                @click="emit('hold', message.id, holdReasons[message.id] ?? '')"
              >
                보류
              </button>
              <button
                class="button button--small"
                type="button"
                :disabled="!deliveryTextFor(message).trim() || busyId === message.id"
                @click="emit('approve', message.id, deliveryTextFor(message))"
              >
                {{ busyId === message.id ? '처리 중…' : '승인 및 전달 예약' }}
              </button>
            </div>

            <p v-if="message.holdReason" class="hold-result">내부 보류 사유 · {{ message.holdReason }}</p>
          </li>
        </ol>
      </section>
    </template>
  </div>
</template>

<style scoped>
.guardian-queue { display: grid; gap: 30px; }
.queue-heading h3 { margin: 0; font-size: 14px; }
.queue-heading p { margin: 4px 0 0; color: var(--slate-500); font-size: 11px; }
.message-list,
.approval-list { display: grid; margin: 12px 0 0; padding: 0; border-top: 1px solid var(--slate-200); list-style: none; }
.message-list > li,
.approval-list > li { padding: 16px 0; border-bottom: 1px solid var(--slate-200); }
.message-list header,
.approval-list header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.message-list header div,
.approval-list header div { display: grid; gap: 2px; }
.message-list strong,
.approval-list strong { color: var(--slate-800); font-size: 12px; }
.message-list header span,
.approval-list header span { color: var(--slate-500); font-size: 10px; }
.message-list em,
.approval-list em { padding: 3px 8px; border-radius: 999px; background: var(--slate-100); color: var(--slate-600); font-size: 10px; font-style: normal; font-weight: 700; }
.message-list em.is-unread,
.approval-list em.is-pending-approval { background: #fff7ed; color: #b45309; }
.approval-list em.is-on-hold { background: #fff1f2; color: var(--danger-600); }
.message-list > li > p { margin: 10px 0 0; color: var(--slate-700); font-size: 12px; line-height: 1.65; }
.message-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 12px; }
.approval-list dl { display: grid; gap: 12px; margin: 14px 0 0; }
.approval-list dl > div { display: grid; gap: 5px; }
.approval-list dt,
.hold-field label { color: var(--slate-500); font-size: 10px; font-weight: 700; }
.approval-list dd { margin: 0; color: var(--slate-700); font-size: 12px; line-height: 1.6; }
.delivery-audience { display: block; margin-bottom: 5px; color: var(--primary-700); font-size: 10px; font-weight: 700; }
.approval-list .textarea { min-height: 74px; font-size: 12px; }
.hold-field { display: grid; gap: 5px; margin-top: 12px; }
.hold-field .input { height: 36px; font-size: 11px; }
.hold-result { margin: 10px 0 0; color: var(--danger-600); font-size: 11px; }
.queue-state { margin: 12px 0 0; padding: 20px 8px; color: var(--slate-500); font-size: 12px; text-align: center; }
.queue-state.is-error { background: #fff1f2; color: var(--danger-600); }
</style>
