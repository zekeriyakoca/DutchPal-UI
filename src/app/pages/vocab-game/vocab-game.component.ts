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

@Component({
  selector: 'app-vocab-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    PageConceptSidebarComponent,
    DisabledUntilDirective,
    SpinUntilDirective,
  ],
  templateUrl: './vocab-game.component.html',
  styleUrl: './vocab-game.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VocabGameComponent {
  isSentenceGame = false;
  response = signal('');
  selectedLevel = 'ALL LEVELS';
  selectedBook = 0;
  selectedWordType: 'ALL TYPES' | 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' =
    'VERB';
  itemCount = 5;
  isLoading = signal(false);
  bookOptions = signal<Options[]>([]);

  constructor(private apiService: ApiService) {
    this.apiService.getBootstrapData().pipe(first()).subscribe((data)=>{
      this.bookOptions.set( data.book_options);
    });
  }

  translate() {
    this.isLoading.set(true);

    if (this.isSentenceGame) {
      this.apiService
        .getSentences(this.selectedLevel, this.itemCount, this.selectedBook)
        .pipe(first())
        .subscribe({
          next: (response) => {
            this.response.set(response);
          },
          error: (err) => {
            console.error('Unable to fetch sentences:', err);
          },
          complete: () => {
            this.isLoading.set(false);
          },
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
        .subscribe({
          next: (response) => {
            this.response.set(response);
          },
          error: (err) => {
            console.error('Unable to fetch vocabulary:', err);
          },
          complete: () => {
            this.isLoading.set(false);
          },
        });
    }
  }
}
