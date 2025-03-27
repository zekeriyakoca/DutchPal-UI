export interface AskRequest {
  message: string;
  page: 'vocab' | 'translate-sentence' | 'chat';
  level: string;
  number_of_entries: number;
}
