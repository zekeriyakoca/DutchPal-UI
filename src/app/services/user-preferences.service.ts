import { Injectable } from '@angular/core';

type PreferenceKey = 'translation.isTextTranslation' | 'vocab-game.isSentenceGame' | 'vocab-game.selectedLevel' | 'vocab-game.selectedBook' | 'vocab-game.selectedWordType' | 'vocab-game.itemCount' | 'quiz.level' | 'quiz.difficulty' | 'quiz.book' | 'quiz.quizType' | 'quiz.itemCount';

type PreferenceMap = {
  'translation.isTextTranslation': boolean;
  'vocab-game.isSentenceGame': boolean;
  'vocab-game.selectedLevel': string;
  'vocab-game.selectedBook': number;
  'vocab-game.selectedWordType': 'ALL TYPES' | 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB';
  'vocab-game.itemCount': number;
  'quiz.level': string;
  'quiz.difficulty': number;
  'quiz.book': number;
  'quiz.quizType': 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR';
  'quiz.itemCount': number;
};

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {

  private readonly key = 'isTextTranslation';

  set<K extends PreferenceKey>(key: K, value: PreferenceMap[K]): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<K extends PreferenceKey>(key: K, fallback: PreferenceMap[K]): PreferenceMap[K] {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  }
}
