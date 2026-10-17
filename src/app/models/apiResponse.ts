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
