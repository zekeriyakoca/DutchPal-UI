import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    ShowSelectionOptionsDirective,
  ],
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.scss',
})
export class TranslationComponent {
  prompt = '';
  isTextTranslation = false;
  response = signal('');

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService
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
    if (this.isTextTranslation) {
      this.apiService
        .translateText(this.prompt)
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    } else {
      this.apiService
        .translateWord(this.prompt)
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    }
  }
}
