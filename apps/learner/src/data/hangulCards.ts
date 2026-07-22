// 한글 자모 카드 리소스 매핑
// design-resources/docs/design/HANGUL_CARD_RESOURCE_INVENTORY.md 에 정의된
// 자음/모음 카드 PNG를 자모 글자 기준으로 조회할 수 있도록 돕는 유틸리티입니다.
// 실제 카드 이미지는 src/assets/cards/hangul 아래에 위치합니다.

// Vite 의 import.meta.glob 으로 카드 이미지를 한 번에 불러옵니다.
const consonantModules = import.meta.glob<{ default: string }>(
  '../assets/cards/hangul/hangul_consonant_*.png',
  { eager: true },
)
const vowelModules = import.meta.glob<{ default: string }>(
  '../assets/cards/hangul/hangul_vowel_*.png',
  { eager: true },
)
const symbolModules = import.meta.glob<{ default: string }>(
  '../assets/cards/symbols/learning_symbol_*.png',
  { eager: true },
)
const blankModules = import.meta.glob<{ default: string }>(
  '../assets/cards/hangul/blanks/hangul_blank_card_*.png',
  { eager: true },
)

// 자모 → 카드 리소스 ID(파일명) 매핑 테이블
const consonantResourceIds: Record<string, string> = {
  ㄱ: 'giyeok',
  ㄲ: 'ssang',
  ㄴ: 'nieun',
  ㄷ: 'digeut',
  ㄸ: 'ssang',
  ㄹ: 'rieul',
  ㅁ: 'mieum',
  ㅂ: 'bieup',
  ㅃ: 'ssang',
  ㅅ: 'siot',
  ㅆ: 'ssang',
  ㅇ: 'ieung',
  ㅈ: 'jieut',
  ㅉ: 'ssang',
  ㅊ: 'chieut',
  ㅋ: 'kieuk',
  ㅌ: 'tieut',
  ㅍ: 'pieup',
  ㅎ: 'hieut',
}

const vowelResourceIds: Record<string, string> = {
  ㅏ: 'a',
  ㅐ: 'ae',
  ㅑ: 'ya',
  ㅒ: 'yae',
  ㅓ: 'eo',
  ㅔ: 'e',
  ㅕ: 'yeo',
  ㅖ: 'ye',
  ㅗ: 'o',
  ㅘ: 'wa',
  ㅙ: 'wae',
  ㅚ: 'oe',
  ㅛ: 'yo',
  ㅜ: 'u',
  ㅝ: 'wo',
  ㅞ: 'we',
  ㅟ: 'wi',
  ㅠ: 'yu',
  ㅡ: 'eu',
  ㅢ: 'ui',
  ㅣ: 'i',
}

// 파일명(키) → URL 변환 캐시
const consonantUrls: Record<string, string> = {}
const vowelUrls: Record<string, string> = {}

Object.entries(consonantModules).forEach(([path, mod]) => {
  const key = path.split('/').pop() ?? path
  consonantUrls[key] = mod.default
})
Object.entries(vowelModules).forEach(([path, mod]) => {
  const key = path.split('/').pop() ?? path
  vowelUrls[key] = mod.default
})

// 자모가 자음인지 모음인지 판별
export const isConsonant = (jamo: string): boolean => jamo in consonantResourceIds
export const isVowel = (jamo: string): boolean => jamo in vowelResourceIds

// 자모 글자(예: 'ㄱ', 'ㅏ') → 카드 이미지 URL 반환.
// 해당 자모의 카드 에셋이 없으면 null 반환(상위에서 리소스 추가 필요 표시).
export const getHangulCardUrl = (jamo: string): string | null => {
  if (isConsonant(jamo)) {
    const id = consonantResourceIds[jamo]
    if (id === 'ssang') return null // 쌍자음 카드는 아직 없음 → 리소스 추가 필요
    const file = `hangul_consonant_${id}.png`
    return consonantUrls[file] ?? null
  }
  if (isVowel(jamo)) {
    const id = vowelResourceIds[jamo]
    const file = `hangul_vowel_${id}.png`
    return vowelUrls[file] ?? null
  }
  return null
}

// 학습 심볼(correct/equals/plus 등) → URL 조회
export const getLearningSymbolUrl = (
  name: 'correct' | 'incorrect' | 'arrow_right' | 'equals' | 'plus' | 'question',
): string | null => {
  const file = `learning_symbol_${name}.png`
  const entry = Object.entries(symbolModules).find(([path]) => path.endsWith(file))
  return entry ? entry[1].default : null
}

// 빈 카드(배경용) 색상 → URL 조회
export const getBlankCardUrl = (
  color: 'pink' | 'coral' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple',
): string | null => {
  const file = `hangul_blank_card_${color}.png`
  const entry = Object.entries(blankModules).find(([path]) => path.endsWith(file))
  return entry ? entry[1].default : null
}
