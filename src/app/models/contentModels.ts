// Read-only book content served by the backend content API (/content/...).

export interface ContentBook {
  book_id: string;
  title: string;
  cefr: string | null;
  chapter_count: number;
}

export interface ChapterSummary {
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

export interface Dialogue {
  id: string;
  title: string | null;
  audio_tracks: string[];
  lines: DialogueLine[];
  new_words: string[];
}

export interface VocabularyList {
  list: string | null;
  book_page: number | null;
  items: { nl: string; lemma: string; article: string | null; form: string | null; en: string }[];
}

export interface GrammarTopic {
  id: string;
  title: string;
  book_page: number | null;
  content: {
    examples?: string[];
    phrases?: string[];
    pairs?: { q: string; a: string }[];
    table?: { columns: string[]; rows: string[][] };
    note?: string;
  };
}

export interface ExerciseItem {
  n: number;
  text?: string;
  q?: string;
  answers?: string[];
  cue?: string;
  response?: string;
  options?: string[];
  answer?: string;
}

export interface Exercise {
  id: number;
  label: string | null;
  type: string;
  instruction: string | null;
  book_page: number | null;
  answers_source: string | null;
  payload: {
    title?: string;
    text?: string;
    source_text?: string;
    options?: string[];
    items?: ExerciseItem[];
  };
}

export interface Chapter {
  id: number;
  book_id: string;
  book_title: string;
  number: number;
  title: string;
  goals: string[];
  note: string | null;
  book_pages: [number, number] | null;
  dialogues: Dialogue[];
  vocabulary: VocabularyList[];
  grammar: GrammarTopic[];
  exercises: Exercise[];
  culture: { title?: string; text: string }[];
  reflection: { book_page?: number; can_do?: string[] } | null;
}
