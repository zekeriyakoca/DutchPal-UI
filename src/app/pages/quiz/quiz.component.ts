import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    PageConceptSidebarComponent,
    DisabledUntilDirective,
    SpinUntilDirective,
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuizComponent {
  response = signal('');
  selectedLevel = 'ALL LEVELS';
  selectedDifficultyLevel = 5;
  selectedBook = 0;
  selectedQuizType: 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR' =
    'MIXED';
  itemCount = 5;
  isLoading = signal(false);

  constructor(private apiService: ApiService) {}

  translate() {
    this.isLoading.set(true);
    this.apiService
      .generateQuiz(
        this.selectedLevel,
        this.selectedDifficultyLevel,
        this.itemCount,
        this.selectedBook,
        this.selectedQuizType
      )
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.response.set(response);
        },
        error: (err) => {
          console.error('Quiz generation failed:', err);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }
}
