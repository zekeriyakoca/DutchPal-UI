import { Component, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { apiErrorMessage } from '../../services/http-error.interceptor';
import { UserSettings } from '../../models/userModels';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';

@Component({
  selector: 'app-notion-settings',
  standalone: true,
  imports: [FormsModule, RouterLink, DisabledUntilDirective],
  templateUrl: './notion-settings.component.html',
})
export class NotionSettingsComponent {
  secret = '';
  nounDbId = '';
  verbDbId = '';
  isSecretSet = signal(false);
  isBusy = signal(false);
  error = signal('');
  connectedTo = signal(''); // database titles after a successful test

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    effect(() => {
      if (this.authService.user()) {
        this.apiService.getSettings().pipe(first()).subscribe((settings) => this.apply(settings));
      }
    });
  }

  save() {
    this.run(
      this.apiService.saveNotionSettings({
        secret: this.secret,
        noun_db_id: this.nounDbId,
        verb_db_id: this.verbDbId,
      }),
      'Notion settings saved'
    );
  }

  useDefault() {
    this.run(this.apiService.useDefaultNotion(), 'Using the default Notion');
  }

  test() {
    this.isBusy.set(true);
    this.error.set('');
    this.connectedTo.set('');
    this.apiService.testNotion().pipe(first()).subscribe({
      next: (titles) => {
        this.connectedTo.set(Object.values(titles).join(', '));
        this.isBusy.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.isBusy.set(false);
      },
    });
  }

  private run(request: ReturnType<ApiService['getSettings']>, message: string) {
    this.isBusy.set(true);
    this.error.set('');
    this.connectedTo.set('');
    request.pipe(first()).subscribe({
      next: (settings) => {
        this.apply(settings);
        this.toastService.addInfo(message);
        this.isBusy.set(false);
      },
      error: (error) => {
        this.error.set(apiErrorMessage(error));
        this.isBusy.set(false);
      },
    });
  }

  private apply(settings: UserSettings) {
    this.secret = '';
    this.nounDbId = settings.notion.noun_db_id ?? '';
    this.verbDbId = settings.notion.verb_db_id ?? '';
    this.isSecretSet.set(settings.notion.secret_set);
  }
}
