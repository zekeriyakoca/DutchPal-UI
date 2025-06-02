import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TranslationComponent } from './pages/translation/translation.component';
import { VocabGameComponent } from './pages/vocab-game/vocab-game.component';
import { StudyBookComponent } from './pages/study-book/study-book.component';
import { QuizComponent } from './pages/quiz/quiz.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ask', redirectTo: '' },
  { path: 'chat', component: HomeComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'translation', component: TranslationComponent },
  { path: 'vocab-game', component: VocabGameComponent },
  { path: 'study-book', component: StudyBookComponent },
];
