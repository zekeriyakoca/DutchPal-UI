import { Component, signal } from '@angular/core';
import { UserPreferencesService } from '../../services/user-preferences.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  template: `<section class="card p-5 sm:p-8" aria-labelledby="general-heading">
    <h2 id="general-heading" class="text-lg font-semibold text-ink">General</h2>

    <div class="mt-6">
      <p id="ai-assistant-label" class="field-label">AI assistant</p>
      <div class="segmented" role="group" aria-labelledby="ai-assistant-label">
        <button type="button" [attr.aria-pressed]="aiAssistant() === 'chatgpt'" (click)="setAiAssistant('chatgpt')">ChatGPT</button>
        <button type="button" [attr.aria-pressed]="aiAssistant() === 'claude'" (click)="setAiAssistant('claude')">Claude</button>
      </div>
      <p class="mt-2 text-xs text-ink-subtle">
        "Ask" on a text selection opens this assistant with the selected text and your question.
      </p>
    </div>
  </section>`,
})
export class GeneralSettingsComponent {
  aiAssistant = signal<'chatgpt' | 'claude'>('chatgpt');

  constructor(private userPreferences: UserPreferencesService) {
    this.aiAssistant.set(userPreferences.get('general.aiAssistant', 'chatgpt'));
  }

  setAiAssistant(assistant: 'chatgpt' | 'claude') {
    this.aiAssistant.set(assistant);
    this.userPreferences.set('general.aiAssistant', assistant);
  }
}
