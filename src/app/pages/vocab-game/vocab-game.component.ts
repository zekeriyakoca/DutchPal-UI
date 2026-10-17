import { ToastService } from './../../services/toast.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { Option } from '../../models/bootstrap';
import { VocabItem } from '../../models/apiResponse';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';

@Component({
  selector: 'app-vocab-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageConceptSidebarComponent,
    DisabledUntilDirective,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
  ],
  templateUrl: './vocab-game.component.html',
  styleUrl: './vocab-game.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VocabGameComponent {
  words = signal<VocabItem[] | null>(null);
  isCardMode = signal(false);
  cardIndex = signal(0);
  isRevealed = signal(false);
  knownCount = signal(0);
  selectedLevel = 'ALL LEVELS';
  selectedBook = '';
  selectedWordType = signal('VERB');
  itemCount = 5;
  isLoading = signal(false);
  bookOptions = signal<Option[]>([]);

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService,
    private toastService: ToastService
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
      .getVocabulary(
        this.selectedLevel,
        this.itemCount,
        this.selectedBook,
        this.selectedWordType()
      )
      .pipe(first())
      .subscribe({
        next: (words) => {
          this.words.set(words);
          this.restartCards();
        },
        error: (err) => {
          console.error('Unable to fetch vocabulary:', err);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  answerCard(known: boolean) {
    if (known) this.knownCount.update((n) => n + 1);
    this.cardIndex.update((i) => i + 1);
    this.isRevealed.set(false);
  }

  restartCards() {
    this.cardIndex.set(0);
    this.knownCount.set(0);
    this.isRevealed.set(false);
  }

  // Splits an example into parts; odd indexes are forms of the word, shown bold.
  exampleParts(item: VocabItem, example: string): string[] {
    const forms = [
      item.word,
      item.lemma,
      item.present_form,
      item.v2_form,
      item.v3_form,
    ]
      .flatMap((form) => form?.split('/') ?? [])
      .map((form) => form.trim())
      .filter((form) => form.length > 1)
      .map((form) => form.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!forms.length) return [example];
    return example.split(
      new RegExp(`(?<!\\p{L})(${forms.join('|')})(?!\\p{L})`, 'iu')
    );
  }

  private retrieveUserPreferences() {
    this.selectedLevel = this.userPreferences.get(
      'vocab-game.selectedLevel',
      'ALL LEVELS'
    );
    this.selectedBook = this.userPreferences.get('vocab-game.bookId', '');
    this.selectedWordType.set(
      this.userPreferences.get('vocab-game.selectedWordType', 'VERB')
    );
    this.itemCount = this.userPreferences.get('vocab-game.itemCount', 5);
  }

  private setUserPreferences() {
    this.userPreferences.set('vocab-game.selectedLevel', this.selectedLevel);
    this.userPreferences.set('vocab-game.bookId', this.selectedBook);
    this.userPreferences.set(
      'vocab-game.selectedWordType',
      this.selectedWordType()
    );
    this.userPreferences.set('vocab-game.itemCount', this.itemCount);
  }
}
