import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleSignInButtonDirective } from '../../directives/google-sign-in-button.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, GoogleSignInButtonDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isMobileMenuOpen = signal(false);
  isUserMenuOpen = signal(false);

  readonly links = [
    { path: '/chat', label: 'Chat' },
    { path: '/translation', label: 'Translation' },
    { path: '/vocab-game', label: 'Vocab Game' },
    { path: '/quiz', label: 'Practice' },
    { path: '/study-book', label: 'Study Book' },
    { path: '/exams', label: 'Exams' },
  ];

  constructor(public authService: AuthService) {}

  closeUserMenuOnOutsideClick(event: MouseEvent, menu: HTMLElement) {
    if (!menu.contains(event.target as Node)) {
      this.isUserMenuOpen.set(false);
    }
  }

  signOut() {
    this.isUserMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.authService.signOut();
  }
}
