import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import {
  ContentBook,
  ContentChapter,
  ContentChapterSummary,
} from '../models/contentModels';

describe('ApiService content endpoints', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the list of books', () => {
    const books: ContentBook[] = [
      { book_id: 'test-book', title: 'Test Book', cefr: 'A1', chapter_count: 2 },
    ];
    let result: ContentBook[] | undefined;

    service.getContentBooks().subscribe((r) => (result = r));

    const req = http.expectOne(`${environment.apiUrl}/content/books`);
    expect(req.request.method).toBe('GET');
    req.flush(books);
    expect(result).toEqual(books);
  });

  it('gets the chapters of a book, encoding the book id', () => {
    const chapters: ContentChapterSummary[] = [
      { id: 7, number: 1, title: 'Chapter one', goals: ['goal'], has_exercises: true },
    ];
    let result: ContentChapterSummary[] | undefined;

    service.getContentChapters('test book').subscribe((r) => (result = r));

    const req = http.expectOne(
      `${environment.apiUrl}/content/books/test%20book/chapters`
    );
    expect(req.request.method).toBe('GET');
    req.flush(chapters);
    expect(result).toEqual(chapters);
  });

  it('gets a single chapter by id', () => {
    const chapter: ContentChapter = {
      id: 7,
      book_id: 'test-book',
      book_title: 'Test Book',
      number: 1,
      title: 'Chapter one',
      goals: [],
      note: null,
      book_pages: null,
      dialogues: [],
      vocabulary: [],
      grammar: [],
      exercises: [],
      culture: [],
      reflection: null,
    };
    let result: ContentChapter | undefined;

    service.getContentChapter(7).subscribe((r) => (result = r));

    const req = http.expectOne(`${environment.apiUrl}/content/chapters/7`);
    expect(req.request.method).toBe('GET');
    req.flush(chapter);
    expect(result).toEqual(chapter);
  });

  it('passes HTTP errors to the subscriber', () => {
    let status: number | undefined;

    service.getContentChapter(99).subscribe({
      error: (e) => (status = e.status),
    });

    http
      .expectOne(`${environment.apiUrl}/content/chapters/99`)
      .flush('not found', { status: 404, statusText: 'Not Found' });
    expect(status).toBe(404);
  });
});
