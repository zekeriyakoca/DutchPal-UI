import { CommonModule } from '@angular/common';
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { finalize, first } from 'rxjs';
import { MarkdownModule } from 'ngx-markdown';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { apiErrorMessage } from '../../services/http-error.interceptor';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    ShowSelectionOptionsDirective,
    DisabledUntilDirective,
    SpinUntilDirective,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent {
  prompt = '';
  answer = signal('');
  isLoading = signal(false);
  error = signal('');

  constructor(private apiService: ApiService) {}

  // Enter sends, Shift+Enter keeps the newline.
  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.shiftKey || keyEvent.isComposing) return;
    event.preventDefault();
    this.askQuestion();
  }

  askQuestion() {
    if (this.isLoading() || !this.prompt.trim()) return;
    this.isLoading.set(true);
    this.error.set('');
    this.apiService
      .ask(this.prompt)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.answer.set(response);
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
        },
      });
  }
}
