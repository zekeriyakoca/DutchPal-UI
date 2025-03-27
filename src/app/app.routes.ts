import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', redirectTo: '' },
  { path: 'quiz', component: HomeComponent },
  { path: 'translation', component: HomeComponent },
  { path: 'vocab-game', component: HomeComponent },
];
