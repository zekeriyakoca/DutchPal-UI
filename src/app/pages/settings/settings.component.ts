import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleSignInButtonDirective } from '../../directives/google-sign-in-button.directive';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, GoogleSignInButtonDirective],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  constructor(public authService: AuthService) {}
}
