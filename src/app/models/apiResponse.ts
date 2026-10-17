export interface ApiResponse<T> {
  response: T;
}

// /word/lookup: book and word-list facts first, the AI only fills gaps (examples are always AI)
export interface WordLookup {
  word: string;
  lemma: string;
  article: string | null;
  translations: string[];
  cefr_level: string | null;
  pos: string | null;
  forms: { present: string | null; v2: string | null; v3: string | null };
  examples: string[];
  source: 'book' | 'db' | 'llm';
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

// PARAGRAPH quizzes come from stored open questions and are still markdown (`response`).
export interface QuizResponse {
  questions?: QuizQuestion[];
  response?: string;
}
