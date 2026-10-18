import { Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { UserPreferencesService } from './user-preferences.service';

// Reads Dutch text aloud with the Azure voice from /tts (signed-in users only). Words (1–2, like the
// text selection's word rule) always; longer text only with Settings → General "Natural Dutch voice".
@Injectable({
  providedIn: 'root',
})
export class TtsService {
  // The text being read (or loaded), shown in the "Now reading" popup; null when silent.
  readonly speaking = signal<string | null>(null);
  private audio = new Audio();
  private request?: Subscription;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private toastService: ToastService,
    private userPreferences: UserPreferencesService
  ) {
    this.audio.onended = () => this.stop();
    // Leaving the tab or the window stops the voice.
    document.addEventListener('visibilitychange', () => document.hidden && this.stop());
    window.addEventListener('blur', () => this.stop());
  }

  speak(text: string) {
    text = text.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim(); // markdown marks are not read
    if (!text) return;
    this.stop();

    if (!this.authService.user()) {
      this.toastService.addWarning('Sign in to listen to Dutch.');
      return;
    }
    const isWord = text.split(' ').length <= 2;
    if (!isWord && !this.userPreferences.get('general.useAdvancedVoice', false)) {
      this.toastService.addWarning('Turn on "Natural Dutch voice" in Settings → General to listen to sentences.');
      return;
    }

    this.speaking.set(text);
    this.request = this.apiService.textToSpeech(text).subscribe({
      next: (mp3) => {
        this.audio.src = URL.createObjectURL(mp3);
        this.audio.play().catch(() => this.stop());
      },
      error: () => {
        this.stop();
        this.toastService.addError("The voice isn't available right now. Please try again later.");
      },
    });
  }

  stop() {
    this.request?.unsubscribe();
    this.audio.pause();
    if (this.audio.src) URL.revokeObjectURL(this.audio.src);
    this.audio.removeAttribute('src');
    this.speaking.set(null);
  }
}
