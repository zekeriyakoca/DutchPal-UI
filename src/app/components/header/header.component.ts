import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isMobileMenuOpen = signal(false);

  readonly links = [
    { path: '/chat', label: 'Chat' },
    { path: '/translation', label: 'Translation' },
    { path: '/vocab-game', label: 'Vocab Game' },
    { path: '/quiz', label: 'Practice' },
    { path: '/study-book', label: 'Study Book' },
  ];
}
