// Read-only book content served by the backend content API (/content/...).
// Shapes follow the extracted chapter schema (v1); free-form parts stay loosely typed.

export interface ContentBook {
  book_id: string;
  title: string;
  cefr: string | null;
  chapter_count: number;
}

export interface ContentChapterSummary {
  id: number;
  number: number;
  title: string;
  goals: string[];
  has_exercises: boolean;
}

export interface DialogueLine {
  speaker: string | null;
  text: string;
  stage?: boolean;
  narration?: boolean;
}

export interface ContentDialogue {
  id: number;
  title: string | null;
  audio_tracks: string[];
  lines: DialogueLine[];
  new_words: string[];
}

export interface VocabularyItem {
  nl: string;
  lemma: string;
  article?: string | null;
  form?: string | null;
  en: string;
}

export interface VocabularyList {
  list: string | null;
  book_page: number | null;
  items: VocabularyItem[];
}

export interface GrammarTopic {
  id: number;
  title: string;
  book_page: number | null;
  content: unknown;
}

export const GENERATED_ANSWERS_SOURCE = 'generated_needs_review';

export interface ContentExercise {
  id: number;
  label: string | null;
  type: string;
  instruction: string | null;
  book_page: number | null;
  answers_source: string | null;
  payload: Record<string, unknown> | null;
}

export interface ChapterReflection {
  book_page?: number | null;
  can_do?: string[];
}

export interface ContentChapter {
  id: number;
  book_id: string;
  book_title: string;
  number: number;
  title: string;
  goals: string[];
  note: string | null;
  book_pages: [number, number] | null;
  dialogues: ContentDialogue[];
  vocabulary: VocabularyList[];
  grammar: GrammarTopic[];
  exercises: ContentExercise[];
  culture: unknown[] | null;
  reflection: ChapterReflection | null;
}
