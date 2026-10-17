import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-study-book-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="flex gap-1 p-1 bg-gray-100 rounded-lg text-sm">
      @for (tab of tabs; track tab.path) {
      <a [routerLink]="tab.path" routerLinkActive="bg-white shadow text-indigo-700"
        [routerLinkActiveOptions]="{ exact: true }"
        class="flex-1 px-3 py-1.5 text-center rounded-md whitespace-nowrap">{{ tab.label }}</a>
      }
    </div>
  `,
})
export class StudyBookTabsComponent {
  tabs = [
    { path: '/study-book', label: 'Book chapters' },
    { path: '/study-book/ai', label: 'AI study book' },
  ];
}
