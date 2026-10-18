import { Component, computed, input, OnInit, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarkdownPipe } from 'ngx-markdown';
import { finalize, first } from 'rxjs';
import { Exercise } from '../../models/contentModels';
import { WritingEvaluation } from '../../models/apiResponse';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';
import { apiErrorMessage } from '../../services/http-error.interceptor';
import { SpinUntilDirective } from '../../directives/spin-until.directive';
import { DisabledUntilDirective } from '../../directives/disable-until.directive';
import { environment } from '../../../environments/environment';

// A gap is `___` (fill_gap) or `{a/b}` (choose_option).
const GAP = /_{3,}|\{[^{}]*\}/;
// Reading texts are light Markdown where a single newline is a line break (addresses).
const TEXT_MARKDOWN = { markedOptions: { breaks: true } };
// Writing feedback links to units of this book in the Study Book.
const GRAMMAR_BOOK = 'dutch-grammar-in-use';

/** Compares trimmed and case-insensitive, ignoring trailing .,!?; `expected` may hold `|`-separated alternatives. */
export function isCorrect(given: string, expected: string): boolean {
  const normalize = (s: string) => s.trim().replace(/[.,!?]+$/, '').toLowerCase();
  const answer = normalize(given);
  return answer !== '' && expected.split('|').some((alt) => normalize(alt) === answer);
}

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink, MarkdownPipe, SpinUntilDirective, DisabledUntilDirective],
  templateUrl: './exercise.component.html',
})
export class ExerciseComponent implements OnInit {
  exercise = input.required<Exercise>();
  // Exam mode: no checking and no assessment until the attempt is finished.
  locked = input(false);
  readonly textMarkdown = TEXT_MARKDOWN;
  readonly grammarBook = GRAMMAR_BOOK;

  // Exam-style multiple choice: every question has options and an answer `a`.
  multipleChoice = computed(() => {
    const { type, payload } = this.exercise();
    const items = payload.items ?? [];
    return ['reading', 'listening'].includes(type) && items.length > 0 && items.every((i) => i.options?.length && i.a);
  });
  playable = computed(() => this.multipleChoice() || ['fill_gap', 'choose_option'].includes(this.exercise().type));
  assessed = computed(() => ['writing', 'speaking'].includes(this.exercise().type));
  // Exam writing tasks have the official criteria the AI scores against.
  evaluable = computed(() => this.exercise().type === 'writing' && !!this.exercise().payload.criteria?.length);
  items = computed(() =>
    (this.exercise().payload.items ?? []).map((item) => {
      const question = item.text ?? item.q ?? '';
      const parts = question.split(GAP);
      if (parts.length === 1) parts.push('');
      // Options of a question without a gap go on their own lines below it.
      const stacked = this.multipleChoice() && !GAP.test(question);
      return { ...item, parts, stacked, expected: item.answers ?? [item.answer ?? item.a ?? ''] };
    })
  );

  given: string[][] = [];
  results: boolean[][] | null = null;
  written = '';
  showAssessment = false;
  evaluation = signal<WritingEvaluation | null>(null);
  isEvaluating = signal(false);

  constructor(
    private apiService: ApiService,
    private dialog: DialogService
  ) {}

  mediaUrl(path: string) {
    return `${environment.apiUrl}/media/${encodeURI(path)}`;
  }

  get score() {
    const { correct, total } = this.tally()!;
    return `${correct} / ${total}`;
  }

  /** Correct and total answers once checked; null for exercises that are not checked. */
  tally(): { correct: number; total: number } | null {
    const all = this.results?.flat();
    return all ? { correct: all.filter(Boolean).length, total: all.length } : null;
  }

  /** Whether every question has an answer; null when there is nothing to answer. */
  answered(): boolean | null {
    if (this.playable()) return this.given.every((gaps) => gaps.every((g) => g.trim() !== ''));
    return this.exercise().type === 'writing' ? this.written.trim() !== '' : null;
  }

  ngOnInit() {
    this.reset();
  }

  check() {
    this.results = this.items().map((item, i) =>
      item.expected.map((answer, g) => isCorrect(this.given[i][g], answer))
    );
  }

  evaluate() {
    this.isEvaluating.set(true);
    this.apiService
      .evaluateWriting(this.exercise().id, this.written)
      .pipe(
        first(),
        finalize(() => this.isEvaluating.set(false))
      )
      .subscribe({
        next: (evaluation) => this.evaluation.set(evaluation),
        error: (err) => this.dialog.error("Couldn't evaluate your answer", apiErrorMessage(err), () => this.evaluate()),
      });
  }

  reset() {
    this.given = this.items().map((item) => item.expected.map(() => ''));
    this.results = null;
  }
}
