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
import { ChatTurn } from '../../models/apiRequestModels';
import { DialogService } from '../../services/dialog.service';

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
  // This page session's conversation, oldest first; not stored anywhere.
  turns = signal<ChatTurn[]>([]);
  isLoading = signal(false);

  constructor(
    private apiService: ApiService,
    private dialog: DialogService
  ) {}

  // Enter sends, Shift+Enter keeps the newline.
  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    if (keyEvent.shiftKey || keyEvent.isComposing) return;
    event.preventDefault();
    this.askQuestion();
  }

  askQuestion() {
    const question = this.prompt.trim();
    if (this.isLoading() || !question) return;
    this.isLoading.set(true);
    this.apiService
      .ask(question, this.turns())
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (answer) => {
          this.turns.update((turns) => [
            ...turns,
            { role: 'user', content: question },
            { role: 'assistant', content: answer },
          ]);
          this.prompt = '';
        },
        error: (err) => {
          this.dialog.error("Couldn't get an answer", apiErrorMessage(err), () => this.askQuestion());
        },
      });
  }
}
