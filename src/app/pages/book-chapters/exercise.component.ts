import { Component, computed, input, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from 'ngx-markdown';
import { Exercise } from '../../models/contentModels';
import { environment } from '../../../environments/environment';

// A gap is `___` (fill_gap) or `{a/b}` (choose_option).
const GAP = /_{3,}|\{[^{}]*\}/;
// Reading texts are light Markdown where a single newline is a line break (addresses).
const TEXT_MARKDOWN = { markedOptions: { breaks: true } };

/** Compares trimmed and case-insensitive, ignoring trailing .,!?; `expected` may hold `|`-separated alternatives. */
export function isCorrect(given: string, expected: string): boolean {
  const normalize = (s: string) => s.trim().replace(/[.,!?]+$/, '').toLowerCase();
  const answer = normalize(given);
  return answer !== '' && expected.split('|').some((alt) => normalize(alt) === answer);
}

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [AsyncPipe, FormsModule, MarkdownPipe],
  templateUrl: './exercise.component.html',
})
export class ExerciseComponent implements OnInit {
  exercise = input.required<Exercise>();
  // Exam mode: no checking and no assessment until the attempt is finished.
  locked = input(false);
  readonly textMarkdown = TEXT_MARKDOWN;

  // Exam-style multiple choice: every question has options and an answer `a`.
  multipleChoice = computed(() => {
    const { type, payload } = this.exercise();
    const items = payload.items ?? [];
    return ['reading', 'listening'].includes(type) && items.length > 0 && items.every((i) => i.options?.length && i.a);
  });
  playable = computed(() => this.multipleChoice() || ['fill_gap', 'choose_option'].includes(this.exercise().type));
  assessed = computed(() => ['writing', 'speaking'].includes(this.exercise().type));
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

  reset() {
    this.given = this.items().map((item) => item.expected.map(() => ''));
    this.results = null;
  }
}
