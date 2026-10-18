import { Component, signal } from '@angular/core';
import { UserPreferencesService } from '../../services/user-preferences.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  template: `<section class="card p-5 sm:p-8">
    <h2 class="text-lg font-semibold text-ink">General</h2>

    <label class="mt-6 flex items-start gap-3">
      <input type="checkbox" class="mt-0.5 size-4 accent-primary-600" [checked]="useAdvancedVoice()"
        (change)="setUseAdvancedVoice($any($event.target).checked)" />
      <span>
        <span class="text-sm font-medium text-ink">Use advanced paid voice service</span>
        <span class="mt-1 block text-xs text-ink-subtle">
          "Listen" reads sentences and longer texts with Azure's natural Dutch voice instead of your browser's voice.
          Single words always use it.
        </span>
      </span>
    </label>
  </section>`,
})
export class GeneralSettingsComponent {
  useAdvancedVoice = signal(false);

  constructor(private userPreferences: UserPreferencesService) {
    this.useAdvancedVoice.set(userPreferences.get('general.useAdvancedVoice', false));
  }

  setUseAdvancedVoice(value: boolean) {
    this.useAdvancedVoice.set(value);
    this.userPreferences.set('general.useAdvancedVoice', value);
  }
}
