import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { Options } from '../../models/bootstrap';
import { UserPreferencesService } from '../../services/user-preferences.service';

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
  bookOptions = signal<Options[]>([]);

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService
  ) {
    this.retrieveUserPreferences();
    this.apiService
      .getBootstrapData()
      .pipe(first())
      .subscribe((data) => {
        this.bookOptions.set(data.book_options);
      });
  }

  translate() {
    this.isLoading.set(true);
    this.setUserPreferences();
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
  retrieveUserPreferences() {
    this.selectedLevel = this.userPreferences.get('quiz.level', 'ALL LEVELS');
    this.selectedDifficultyLevel = this.userPreferences.get(
      'quiz.difficulty',
      5
    );
    this.selectedBook = this.userPreferences.get('quiz.book', 0);
    this.selectedQuizType = this.userPreferences.get('quiz.quizType', 'MIXED');
    this.itemCount = this.userPreferences.get('quiz.itemCount', 5);
  }
  setUserPreferences() {
    this.userPreferences.set('quiz.level', this.selectedLevel);
    this.userPreferences.set('quiz.difficulty', this.selectedDifficultyLevel);
    this.userPreferences.set('quiz.book', this.selectedBook);
    this.userPreferences.set('quiz.quizType', this.selectedQuizType);
    this.userPreferences.set('quiz.itemCount', this.itemCount);
  }
}
