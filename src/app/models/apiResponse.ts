export interface ApiResponse<T> {
  response: T;
}

export interface WordTranslation {
  word: string;
  type: 'NOUN' | 'VERB' | 'OTHER';
  translation: string;
  examples: string[];
}
