import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { apiErrorMessage } from '../../services/http-error.interceptor';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { StudyBookTabsComponent } from '../../components/study-book-tabs/study-book-tabs.component';
import { ChapterViewComponent } from '../../components/chapter-content/chapter-view.component';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import {
  ContentBook,
  ContentChapter,
  ContentChapterSummary,
} from '../../models/contentModels';

@Component({
  selector: 'app-study-book-chapters',
  standalone: true,
  imports: [
    FormsModule,
    PageConceptSidebarComponent,
    StudyBookTabsComponent,
    ChapterViewComponent,
    SpinUntilDirective,
  ],
  templateUrl: './study-book-chapters.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StudyBookChaptersComponent {
  selectedBook = '';
  selectedChapter = 0;
  books = signal<ContentBook[]>([]);
  chapters = signal<ContentChapterSummary[]>([]);
  chapter = signal<ContentChapter | null>(null);
  isLoading = signal(false);
  error = signal('');

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService
  ) {
    this.apiService
      .getContentBooks()
      .pipe(first())
      .subscribe({
        next: (books) => this.books.set(books),
        error: (err) => this.error.set(apiErrorMessage(err)),
      });

    const bookId = this.userPreferences.get('book-chapters.bookId', '');
    if (bookId) {
      this.selectBook(bookId);
      const chapterId = this.userPreferences.get('book-chapters.chapterId', 0);
      if (chapterId) this.selectChapter(chapterId);
    }
  }

  selectBook(bookId: string) {
    this.selectedBook = bookId;
    this.selectedChapter = 0;
    this.chapter.set(null);
    this.userPreferences.set('book-chapters.bookId', bookId);
    this.apiService
      .getContentChapters(bookId)
      .pipe(first())
      .subscribe({
        next: (chapters) => this.chapters.set(chapters),
        error: (err) => this.error.set(apiErrorMessage(err)),
      });
  }

  selectChapter(chapterId: number) {
    this.selectedChapter = chapterId;
    this.userPreferences.set('book-chapters.chapterId', chapterId);
    this.isLoading.set(true);
    this.error.set('');
    this.apiService
      .getContentChapter(chapterId)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (chapter) => this.chapter.set(chapter),
        error: (err) => this.error.set(apiErrorMessage(err)),
      });
  }
}
