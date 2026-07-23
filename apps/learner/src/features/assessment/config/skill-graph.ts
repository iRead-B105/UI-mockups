import type { AssessmentDomainId } from '../types'

export interface AssessmentSkillDefinition {
  id: string
  domainId: AssessmentDomainId
  prerequisiteSkillIds: string[]
  trainingLessonIds: string[]
}

export const assessmentSkills: AssessmentSkillDefinition[] = [
  { id: 'phoneme-initial', domainId: 'phonological-awareness', prerequisiteSkillIds: [], trainingLessonIds: ['listen-and-respond'] },
  { id: 'phoneme-final', domainId: 'phonological-awareness', prerequisiteSkillIds: ['phoneme-initial'], trainingLessonIds: ['cut-symbols'] },
  { id: 'phoneme-blend', domainId: 'phonological-awareness', prerequisiteSkillIds: ['phoneme-initial'], trainingLessonIds: ['build-symbols'] },
  { id: 'phoneme-omit', domainId: 'phonological-awareness', prerequisiteSkillIds: ['phoneme-blend'], trainingLessonIds: ['cut-symbols'] },
  { id: 'phoneme-replace', domainId: 'phonological-awareness', prerequisiteSkillIds: ['phoneme-omit'], trainingLessonIds: ['replace-symbols'] },
  { id: 'grapheme-sound', domainId: 'grapheme-sound', prerequisiteSkillIds: [], trainingLessonIds: ['trace-letters', 'listen-and-respond'] },
  { id: 'letter-build-basic', domainId: 'letter-manipulation', prerequisiteSkillIds: ['grapheme-sound'], trainingLessonIds: ['build-symbols'] },
  { id: 'letter-build-final', domainId: 'letter-manipulation', prerequisiteSkillIds: ['letter-build-basic'], trainingLessonIds: ['build-symbols'] },
  { id: 'word-reading', domainId: 'decoding-fluency', prerequisiteSkillIds: ['letter-build-basic'], trainingLessonIds: ['guided-reading'] },
  { id: 'nonword-reading', domainId: 'decoding-fluency', prerequisiteSkillIds: ['word-reading'], trainingLessonIds: ['guided-reading'] },
  { id: 'sentence-reading', domainId: 'decoding-fluency', prerequisiteSkillIds: ['word-reading'], trainingLessonIds: ['guided-reading'] },
  { id: 'passage-reading', domainId: 'decoding-fluency', prerequisiteSkillIds: ['sentence-reading'], trainingLessonIds: ['guided-reading'] },
  { id: 'short-text-context', domainId: 'short-text', prerequisiteSkillIds: ['sentence-reading'], trainingLessonIds: ['complete-text'] },
]

export const commonScreeningSkillIds = [
  'phoneme-initial',
  'grapheme-sound',
  'letter-build-basic',
  'word-reading',
  'sentence-reading',
  'short-text-context',
]

export const skillById = new Map(assessmentSkills.map((skill) => [skill.id, skill]))

