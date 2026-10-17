import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { StudyBookTabsComponent } from '../study-book/study-book-tabs.component';
import { ExerciseComponent } from './exercise.component';
import {
  Chapter,
  ChapterSummary,
  ContentBook,
} from '../../models/contentModels';

@Component({
  selector: 'app-book-chapters',
  standalone: true,
  imports: [
    FormsModule,
    PageConceptSidebarComponent,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
    StudyBookTabsComponent,
    ExerciseComponent,
  ],
  templateUrl: './book-chapters.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookChaptersComponent {
  books = signal<ContentBook[]>([]);
  chapters = signal<ChapterSummary[]>([]);
  chapter = signal<Chapter | null>(null);
  selectedBook = '';
  selectedChapter = 0;
  isLoading = signal(false);

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService
  ) {
    this.apiService
      .getContentBooks()
      .pipe(first())
      .subscribe((books) => this.books.set(books));

    const bookId = this.userPreferences.get('book-chapters.bookId', '');
    if (bookId) {
      this.setBookSelected(
        bookId,
        this.userPreferences.get('book-chapters.chapterId', 0)
      );
    }
  }

  setBookSelected(bookId: string, chapterId = 0) {
    this.selectedBook = bookId;
    this.userPreferences.set('book-chapters.bookId', bookId);
    this.apiService
      .getContentChapters(bookId)
      .pipe(first())
      .subscribe((chapters) => {
        this.chapters.set(chapters);
        this.setChapterSelected(chapterId || chapters[0].id);
      });
  }

  setChapterSelected(chapterId: number) {
    this.selectedChapter = chapterId;
    this.userPreferences.set('book-chapters.chapterId', chapterId);
    this.isLoading.set(true);
    this.apiService
      .getContentChapter(chapterId)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((chapter) => this.chapter.set(chapter));
  }
}
