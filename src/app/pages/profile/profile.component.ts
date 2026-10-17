import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleSignInButtonDirective } from '../../directives/google-sign-in-button.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, GoogleSignInButtonDirective],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  constructor(public authService: AuthService) {}

  memberSince(createdAt: string): string {
    return new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' });
  }
}
