import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-page-concept-sidebar',
  imports: [],
  templateUrl: './page-concept-sidebar.component.html',
  styleUrl: './page-concept-sidebar.component.scss',
})
export class PageConceptSidebarComponent {
  isMenuOpen = signal(true);

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }
}
