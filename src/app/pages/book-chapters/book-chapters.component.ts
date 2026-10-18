import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MarkdownPipe } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { ExerciseComponent } from './exercise.component';
import {
  BookCategory,
  Chapter,
  ChapterSummary,
  ContentBook,
} from '../../models/contentModels';

// Book picker groups, in this order; exam books live on the Exams page.
const BOOK_GROUPS: { label: string; category: BookCategory | null }[] = [
  { label: 'Learning Books', category: 'learning' },
  { label: 'Reading Books', category: 'reading' },
  { label: 'Grammar', category: 'grammar' },
  { label: 'Other', category: null },
];
// Rows of a vocabulary list shown before "Show all".
const VOCAB_PREVIEW = 3;

@Component({
  selector: 'app-book-chapters',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    MarkdownPipe,
    PageConceptSidebarComponent,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
    ExerciseComponent,
  ],
  templateUrl: './book-chapters.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BookChaptersComponent {
  books = signal<ContentBook[]>([]);
  bookGroups = computed(() =>
    BOOK_GROUPS.map((group) => ({
      label: group.label,
      books: this.books().filter((b) => b.category === group.category),
    })).filter((group) => group.books.length)
  );
  chapters = signal<ChapterSummary[]>([]);
  chapter = signal<Chapter | null>(null);
  selectedBook = '';
  selectedChapter = 0;
  isLoading = signal(false);
  readonly vocabPreview = VOCAB_PREVIEW;
  // Indexes of the vocabulary lists the user expanded in this chapter.
  expandedLists = new Set<number>();

  constructor(
    private apiService: ApiService,
    private userPreferences: UserPreferencesService,
    route: ActivatedRoute
  ) {
    // A link like ?book=dutch-grammar-in-use&chapter=172 (writing feedback) wins over the remembered chapter.
    const linked = route.snapshot.queryParamMap;
    this.apiService
      .getContentBooks()
      .pipe(first())
      .subscribe((books) => {
        this.books.set(books.filter((b) => b.category !== 'exams'));
        // A remembered exam book (from before the Exams page) is not restored here.
        const bookId = linked.get('book') ?? this.userPreferences.get('book-chapters.bookId', '');
        if (this.books().some((b) => b.book_id === bookId)) {
          this.setBookSelected(
            bookId,
            Number(linked.get('chapter')) || this.userPreferences.get('book-chapters.chapterId', 0)
          );
        }
      });
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
      .subscribe((chapter) => {
        this.expandedLists.clear();
        this.chapter.set(chapter);
        window.scrollTo({ top: 0 });
      });
  }

  toggleList(index: number) {
    if (!this.expandedLists.delete(index)) this.expandedLists.add(index);
  }

  // The chapter before (-1) or after (+1) the selected one in this book.
  adjacentChapter(offset: number): ChapterSummary | undefined {
    const chapters = this.chapters();
    const index = chapters.findIndex((c) => c.id === this.selectedChapter);
    return index < 0 ? undefined : chapters[index + offset];
  }
}
