import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent {
  response = signal('');
  selectedLevel = 'ALL LEVELS';
  selectedDifficultyLevel = 5;
  selectedBook = 0;
  selectedQuizType: 'MIXED' | 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR' =
    'MIXED';
  itemCount = 5;

  constructor(private apiService: ApiService) {}

  translate() {
    this.apiService
      .generateQuiz(
        this.selectedLevel,
        this.selectedDifficultyLevel,
        this.itemCount,
        this.selectedBook,
        this.selectedQuizType
      )
      .pipe(first())
      .subscribe((response) => {
        this.response.set(response);
      });
  }
}
