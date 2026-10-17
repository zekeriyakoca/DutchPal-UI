import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-study-book-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex gap-2 text-sm" aria-label="Study book mode">
      <a
        routerLink="/study-book"
        routerLinkActive
        #book="routerLinkActive"
        [routerLinkActiveOptions]="{ exact: true }"
        class="rounded-full px-4 py-1.5 ring-1 ring-primary-200"
        [class]="book.isActive ? 'bg-primary-700 text-white' : 'text-primary-700 hover:bg-primary-50'"
        >Book chapters</a
      >
      <a
        routerLink="/study-book/ai"
        routerLinkActive
        #ai="routerLinkActive"
        class="rounded-full px-4 py-1.5 ring-1 ring-primary-200"
        [class]="ai.isActive ? 'bg-primary-700 text-white' : 'text-primary-700 hover:bg-primary-50'"
        >AI study book</a
      >
    </nav>
  `,
})
export class StudyBookTabsComponent {}
