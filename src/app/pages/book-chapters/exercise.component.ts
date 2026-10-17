import { Component, computed, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../models/contentModels';
import { environment } from '../../../environments/environment';

// A gap is `___` (fill_gap) or `{a/b}` (choose_option).
const GAP = /_{3,}|\{[^{}]*\}/;

/** Compares trimmed and case-insensitive, ignoring trailing .,!?; `expected` may hold `|`-separated alternatives. */
export function isCorrect(given: string, expected: string): boolean {
  const normalize = (s: string) => s.trim().replace(/[.,!?]+$/, '').toLowerCase();
  const answer = normalize(given);
  return answer !== '' && expected.split('|').some((alt) => normalize(alt) === answer);
}

@Component({
  selector: 'app-exercise',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './exercise.component.html',
})
export class ExerciseComponent implements OnInit {
  exercise = input.required<Exercise>();

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
  showAssessment = false;

  mediaUrl(path: string) {
    return `${environment.apiUrl}/media/${encodeURI(path)}`;
  }

  get score() {
    const all = this.results!.flat();
    return `${all.filter(Boolean).length} / ${all.length}`;
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
