import { ToastService } from './../../services/toast.service';
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
  selectedWordType = signal('VERB');
  itemCount = 5;
  isLoading = signal(false);
  bookOptions = signal<Options[]>([]);

  constructor(private apiService: ApiService, private userPreferences: UserPreferencesService, private toastService : ToastService) {
    this.retrieveUserPreferences();

    this.apiService.getBootstrapData().pipe(first()).subscribe((data)=>{
      this.bookOptions.set( data.book_options);
    });
  }

  translate() {
    this.isLoading.set(true);
    this.setUserPreferences();

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
          this.selectedWordType()
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


  private retrieveUserPreferences() {
    this.isSentenceGame = this.userPreferences.get('vocab-game.isSentenceGame', false);
    this.selectedLevel = this.userPreferences.get('vocab-game.selectedLevel', 'ALL LEVELS');
    this.selectedBook = this.userPreferences.get('vocab-game.selectedBook', 0);
    this.selectedWordType.set(this.userPreferences.get('vocab-game.selectedWordType', 'VERB'));
    this.itemCount = this.userPreferences.get('vocab-game.itemCount', 5);
  }

  private setUserPreferences() {
    this.userPreferences.set('vocab-game.isSentenceGame', this.isSentenceGame);
    this.userPreferences.set('vocab-game.selectedLevel', this.selectedLevel);
    this.userPreferences.set('vocab-game.selectedBook', this.selectedBook);
    this.userPreferences.set('vocab-game.selectedWordType', this.selectedWordType());
    this.userPreferences.set('vocab-game.itemCount', this.itemCount);
  }
}
