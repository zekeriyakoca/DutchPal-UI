export interface ApiResponse<T> {
  response: T;
}

// /word/lookup: book and word-list facts first, then the Translator dictionary; the AI only fills gaps
export interface WordLookup {
  word: string;
  lemma: string;
  article: string | null;
  translations: string[];
  cefr_level: string | null;
  pos: string | null;
  forms: { present: string | null; v2: string | null; v3: string | null };
  examples: string[];
  source: 'book' | 'db' | 'dictionary' | 'llm';
}

export interface WordTranslation {
  word: string;
  type: 'NOUN' | 'VERB' | 'OTHER' | 'ADJECTIVE' | 'ADVERB';
  translation: string;
  examples: string[];
}

// Stored vocabulary row from /vocabulary; missing fields are null.
export interface VocabItem {
  word: string;
  lemma: string;
  pos: string | null;
  cefr_level: string | null;
  present_form: string | null;
  v2_form: string | null;
  v3_form: string | null;
  examples: string[];
}

export interface QuizQuestion {
  type: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string | null;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

// Feedback on an exam writing task, scored on its criteria.
export interface WritingEvaluation {
  criteria: { name: string; score: number; max: number; comment: string }[];
  total: number;
  max_total: number;
  corrections: { original: string; corrected: string; explanation: string }[];
  grammar_units: { chapter_id: number; title: string; why: string }[];
  improved_text: string;
}
