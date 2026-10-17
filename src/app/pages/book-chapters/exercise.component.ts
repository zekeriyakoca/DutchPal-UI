import { Component, computed, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise } from '../../models/contentModels';

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

  playable = computed(() => ['fill_gap', 'choose_option'].includes(this.exercise().type));
  items = computed(() =>
    (this.exercise().payload.items ?? []).map((item) => {
      const parts = (item.text ?? item.q ?? '').split(GAP);
      if (parts.length === 1) parts.push('');
      return { ...item, parts, expected: item.answers ?? [item.answer ?? ''] };
    })
  );

  given: string[][] = [];
  results: boolean[][] | null = null;

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
