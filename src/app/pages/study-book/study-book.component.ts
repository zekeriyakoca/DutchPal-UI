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
import { Option } from '../../models/bootstrap';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-study-book',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownModule,
    PageConceptSidebarComponent,
    DisabledUntilDirective,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
  ],
  templateUrl: './study-book.component.html',
  styleUrl: './study-book.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudyBookComponent {
  isBringSentences = false;
  response = signal('');
  selectedLevel = 'ALL LEVELS';
  selectedBook = 0;
  selectedChapter: string = '';
  selectedWordType = signal('VERB');
  itemCount = 5;
  isLoading = signal(false);
  bookOptions = signal<Option[]>([]);
  chapterOptions = signal<Option[]>([]);
  sentences = signal<string[]>([]);

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

    toObservable(this.sentences).subscribe((s) => {
      if (s.length > 0) {
        const allowedCharsRegex =
          /[^a-zA-Z0-9\s#*_\-+~>\[\]()!`€$+@'"∞&@:.,?!\\/]/g;

        const md =
          `# ${this.getSelectedChapterTitle()}\n\n` +
          s
            .filter((x) => x.trim().length > 3)
            .map((line) => line.replace(allowedCharsRegex, ''))
            .join('\n\n');

        this.response.set(md);
      } else {
        this.response.set('');
      }
    });
  }

  private getSelectedChapterTitle() {
    const chapter = this.chapterOptions().find(
      (c) => c.id == +this.selectedChapter
    )?.name;
    return chapter ? `Chapter: ${chapter}` : 'Chapter: Not selected';
  }

  setBookSelected(bookId: number) {
    this.selectedBook = bookId;
    this.apiService
      .getSectionNamesOfBook(bookId)
      .pipe(first())
      .subscribe((options) => {
        this.chapterOptions.set(options);
      });
  }

  fetchContent() {
    if (+this.selectedChapter < 1) return;

    this.isLoading.set(true);
    this.setUserPreferences();

    if (this.isBringSentences) {
      this.apiService
        .getSectionSectences(this.selectedBook, +this.selectedChapter)
        .pipe(first())
        .subscribe((x) => {
          this.isLoading.set(false);
          var sentenceList = x.map((s) => s.text);
          this.sentences.set(sentenceList);
        });
    } else {
      this.apiService
        .getSectionContent(this.selectedBook, +this.selectedChapter)
        .pipe(first())
        .subscribe((content) => {
          this.isLoading.set(false);
          this.response.set(content);
        });
    }
  }

  private retrieveUserPreferences() {
    this.isBringSentences = this.userPreferences.get(
      'study-book.isBringSentences',
      false
    );
    const bookId = this.userPreferences.get('study-book.selectedBookId', 0);
    const chapterId = this.userPreferences.get(
      'study-book.selectedChapterId',
      0
    );

    if (bookId) {
      this.selectedBook = bookId;
      this.setBookSelected(bookId);
    }

    if (chapterId) {
      this.selectedChapter = chapterId.toString();
    }
  }

  private setUserPreferences() {
    this.userPreferences.set(
      'study-book.isBringSentences',
      this.isBringSentences
    );
    this.userPreferences.set('study-book.selectedBookId', this.selectedBook);
    this.userPreferences.set(
      'study-book.selectedChapterId',
      +this.selectedChapter
    );
  }
}
