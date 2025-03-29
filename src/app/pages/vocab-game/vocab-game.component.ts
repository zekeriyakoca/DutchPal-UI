import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-vocab-game',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './vocab-game.component.html',
  styleUrl: './vocab-game.component.scss',
})
export class VocabGameComponent {
  isSentenceGame = false;
  response = signal('');
  selectedLevel = 'ALL LEVELS';
  selectedBook = 0;
  selectedWordType: 'ALL TYPES' | 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' =
    'VERB';
  itemCount = 5;

  constructor(private apiService: ApiService) {}

  translate() {
    if (this.isSentenceGame) {
      this.apiService
        .getSentences(this.selectedLevel, this.itemCount, this.selectedBook)
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    } else {
      this.apiService
        .getVocabulary(
          this.selectedLevel,
          this.itemCount,
          this.selectedBook,
          this.selectedWordType
        )
        .pipe(first())
        .subscribe((response) => {
          this.response.set(response);
        });
    }
  }
}
