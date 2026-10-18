import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { UserPreferencesService } from './user-preferences.service';

// Reads Dutch text aloud. Words (1–2, like the text selection's word rule) always use the Azure voice
// from /tts; longer text only with Settings → General "Use advanced paid voice service".
// Otherwise, or when /tts fails (no key, quota, offline), the browser's own voice reads it.
@Injectable({
  providedIn: 'root',
})
export class TtsService {
  private audio = new Audio();
  private request?: Subscription;

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService
  ) {}

  speak(text: string) {
    text = text.replace(/[*_`#>]/g, '').replace(/\s+/g, ' ').trim(); // markdown marks are not read
    if (!text) return;
    this.stop();

    const isWord = text.split(' ').length <= 2;
    if (!isWord && !this.userPreferences.get('general.useAdvancedVoice', false)) {
      this.speakInBrowser(text);
      return;
    }
    this.request = this.apiService.textToSpeech(text).subscribe({
      next: (mp3) => {
        this.audio.src = URL.createObjectURL(mp3);
        this.audio.play().catch(() => this.speakInBrowser(text));
      },
      error: () => this.speakInBrowser(text),
    });
  }

  stop() {
    this.request?.unsubscribe();
    this.audio.pause();
    if (this.audio.src) URL.revokeObjectURL(this.audio.src);
    window.speechSynthesis?.cancel();
  }

  private speakInBrowser(text: string) {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.voice = speechSynthesis.getVoices().find((voice) => voice.lang.startsWith('nl')) ?? null;
    speechSynthesis.speak(utterance);
  }
}
