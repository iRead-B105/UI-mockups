import type { AssessmentItem, AssessmentResponsePayload } from '../types'

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3

const finalConsonants = (value: string): number[] =>
  [...value.normalize('NFC')]
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code >= HANGUL_BASE && code <= HANGUL_LAST
    })
    .map((character) => (character.charCodeAt(0) - HANGUL_BASE) % 28)

export const mapObservedErrors = (
  item: AssessmentItem,
  payload: AssessmentResponsePayload,
  isCorrect: boolean | null,
): string[] => {
  if (isCorrect !== false) return []
  if (item.itemType === 'sound-omit') return ['PA_DELETION_FAILURE']
  if (item.itemType === 'sound-replace') return ['PA_SUBSTITUTION_FAILURE']
  if (item.itemType === 'letter-build') return ['GS_LETTER_COMBINATION_MISMATCH']
  if (item.itemType === 'sound-choice') return ['GS_SOUND_SYMBOL_MISMATCH']
  if (item.itemType === 'short-text') return ['CTX_RESPONSE_MISMATCH']
  if (payload.kind === 'speech' || payload.kind === 'gaze-speech') {
    const expected = Array.isArray(item.answerKey) ? item.answerKey.join('') : item.answerKey
    const expectedFinals = finalConsonants(expected)
    const actualFinals = finalConsonants(payload.transcript)
    if (expectedFinals.some((value, index) => value > 0 && actualFinals[index] === 0)) {
      return ['DS_FINAL_CONSONANT_OMISSION']
    }
  }
  return ['DS_WORD_SUBSTITUTION']
}


