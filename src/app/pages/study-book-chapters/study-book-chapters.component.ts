import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StudyBookTabsComponent } from '../../components/study-book-tabs/study-book-tabs.component';
import {
  ContentBook,
  ContentChapterSummary,
} from '../../models/contentModels';

@Component({
  selector: 'app-study-book-chapters',
  standalone: true,
  imports: [RouterLink, StudyBookTabsComponent],
  templateUrl: './study-book-chapters.component.html',
})
export class StudyBookChaptersComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  books = signal<ContentBook[]>([]);
  booksLoading = signal(true);
  booksError = signal(false);

  selectedBookId = signal<string | null>(null);
  chapters = signal<ContentChapterSummary[]>([]);
  chaptersLoading = signal(false);
  chaptersError = signal(false);

  constructor() {
    this.loadBooks();
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((params) => {
        const bookId = params.get('book');
        this.selectedBookId.set(bookId);
        if (bookId) this.loadChapters(bookId);
        else this.chapters.set([]);
      });
  }

  selectedBook(): ContentBook | undefined {
    return this.books().find((b) => b.book_id === this.selectedBookId());
  }

  selectBook(bookId: string) {
    this.router.navigate([], { queryParams: { book: bookId } });
  }

  loadBooks() {
    this.booksLoading.set(true);
    this.booksError.set(false);
    this.apiService
      .getContentBooks()
      .pipe(first())
      .subscribe({
        next: (books) => {
          this.books.set(books);
          this.booksLoading.set(false);
        },
        error: () => {
          this.booksError.set(true);
          this.booksLoading.set(false);
        },
      });
  }

  loadChapters(bookId: string) {
    this.chapters.set([]);
    this.chaptersLoading.set(true);
    this.chaptersError.set(false);
    this.apiService
      .getContentChapters(bookId)
      .pipe(first())
      .subscribe({
        next: (chapters) => {
          // Ignore a late response for a book that is no longer selected.
          if (this.selectedBookId() !== bookId) return;
          this.chapters.set(chapters);
          this.chaptersLoading.set(false);
        },
        error: () => {
          if (this.selectedBookId() !== bookId) return;
          this.chaptersError.set(true);
          this.chaptersLoading.set(false);
        },
      });
  }
}
