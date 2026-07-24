<script setup lang="ts">
import { computed, ref } from 'vue'
import SaveToast from '@/components/common/SaveToast.vue'
import { Button } from '@/components/ui/button'
import { reportStatusLabels } from '@/features/teacher/displayLabels'
import type { ReportStatus, ShareLink } from '@/features/teacher/types'

const props = defineProps<{
  status: ReportStatus
  versionLabel: string
  shareLink: ShareLink | null
  guardianPreviewUrl?: string
  busyAction: string | null
  saved: boolean
}>()

const emit = defineEmits<{
  resetPeriod: []
  saveDraft: []
  publish: []
  savePdf: []
  copyLink: []
  revokeLink: []
  reissueLink: []
  viewHistory: []
}>()

const manageOpen = ref(false)
const isBusy = computed(() => props.busyAction !== null)
</script>

<template>
  <section
    v-if="status === 'published'"
    class="pdf-save-panel screen-only print-hidden"
    aria-labelledby="pdf-save-title"
  >
    <div>
      <h3 id="pdf-save-title">PDF 저장</h3>
      <p>인쇄 창에서 PDF로 저장을 선택할 수 있습니다.</p>
    </div>
    <Button type="button" @click="emit('savePdf')">PDF로 저장</Button>
  </section>

  <section
    v-else
    class="report-actions screen-only print-hidden"
    aria-labelledby="report-action-title"
  >
    <header>
      <div>
        <span>보고서 {{ versionLabel }}</span>
        <h3 id="report-action-title">{{ reportStatusLabels[status] }}</h3>
      </div>
      <SaveToast :visible="saved" message="보고서 초안을 저장했습니다." inline />
    </header>

    <div v-if="status === 'draft'" class="action-row">
      <div>
        <Button variant="outline" type="button" :disabled="isBusy" @click="emit('resetPeriod')">
          기간 다시 설정
        </Button>
        <Button variant="outline" type="button" :disabled="isBusy" @click="emit('saveDraft')">
          {{ busyAction === 'save' ? '저장 중…' : '임시 저장' }}
        </Button>
      </div>
      <Button type="button" :disabled="isBusy" @click="emit('publish')"> 보고서 발행 </Button>
    </div>

    <div v-else-if="status === 'shared'" class="shared-actions">
      <div class="masked-link">
        <span>공유 주소</span>
        <strong>{{ shareLink?.maskedUrl }}</strong>
        <small>아동 이름과 연락처가 포함되지 않은 주소입니다.</small>
      </div>
      <div class="action-row">
        <div>
          <Button variant="outline" type="button" :disabled="isBusy" @click="emit('copyLink')">
            링크 복사
          </Button>
          <Button v-if="guardianPreviewUrl" as-child variant="outline">
            <a :href="guardianPreviewUrl" target="_blank" rel="noopener">보호자 화면 보기</a>
          </Button>
          <Button variant="outline" type="button" @click="emit('viewHistory')">
            공유 현황 보기
          </Button>
        </div>
        <Button type="button" @click="manageOpen = !manageOpen">링크 관리</Button>
      </div>
      <div v-if="manageOpen" class="link-management">
        <p>재발급하면 현재 링크가 즉시 폐기되고 새 주소가 만들어집니다.</p>
        <div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            :disabled="isBusy"
            @click="emit('reissueLink')"
          >
            링크 재발급
          </Button>
          <Button
            variant="destructive"
            size="sm"
            type="button"
            :disabled="isBusy"
            @click="emit('revokeLink')"
          >
            링크 폐기
          </Button>
        </div>
      </div>
    </div>

    <div v-else class="action-row">
      <Button variant="outline" type="button" @click="emit('viewHistory')">공유 이력 보기</Button>
      <Button type="button" :disabled="isBusy" @click="emit('reissueLink')">
        {{ busyAction === 'reissue' ? '재발급 중…' : '링크 재발급' }}
      </Button>
    </div>
  </section>
</template>

<style scoped>
.pdf-save-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 24px;
  padding: 20px 0 2px;
  border-top: 1px solid var(--slate-300);
}
.pdf-save-panel h3 {
  margin: 0;
  font-size: 14px;
}
.pdf-save-panel p {
  margin: 4px 0 0;
  color: var(--slate-500);
  font-size: 10px;
}
.report-actions {
  margin-top: 18px;
  padding: 17px 0 2px;
  border-top: 1px solid var(--slate-300);
}
.report-actions > header {
  display: flex;
  min-height: 34px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.report-actions > header div {
  display: grid;
  gap: 2px;
}
.report-actions > header span {
  color: var(--slate-500);
  font-size: 10px;
}
.report-actions h3 {
  margin: 0;
  font-size: 14px;
}
.action-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}
.action-row > div {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.masked-link {
  display: grid;
  gap: 3px;
  margin-top: 13px;
}
.masked-link span,
.masked-link small {
  color: var(--slate-500);
  font-size: 10px;
}
.masked-link strong {
  color: var(--slate-800);
  font-size: 12px;
}
.link-management {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid var(--slate-200);
  background: var(--slate-50);
}
.link-management p {
  margin: 0;
  color: var(--slate-600);
  font-size: 10px;
}
.link-management div {
  display: flex;
  flex: 0 0 auto;
  gap: 7px;
}

@media print {
  .pdf-save-panel,
  .report-actions {
    display: none !important;
  }
}
</style>
