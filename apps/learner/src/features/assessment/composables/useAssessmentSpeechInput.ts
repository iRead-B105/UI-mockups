import { onScopeDispose, reactive } from 'vue'

interface SpeechResultLike {
  0: { transcript: string; confidence: number }
}

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: { results: { 0: SpeechResultLike } }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

const getConstructor = (): SpeechRecognitionConstructor | null => {
  const browserWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null
}

export const useAssessmentSpeechInput = () => {
  const state = reactive({
    status: 'idle' as 'idle' | 'listening' | 'captured' | 'error' | 'unsupported',
    transcript: '',
    confidence: null as number | null,
    errorMessage: '',
  })
  let recognition: SpeechRecognitionLike | null = null

  const start = () => {
    if (state.status === 'captured' || state.status === 'listening') return
    const Recognition = getConstructor()
    if (!Recognition) {
      state.status = 'unsupported'
      state.errorMessage = '이 브라우저에서는 음성 인식을 사용할 수 없어요. 선생님께 알려 주세요.'
      return
    }
    state.transcript = ''
    state.confidence = null
    state.errorMessage = ''
    recognition = new Recognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const result = event.results[0]?.[0]
      if (!result) return
      state.transcript = result.transcript
      state.confidence = Number.isFinite(result.confidence) ? result.confidence : null
      state.status = 'captured'
    }
    recognition.onerror = (event) => {
      state.status = 'error'
      state.errorMessage = event.error === 'not-allowed'
        ? '마이크 사용을 허용해 주세요.'
        : '소리를 잘 듣지 못했어요. 다시 눌러 주세요.'
    }
    recognition.onend = () => {
      if (state.status === 'listening') {
        state.status = 'error'
        state.errorMessage = '소리를 듣지 못했어요. 다시 눌러 주세요.'
      }
    }
    state.status = 'listening'
    recognition.start()
  }

  const stop = () => recognition?.stop()

  onScopeDispose(stop)
  return { state, start, stop }
}


