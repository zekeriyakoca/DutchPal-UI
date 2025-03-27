import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TranslationComponent } from './pages/translation/translation.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ask', redirectTo: '' },
  { path: 'chat', component: HomeComponent },
  { path: 'quiz', component: HomeComponent },
  { path: 'translation', component: TranslationComponent },
  { path: 'vocab-game', component: HomeComponent },
];
