<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { EChartsOption } from 'echarts'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import LearningReportDocument from '@/components/teacher/LearningReportDocument.vue'
import PageHeader from '@/components/teacher/PageHeader.vue'
import ReportActionPanel from '@/components/teacher/ReportActionPanel.vue'
import ReportPreview from '@/components/teacher/ReportPreview.vue'
import ReportSetupPanel from '@/components/teacher/ReportSetupPanel.vue'
import ReportShareStatus from '@/components/teacher/ReportShareStatus.vue'
import { useTemporaryNotice } from '@/composables/useTemporaryNotice'
import { activeShareLink, students } from '@/features/teacher/mockData'
import type { ReportStatus, ShareLink } from '@/features/teacher/types'

type ReportPageState = 'setting' | ReportStatus
type DialogKind = 'publish' | 'revoke' | 'reissue'

const route = useRoute()
const currentStudent = computed(
  () => students.find((student) => student.id === Number(route.params.id)) ?? students[0]!,
)

const startDate = ref('2026-06-15')
const endDate = ref('2026-07-15')
const pageState = ref<ReportPageState>('setting')
const reportVersion = ref(1)
const publishedAt = ref<string>()
const expiresAt = ref('2026-08-20')
const busyAction = ref<string | null>(null)
const teacherOpinion = ref(
  '학생은 최근 4주 동안 읽기 정확도와 유창성에서 꾸준한 향상을 보였습니다. 다음 학습에서는 낯선 낱말의 의미를 문맥으로 추론하는 활동을 강화할 예정입니다.',
)
const currentShareLink = ref<ShareLink | null>(null)
const shareHistory = ref<ShareLink[]>([])
const previousShareMessage = ref('')
const dialogKind = ref<DialogKind | null>(null)
const shareStatusElement = ref<HTMLElement | null>(null)
const { visible: draftSaved, show: showDraftSaved } = useTemporaryNotice()

const reportStatus = computed<ReportStatus>(() =>
  pageState.value === 'setting' ? 'draft' : pageState.value,
)
const isEditable = computed(() => pageState.value === 'draft')
const guardianCommentCreated = computed(() => Boolean(currentShareLink.value?.firstViewedAt))
const dialogTitle = computed(() => {
  if (dialogKind.value === 'publish') return '보고서를 발행할까요?'
  if (dialogKind.value === 'revoke') return '공유 링크를 폐기할까요?'
  return '공유 링크를 재발급할까요?'
})
const dialogMessage = computed(() => {
  if (dialogKind.value === 'publish') {
    return `${currentStudent.value.name} 학생 · ${startDate.value} ~ ${endDate.value}\n보호자에게 표시될 학생 정보와 교수자 의견을 확인했습니다. 발행하면 이 버전의 내용이 고정됩니다.`
  }
  if (dialogKind.value === 'revoke') {
    return '폐기 즉시 보호자는 현재 주소로 보고서를 열 수 없습니다. 보고서 버전과 열람 이력은 보관됩니다.'
  }
  return '기존 링크는 즉시 폐기됩니다. 새 주소를 보호자에게 다시 전달해야 합니다.'
})

const trendChart: EChartsOption = {
  animation: false,
  tooltip: { trigger: 'axis' },
  legend: { data: ['읽기 정확도', '읽기 유창성'], top: 5, textStyle: { fontSize: 10 } },
  grid: { left: 42, right: 18, top: 42, bottom: 30 },
  xAxis: { type: 'category', data: ['6/15', '6/20', '6/25', '6/30', '7/5', '7/10', '7/15'], axisLabel: { fontSize: 9 } },
  yAxis: { type: 'value', min: 20, max: 100, interval: 20, axisLabel: { formatter: '{value}', fontSize: 9 } },
  series: [
    { name: '읽기 정확도', type: 'line', symbol: 'circle', symbolSize: 7, data: [54, 60, 64, 68, 72, 78, 84], lineStyle: { width: 2, color: '#4f46e5' }, itemStyle: { color: '#ffffff', borderColor: '#4f46e5', borderWidth: 2 } },
    { name: '읽기 유창성', type: 'line', symbol: 'circle', symbolSize: 7, data: [42, 49, 56, 61, 66, 70, 76], lineStyle: { width: 2, color: '#0ea5e9' }, itemStyle: { color: '#ffffff', borderColor: '#0ea5e9', borderWidth: 2 } },
  ],
}

function generateReport() {
  pageState.value = 'draft'
}

function resetPeriod() {
  pageState.value = 'setting'
}

async function runAction(action: string, callback: () => void) {
  if (busyAction.value) return
  busyAction.value = action
  await new Promise((resolve) => window.setTimeout(resolve, 420))
  callback()
  busyAction.value = null
}

function saveDraft() {
  void runAction('save', showDraftSaved)
}

function requestPublish() {
  if (!teacherOpinion.value.trim()) return
  dialogKind.value = 'publish'
}

function requestRevoke() {
  dialogKind.value = 'revoke'
}

function requestReissue() {
  dialogKind.value = 'reissue'
}

function confirmDialogAction() {
  const action = dialogKind.value
  dialogKind.value = null
  if (action === 'publish') {
    pageState.value = 'published'
    publishedAt.value = '2026-07-21 15:10'
    return
  }
  if (action === 'revoke') {
    if (currentShareLink.value) {
      const revoked = {
        ...currentShareLink.value,
        status: 'revoked' as const,
        revokedAt: '2026-07-21 15:18',
      }
      currentShareLink.value = revoked
      shareHistory.value.push(revoked)
    }
    pageState.value = 'share-ended'
    return
  }
  if (action === 'reissue') {
    void reissueLink()
  }
}

