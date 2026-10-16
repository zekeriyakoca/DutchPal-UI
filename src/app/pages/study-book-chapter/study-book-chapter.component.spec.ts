import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { StudyBookChapterComponent } from './study-book-chapter.component';
import { ApiService } from '../../services/api.service';
import { ContentChapter } from '../../models/contentModels';

// Synthetic fixture: never use real book text here (the books are copyrighted).
const CHAPTER: ContentChapter = {
  id: 5,
  book_id: 'test-book',
  book_title: 'Test Book',
  number: 3,
  title: 'Test chapter',
  goals: ['Een testdoel'],
  note: null,
  book_pages: [10, 20],
  dialogues: [],
  vocabulary: [
    {
      list: 'Testlijst',
      book_page: 11,
      items: [
        { nl: 'woord', lemma: 'woord', article: 'het', en: 'word' },
        { nl: 'liep', lemma: 'lopen', form: 'liep', en: 'walked' },
      ],
    },
  ],
  grammar: [],
  exercises: [
    {
      id: 1,
      label: 'Oefening 1',
      type: 'fill_gap',
      instruction: 'Vul in.',
      book_page: 12,
      answers_source: 'generated_needs_review',
      payload: { items: [{ n: 1, text: 'Ik ___ hier.', answers: ['ben'] }] },
    },
    {
      id: 2,
      label: 'Oefening 2',
      type: 'writing',
      instruction: 'Schrijf.',
      book_page: 13,
      answers_source: 'book',
      payload: {},
    },
  ],
  culture: [],
  reflection: { can_do: ['iets testen'] },
};

describe('StudyBookChapterComponent', () => {
  function create(getContentChapter: jasmine.Spy) {
    TestBed.configureTestingModule({
      imports: [StudyBookChapterComponent],
      providers: [
        provideRouter([
          { path: 'study-book/chapters/:id', component: StudyBookChapterComponent },
        ]),
        { provide: ApiService, useValue: { getContentChapter } },
      ],
    });
  }

  async function renderAt(url: string) {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, StudyBookChapterComponent);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  it('loads the chapter from the route id and renders its sections', async () => {
    const spy = jasmine.createSpy().and.returnValue(of(CHAPTER));
    create(spy);
    const el = await renderAt('/study-book/chapters/5');

    expect(spy).toHaveBeenCalledWith(5);
    expect(el.querySelector('h1')?.textContent).toContain('Test chapter');
    expect(el.textContent).toContain('Een testdoel');
    expect(el.textContent).toContain('het woord');
    expect(el.textContent).toContain('lemma: lopen');
    expect(el.textContent).not.toContain('form: liep');
    expect(el.textContent).toContain('Ik ___ hier.');
    expect(el.textContent).not.toContain('ben');
    expect(el.textContent).toContain('iets testen');
  });

  it('marks only exercises with generated answers', async () => {
    create(jasmine.createSpy().and.returnValue(of(CHAPTER)));
    const el = await renderAt('/study-book/chapters/5');

    const badges = el.querySelectorAll('.generated-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].textContent?.trim()).toBe('answers not from the book');
  });

  it('shows an error with retry when loading fails', async () => {
    const spy = jasmine
      .createSpy()
      .and.returnValues(throwError(() => new Error('boom')), of(CHAPTER));
    create(spy);
    const el = await renderAt('/study-book/chapters/5');

    expect(el.textContent).toContain('Could not load this chapter.');
    const retry = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Retry'
    )!;
    retry.click();
    await new Promise((r) => setTimeout(r));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
