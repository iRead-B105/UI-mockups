<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { audienceLabels } from '@/features/teacher/displayLabels'
import type { AsyncContentState, TeacherNote } from '@/features/teacher/types'

const props = withDefaults(
  defineProps<{
    notes: TeacherNote[]
    noteDraft: string
    state?: AsyncContentState
    busyId?: number | null
  }>(),
  { state: 'ready', busyId: null },
)

const emit = defineEmits<{
  'update:noteDraft': [value: string]
  saveNote: [noteId: number | null, text: string]
}>()

const editingNoteId = ref<number | null>(null)

function editNote(note: TeacherNote) {
  editingNoteId.value = note.id
  emit('update:noteDraft', note.text)
}

function saveNote() {
  const text = props.noteDraft.trim()
  if (!text) return
  emit('saveNote', editingNoteId.value, text)
  editingNoteId.value = null
}

function cancelNoteEdit() {
  editingNoteId.value = null
  emit('update:noteDraft', '')
}

function formatDate(value: string) {
  return value.replaceAll('-', '.').slice(0, 16)
}
</script>

<template>
  <section class="communication-panel" aria-labelledby="communication-title">
    <header class="communication-panel__heading">
      <div>
        <h2 id="communication-title">기록과 소통</h2>
        <p>학습 지도와 상담에 필요한 교수자 내부 기록을 작성합니다.</p>
      </div>
    </header>

    <p v-if="state === 'loading'" class="panel-state" aria-live="polite">
      내부 메모를 불러오는 중입니다.
    </p>
    <p v-else-if="state === 'error'" class="panel-state is-error" role="alert">
      내부 메모를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
    </p>

    <div v-else class="note-panel">
      <div class="note-editor">
        <Label for="internal-note">{{ editingNoteId ? '내부 메모 수정' : '내부 메모 추가' }}</Label>
        <Textarea
          id="internal-note"
          class="textarea"
          :value="noteDraft"
          placeholder="학습 지도와 상담에 필요한 내부 기록을 작성합니다."
          @input="emit('update:noteDraft', ($event.target as HTMLTextAreaElement).value)"
        />
        <div>
          <Button
            v-if="editingNoteId || noteDraft"
            variant="outline"
            size="sm"
            type="button"
            @click="cancelNoteEdit"
          >
            취소
          </Button>
          <Button
            size="sm"
            type="button"
            :disabled="!noteDraft.trim() || (busyId !== null && busyId === editingNoteId)"
            @click="saveNote"
          >
            {{
              busyId !== null && busyId === editingNoteId
                ? '저장 중…'
                : editingNoteId
                  ? '수정 저장'
                  : '메모 추가'
            }}
          </Button>
        </div>
      </div>

      <p v-if="notes.length === 0" class="panel-state">작성된 내부 메모가 없습니다.</p>
      <ol v-else class="note-history">
        <li v-for="note in notes" :key="note.id">
          <div>
            <strong>{{ note.author }}</strong>
            <span>{{ formatDate(note.updatedAt) }} · {{ audienceLabels[note.audience] }}</span>
          </div>
          <p>{{ note.text }}</p>
          <Button variant="link" size="sm" type="button" @click="editNote(note)">수정</Button>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.communication-panel {
  display: grid;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--card);
  box-shadow: var(--shadow-sm);
}
.communication-panel__heading {
  padding: 0 0 12px;
}
.communication-panel__heading h2 {
  margin: 0;
  font-size: 17px;
}
.communication-panel__heading p {
  margin: 5px 0 0;
  color: var(--slate-500);
  font-size: 12px;
}
.note-panel {
  display: grid;
  gap: 24px;
  padding: 18px 0 4px;
}
.note-editor {
  display: grid;
  justify-items: end;
  gap: 8px;
}
.note-editor label {
  justify-self: start;
  color: var(--slate-700);
  font-size: 12px;
  font-weight: 700;
}
.note-editor .textarea {
  min-height: 92px;
}
.note-editor > div {
  display: flex;
  gap: 7px;
}
.note-history {
  display: grid;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--slate-200);
  list-style: none;
}
.note-history li {
  position: relative;
  padding: 14px 0;
  border-bottom: 1px solid var(--slate-200);
}
.note-history li > div {
  display: grid;
  gap: 2px;
}
.note-history strong {
  color: var(--slate-800);
  font-size: 12px;
}
.note-history span {
  color: var(--slate-500);
  font-size: 10px;
}
.note-history p {
  max-width: 900px;
  margin: 8px 70px 0 0;
  color: var(--slate-700);
  font-size: 12px;
  line-height: 1.65;
}
.note-history button {
  border: 0;
  background: transparent;
  color: var(--primary-700);
  font-size: 11px;
  font-weight: 700;
}
.note-history > li > button {
  position: absolute;
  top: 14px;
  right: 0;
}
.panel-state {
  margin: 0;
  padding: 22px 8px;
  color: var(--slate-500);
  font-size: 12px;
  text-align: center;
}
.panel-state.is-error {
  background: #fff1f2;
  color: var(--danger-600);
}
</style>