function createShare() {
  if (!expiresAt.value) return
  void runAction('share', () => {
    if (currentShareLink.value) shareHistory.value.push({ ...currentShareLink.value })
    currentShareLink.value = {
      ...activeShareLink,
      id: Date.now(),
      reportVersionId: reportVersion.value,
      status: 'active',
      maskedUrl: `iread.kr/r/••••••V${reportVersion.value}P`,
      copyValue: `https://iread.kr/r/mock-v${reportVersion.value}-P`,
      expiresAt: expiresAt.value,
      createdAt: '2026-07-21 15:14',
      firstViewedAt: undefined,
      lastViewedAt: undefined,
      pdfSavedAt: undefined,
      guardianAuthentication: 'not-attempted',
    }
    previousShareMessage.value = ''
    pageState.value = 'shared'
  })
}

async function reissueLink() {
  await runAction('reissue', () => {
    if (currentShareLink.value) {
      shareHistory.value.push({
        ...currentShareLink.value,
        status: 'revoked',
        revokedAt: '2026-07-21 15:20',
      })
    }
    currentShareLink.value = {
      ...activeShareLink,
      id: Date.now(),
      reportVersionId: reportVersion.value,
      status: 'active',
      maskedUrl: `iread.kr/r/••••••R${reportVersion.value}N`,
      copyValue: `https://iread.kr/r/mock-reissued-v${reportVersion.value}`,
      expiresAt: expiresAt.value,
      createdAt: '2026-07-21 15:20',
      firstViewedAt: undefined,
      lastViewedAt: undefined,
      pdfSavedAt: undefined,
      guardianAuthentication: 'not-attempted',
    }
    pageState.value = 'shared'
  })
}

function newDraft() {
  if (currentShareLink.value?.status === 'active') {
    previousShareMessage.value = `기존 보고서 v${currentShareLink.value.reportVersionId}의 공유 링크는 유지됩니다. 새 초안을 발행해도 기존 버전을 덮어쓰지 않습니다.`
  }
  reportVersion.value += 1
  publishedAt.value = undefined
  pageState.value = 'draft'
}

async function copyLink() {
  if (!currentShareLink.value) return
  try {
    await navigator.clipboard.writeText(currentShareLink.value.copyValue)
  } catch {
    // 로컬 목업이나 권한이 없는 환경에서도 버튼 상태 흐름은 유지합니다.
  }
}

function viewHistory() {
  shareStatusElement.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function importInternalMemo() {
  const imported = '받침이 포함된 문장을 읽을 때 속도가 흔들리는 경향이 있어 반복 연습이 필요합니다.'
  teacherOpinion.value = `${teacherOpinion.value.trim()}\n\n${imported}`.trim()
}
</script>

<template>
  <div class="report page-stack">
    <PageHeader
      v-if="pageState === 'setting'"
      class="print-hidden"
      title="보고서 만들기"
      description="학습 기록을 정리해 보호자 공유용 보고서를 만듭니다."
    />

    <ReportSetupPanel
      v-if="pageState === 'setting'"
      v-model:start-date="startDate"
      v-model:end-date="endDate"
      class="print-hidden"
      :student-name="currentStudent.name"
      @generate="generateReport"
    />

    <ReportPreview v-else>
      <LearningReportDocument
        v-model:teacher-opinion="teacherOpinion"
        :student="currentStudent"
        :start-date="startDate"
        :end-date="endDate"
        :editable="isEditable"
        :internal-memo-available="true"
        :trend-chart="trendChart"
        @import-internal-memo="importInternalMemo"
      >
        <template #actions>
          <ReportActionPanel
            v-model:expires-at="expiresAt"
            :status="reportStatus"
            :version="reportVersion"
            :share-link="currentShareLink"
            :busy-action="busyAction"
            :saved="draftSaved"
            :previous-share-message="previousShareMessage"
            @reset-period="resetPeriod"
            @save-draft="saveDraft"
            @publish="requestPublish"
            @new-draft="newDraft"
            @create-share="createShare"
            @copy-link="copyLink"
            @revoke-link="requestRevoke"
            @reissue-link="requestReissue"
            @view-history="viewHistory"
          />
        </template>
        <template v-if="reportStatus !== 'draft' || currentShareLink" #share-status>
          <div ref="shareStatusElement">
            <ReportShareStatus
              :version="currentShareLink?.reportVersionId ?? reportVersion"
              :published-at="publishedAt"
              :share-link="currentShareLink"
              :guardian-comment-created="guardianCommentCreated"
            />
          </div>
        </template>
      </LearningReportDocument>
    </ReportPreview>

    <ConfirmDialog
      :open="dialogKind !== null"
      :title="dialogTitle"
      :message="dialogMessage"
      :confirm-label="dialogKind === 'publish' ? '보고서 발행' : dialogKind === 'revoke' ? '링크 폐기' : '재발급'"
      :tone="dialogKind === 'revoke' ? 'danger' : 'primary'"
      @cancel="dialogKind = null"
      @confirm="confirmDialogAction"
    />
  </div>
</template>

<style scoped>
.report { width: 100%; }
.report :deep(.report-preview) { padding-top: 4px; }
@media print { .report { display: block; } }
</style>
