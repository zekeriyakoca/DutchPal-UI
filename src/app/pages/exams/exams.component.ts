import { Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, signal, viewChild, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, first } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { UserPreferencesService } from '../../services/user-preferences.service';
import { PageConceptSidebarComponent } from '../../components/page-concept-sidebar/page-concept-sidebar.component';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { ShowSelectionOptionsDirective } from '../../directives/show-selection-options.directive';
import { ExerciseComponent } from '../book-chapters/exercise.component';
import { Chapter, ChapterSummary, ContentBook, Exercise } from '../../models/contentModels';
import { DialogService } from '../../services/dialog.service';

type Mode = 'exam' | 'free';
type Phase = 'setup' | 'running' | 'finished';
type SectionScore = { index: number; label: string; correct: number; total: number };

// Exam mode warns when this many minutes are left.
const REMINDER_MINUTES = [10, 1];

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [
    FormsModule,
    PageConceptSidebarComponent,
    SpinUntilDirective,
    ShowSelectionOptionsDirective,
    ExerciseComponent,
  ],
  templateUrl: './exams.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExamsComponent {
  books = signal<ContentBook[]>([]);
  chapters = signal<ChapterSummary[]>([]);
  chapter = signal<Chapter | null>(null);
  selectedBook = '';
  selectedChapter = 0;
  isLoading = signal(false);

  mode = signal<Mode>('exam');
  // Exam time when the chapter has no official duration_minutes.
  minutes: number | null = null;
  phase = signal<Phase>('setup');
  current = signal(0);
  remaining = signal(0); // seconds
  scores = signal<SectionScore[]>([]);

  sections = viewChildren(ExerciseComponent);
  private content = viewChild<ElementRef<HTMLElement>>('content');
  private timer?: ReturnType<typeof setInterval>;
  private deadline = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private userPreferences: UserPreferencesService,
    destroyRef: DestroyRef,
    private dialog: DialogService
  ) {
    destroyRef.onDestroy(() => this.stopTimer());
    this.apiService
      .getContentBooks()
      .pipe(first())
      .subscribe((books) => {
        this.books.set(books.filter((b) => b.category === 'exams'));
        const bookId = this.userPreferences.get('exams.bookId', '');
        if (this.books().some((b) => b.book_id === bookId)) {
          this.setBookSelected(bookId, this.userPreferences.get('exams.chapterId', 0));
        }
      });
  }

  setBookSelected(bookId: string, chapterId = 0) {
    this.selectedBook = bookId;
    this.userPreferences.set('exams.bookId', bookId);
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
    this.userPreferences.set('exams.chapterId', chapterId);
    this.reset();
    this.isLoading.set(true);
    this.apiService
      .getContentChapter(chapterId)
      .pipe(
        first(),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe((chapter) => {
        this.chapter.set(chapter);
        window.scrollTo({ top: 0 });
      });
  }

  sectionLabel(exercise: Exercise) {
    return exercise.label || exercise.payload.title || exercise.type;
  }

  canStart() {
    return this.mode() === 'free' || !!this.chapter()?.duration_minutes || (this.minutes ?? 0) > 0;
  }

  start() {
    this.scores.set([]);
    this.current.set(0);
    this.phase.set('running');
    if (this.mode() === 'exam') {
      const seconds = (this.chapter()!.duration_minutes ?? this.minutes!) * 60;
      this.deadline = Date.now() + seconds * 1000;
      this.remaining.set(seconds);
      this.timer = setInterval(() => this.tick(), 1000);
    }
    window.scrollTo({ top: 0 });
  }

  goTo(index: number) {
    this.content()?.nativeElement.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => media.pause());
    this.current.set(index);
    this.content()?.nativeElement.scrollIntoView({ block: 'start' });
  }

  unansweredCount() {
    return this.sections().filter((s) => s.answered() === false).length;
  }

  async confirmFinish() {
    const open = this.unansweredCount();
    const finish =
      !open ||
      (await this.dialog.confirm(
        'Finish the exam?',
        `${open} ${open === 1 ? 'section is' : 'sections are'} not fully answered.`,
        'Finish anyway'
      ));
    if (finish) this.finish();
  }

  /** Checks every section, keeps the scores and opens the review. */
  finish() {
    this.stopTimer();
    const scores: SectionScore[] = [];
    this.sections().forEach((section, index) => {
      if (section.playable() && !section.results) section.check();
      const tally = section.tally();
      if (tally) scores.push({ index, label: this.sectionLabel(section.exercise()), ...tally });
    });
    this.scores.set(scores);
    this.phase.set('finished');
    this.goTo(0);
  }

  total() {
    return this.scores().reduce(
      (sum, s) => ({ correct: sum.correct + s.correct, total: sum.total + s.total }),
      { correct: 0, total: 0 }
    );
  }

  /** Question map colour: answered / unanswered while running, right / wrong after finishing. */
  mapClass(index: number) {
    const section = this.sections()[index];
    const current = index === this.current() ? ' ring-2 ring-primary-500 ring-offset-1' : '';
    if (this.phase() === 'finished') {
      const tally = section?.tally();
      if (!tally) return 'bg-canvas text-ink-subtle' + current;
      return (tally.correct === tally.total ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800') + current;
    }
    const answered = section?.answered();
    if (answered === null || answered === undefined) return 'bg-canvas text-ink-subtle' + current;
    return (answered ? 'bg-primary-600 text-white' : 'bg-white text-ink ring-1 ring-line') + current;
  }

  clock() {
    const s = this.remaining();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  reset() {
    this.stopTimer();
    this.phase.set('setup');
    this.scores.set([]);
    this.current.set(0);
  }

  private tick() {
    const before = this.remaining();
    const left = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
    this.remaining.set(left);
    for (const m of REMINDER_MINUTES) {
      if (before > m * 60 && left <= m * 60 && left > 0) {
        this.toastService.addWarning(`${m} ${m === 1 ? 'minute' : 'minutes'} left.`);
      }
    }
    if (left === 0) {
      this.toastService.addWarning('Time is up. Your answers have been submitted.');
      this.finish();
    }
  }

  private stopTimer() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
