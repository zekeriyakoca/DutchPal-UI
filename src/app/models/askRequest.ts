export interface AskRequest {
  message: string;
  page: 'vocab' | 'translate-sentence' | 'chat' | 'sentences' | 'quiz';
  level: string;
  difficulty: number;
  number_of_entries: number;
  book_id: number;
  quiz_type: 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR';
}
