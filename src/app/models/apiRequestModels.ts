// Used by /chat
export interface ChatRequest {
  message: string;
}

// Used by /vocabulary (translateWord + getVocabulary)
export interface VocabRequest {
  message?: string;
  level?: string;
  number_of_entries?: number;
  book_id?: number;
  word_type?: string;
}

// Used by /translate
export interface TranslateRequest {
  message: string;
}

// Used by /sentences
export interface SentencesRequest {
  level?: string;
  number_of_entries?: number;
  book_id?: number;
}

// Used by /quiz
export interface QuizRequest {
  message?: string;
  level?: string;
  difficulty?: number;
  number_of_entries?: number;
  book_id?: number;
  quiz_type: 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR';
}
