import { Injectable } from '@angular/core';

type PreferenceKey =
  | 'translation.isTextTranslation'
  | 'general.useAdvancedVoice'
  | 'vocab-game.selectedLevel'
  | 'vocab-game.bookId'
  | 'vocab-game.selectedWordType'
  | 'vocab-game.itemCount'
  | 'quiz.level'
  | 'quiz.difficulty'
  | 'quiz.bookId'
  | 'quiz.quizType'
  | 'quiz.itemCount'
  | 'study-book.selectedBookId'
  | 'study-book.selectedChapterId'
  | 'study-book.isBringSentences'
  | 'book-chapters.bookId'
  | 'book-chapters.chapterId'
  | 'exams.bookId'
  | 'exams.chapterId'
  | 'general.aiAssistant';

type PreferenceMap = {
  'translation.isTextTranslation': boolean;
  'general.useAdvancedVoice': boolean;
  'vocab-game.selectedLevel': string;
  'vocab-game.bookId': string;
  'vocab-game.selectedWordType': string;
  'vocab-game.itemCount': number;
  'quiz.level': string;
  'quiz.difficulty': number;
  'quiz.bookId': string;
  'quiz.quizType': 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR';
  'quiz.itemCount': number;
  'study-book.selectedBookId': number;
  'study-book.selectedChapterId': number;
  'study-book.isBringSentences': boolean;
  'book-chapters.bookId': string;
  'book-chapters.chapterId': number;
  'exams.bookId': string;
  'exams.chapterId': number;
  'general.aiAssistant': 'chatgpt' | 'claude';
};

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly key = 'isTextTranslation';

  set<K extends PreferenceKey>(key: K, value: PreferenceMap[K]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<K extends PreferenceKey>(
    key: K,
    fallback: PreferenceMap[K]
  ): PreferenceMap[K] {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  }
}
