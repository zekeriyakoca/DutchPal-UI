import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { Option } from '../../models/bootstrap';
import { QuizQuestion } from '../../models/apiResponse';
import { QuizRequest } from '../../models/apiRequestModels';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageConceptSidebarComponent,
    DisabledUntilDirective,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuizComponent {
  readonly quizTypes: QuizRequest['quiz_type'][] = [
    'MIXED',
    'VOCABULARY',
    'TRANSLATION',
    'GRAMMAR',
  ];
  questions = signal<QuizQuestion[] | null>(null);
  // Chosen option per question; null until answered.
  choices = signal<(string | null)[]>([]);
  score = computed(
    () =>
      this.questions()?.filter((q, i) => this.choices()[i] === q.answer)
        .length ?? 0
  );
  isFinished = computed(() => this.choices().every((c) => c !== null));
  selectedLevel = 'ALL LEVELS';
  selectedDifficultyLevel = 5;
  selectedBook = '';
  selectedQuizType: QuizRequest['quiz_type'] = 'MIXED';
  itemCount = 5;
  isLoading = signal(false);
  bookOptions = signal<Option[]>([]);

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
          this.questions.set(response.questions);
          this.restart();
        },
        error: (err) => {
          console.error('Quiz generation failed:', err);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }
  choose(index: number, option: string) {
    this.choices.update((choices) =>
      choices.map((c, i) => (i === index ? option : c))
    );
  }

  restart() {
    this.choices.set((this.questions() ?? []).map(() => null));
  }

  retrieveUserPreferences() {
    this.selectedLevel = this.userPreferences.get('quiz.level', 'ALL LEVELS');
    this.selectedDifficultyLevel = this.userPreferences.get(
      'quiz.difficulty',
      5
    );
    this.selectedBook = this.userPreferences.get('quiz.bookId', '');
    const quizType = this.userPreferences.get('quiz.quizType', 'MIXED');
    // A stored type may be one that was removed (PARAGRAPH).
    this.selectedQuizType = this.quizTypes.includes(quizType)
      ? quizType
      : 'MIXED';
    this.itemCount = this.userPreferences.get('quiz.itemCount', 5);
  }
  setUserPreferences() {
    this.userPreferences.set('quiz.level', this.selectedLevel);
    this.userPreferences.set('quiz.difficulty', this.selectedDifficultyLevel);
    this.userPreferences.set('quiz.bookId', this.selectedBook);
    this.userPreferences.set('quiz.quizType', this.selectedQuizType);
    this.userPreferences.set('quiz.itemCount', this.itemCount);
  }
}
