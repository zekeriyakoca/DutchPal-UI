export interface ApiResponse<T> {
  response: T;
}

export interface WordTranslation {
  word: string;
  type: 'NOUN' | 'VERB' | 'OTHER' | 'ADJECTIVE' | 'ADVERB';
  translation: string;
  examples: string[];
}
