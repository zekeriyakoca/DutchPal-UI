// Used by /chat; history holds the earlier turns on the page, oldest first
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatTurn[];
}

// Used by /vocabulary (getVocabulary)
export interface VocabRequest {
  message?: string;
  level?: string;
  number_of_entries?: number;
  book_id?: string;
  word_type?: string;
}

// Used by /translate
export interface TranslateRequest {
  message: string;
}

// Used by /translate-word
export interface TranslateWordSimpleRequest {
  message: string;
}

// Used by /word/lookup
export interface WordLookupRequest {
  word: string;
}

// Used by /quiz
export interface QuizRequest {
  message?: string;
  level?: string;
  difficulty?: number;
  number_of_entries?: number;
  book_id?: string;
  quiz_type: 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR';
}
