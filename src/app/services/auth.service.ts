import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../models/userModels';
import { ApiService } from './api.service';

// Google Identity Services, loaded on first use from accounts.google.com
declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly isEnabled = !!environment.googleClientId;
  readonly user = signal<User | null>(null);
  readonly isLoaded = signal(false); // false until /auth/me answered

  private googleLoaded?: Promise<void>;

  constructor(private apiService: ApiService, private router: Router) {
    this.apiService.getMe().subscribe({
      next: (state) => this.user.set(state.user),
      complete: () => this.isLoaded.set(true),
      error: () => this.isLoaded.set(true),
    });
  }

  renderSignInButton(element: HTMLElement) {
    this.loadGoogle()
      .then(() =>
        google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
        })
      )
      .catch(() => console.error('Google sign-in could not be loaded'));
  }

  signOut() {
    this.apiService.signOut().subscribe(() => {
      this.user.set(null);
      if (typeof google !== 'undefined') {
        google.accounts.id.disableAutoSelect();
      }
      this.router.navigateByUrl('/');
    });
  }

  private signIn(credential: string) {
    this.apiService
      .signInWithGoogle(credential)
      .subscribe((user) => this.user.set(user));
  }

  private loadGoogle(): Promise<void> {
    this.googleLoaded ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: { credential: string }) =>
            this.signIn(response.credential),
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return this.googleLoaded;
  }
}
