import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TranslationComponent } from './pages/translation/translation.component';
import { VocabGameComponent } from './pages/vocab-game/vocab-game.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { BookChaptersComponent } from './pages/book-chapters/book-chapters.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ask', redirectTo: '' },
  { path: 'chat', component: HomeComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'translation', component: TranslationComponent },
  { path: 'vocab-game', component: VocabGameComponent },
  { path: 'study-book', component: BookChaptersComponent },
  {
    path: 'exams',
    loadComponent: () => import('./pages/exams/exams.component').then((m) => m.ExamsComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/settings/general-settings.component').then((m) => m.GeneralSettingsComponent),
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./pages/settings/integrations.component').then((m) => m.IntegrationsComponent),
      },
      {
        path: 'integrations/notion',
        loadComponent: () =>
          import('./pages/settings/notion-settings.component').then((m) => m.NotionSettingsComponent),
      },
    ],
  },
];
