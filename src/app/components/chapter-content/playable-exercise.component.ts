import { Component, computed, input, signal } from '@angular/core';
import {
  ContentExercise,
  GENERATED_ANSWERS_SOURCE,
} from '../../models/contentModels';
import {
  isCorrectAnswer,
  parseChooseOption,
  parseFillGap,
  primaryAnswer,
  wordBank,
} from './exercise-check';

/** A fill_gap or choose_option exercise the learner can answer and check. */
@Component({
  selector: 'app-playable-exercise',
  standalone: true,
  templateUrl: './playable-exercise.component.html',
})
export class PlayableExerciseComponent {
  exercise = input.required<ContentExercise>();

  readonly primaryAnswer = primaryAnswer;

  fillItems = computed(() =>
    this.exercise().type === 'fill_gap' ? parseFillGap(this.exercise().payload) : []
  );
  chooseItems = computed(() =>
    this.exercise().type === 'choose_option'
      ? parseChooseOption(this.exercise().payload)
      : []
  );
  bank = computed(() => wordBank(this.exercise().payload));
  generated = computed(
    () => this.exercise().answers_source === GENERATED_ANSWERS_SOURCE
  );

  /** Typed gap answers keyed by "item-gap", chosen options keyed by item. */
  typed = signal<Partial<Record<string, string>>>({});
  chosen = signal<Partial<Record<number, string>>>({});
  checked = signal(false);

  fillResults = computed(() =>
    this.fillItems().map((item, i) =>
      item.answers.map((answer, g) =>
        isCorrectAnswer(this.typed()[`${i}-${g}`] ?? '', answer)
      )
    )
  );
  chooseResults = computed(() =>
    this.chooseItems().map((item, i) =>
      isCorrectAnswer(this.chosen()[i] ?? '', item.answer)
    )
  );
  score = computed(() => {
    const results = [...this.fillResults().flat(), ...this.chooseResults()];
    return { correct: results.filter(Boolean).length, total: results.length };
  });

  setGap(item: number, gap: number, value: string) {
    this.typed.update((t) => ({ ...t, [`${item}-${gap}`]: value }));
  }

  choose(item: number, option: string) {
    if (this.checked()) return;
    this.chosen.update((c) => ({ ...c, [item]: option }));
  }

  check() {
    this.checked.set(true);
  }

  reset() {
    this.typed.set({});
    this.chosen.set({});
    this.checked.set(false);
  }

  /** Gap width from the expected answer, so long answers fit. */
  gapWidth(answer: string): number {
    return Math.max(5, primaryAnswer(answer).length + 2);
  }
}
