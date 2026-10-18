import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService } from '../../services/api.service';
import { finalize, first } from 'rxjs';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { apiErrorMessage } from '../../services/http-error.interceptor';
import { WordLookup } from '../../models/apiResponse';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    ShowSelectionOptionsDirective,
    DisabledUntilDirective,
    SpinUntilDirective,
  ],
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.scss',
})
export class TranslationComponent {
  prompt = '';
  isTextTranslation = false;
  response = signal('');
  word = signal<WordLookup | null>(null);
  isLoading = signal(false);

  readonly sourceLabels: Record<WordLookup['source'], string> = {
    book: 'From the book',
    db: 'Word list + AI',
    dictionary: 'Dictionary + AI',
    llm: 'From AI',
  };

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService,
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.isTextTranslation = this.userPreferences.get(
      'translation.isTextTranslation',
      false
    );
  }

  setIsTextTranslation(value: boolean): void {
    this.isTextTranslation = value;
    this.userPreferences.set('translation.isTextTranslation', value);
  }

  translate() {
    if (this.isLoading() || !this.prompt.trim()) return;
    this.isLoading.set(true);
    this.response.set('');
    this.word.set(null);
    const done = () => this.isLoading.set(false);
    const onError = (err: unknown) =>
      this.dialog.error("Couldn't translate that", apiErrorMessage(err), () => this.translate());

    if (this.isTextTranslation) {
      this.apiService
        .translateText(this.prompt)
        .pipe(first(), finalize(done))
        .subscribe({
          next: (response) => this.response.set(response),
          error: onError,
        });
    } else {
      this.apiService
        .lookupWord(this.prompt)
        .pipe(first(), finalize(done))
        .subscribe({
          next: (word) => this.word.set(word),
          error: onError,
        });
    }
  }
}
