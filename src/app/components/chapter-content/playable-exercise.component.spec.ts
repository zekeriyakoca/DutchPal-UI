import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayableExerciseComponent } from './playable-exercise.component';
import { ContentExercise } from '../../models/contentModels';

// Synthetic fixtures: never use real book text here (the books are copyrighted).
const FILL_GAP: ContentExercise = {
  id: 1,
  label: 'Test 1',
  type: 'fill_gap',
  instruction: 'Vul in.',
  book_page: 1,
  answers_source: 'generated_needs_review',
  payload: {
    options: ['aap', 'noot', 'mies'],
    items: [
      { n: 1, text: 'Een ___ en een ___.', answers: ['aap', 'noot|Noten'] },
      { n: 2, text: 'De ___ slaapt.', answers: ['mies'], cue: 'kat' },
    ],
  },
};

const CHOOSE_OPTION: ContentExercise = {
  id: 2,
  label: 'Test 2',
  type: 'choose_option',
  instruction: 'Kies.',
  book_page: 2,
  answers_source: 'book',
  payload: {
    items: [
      { n: 1, text: 'Ik {loop/fiets} graag.', options: ['loop', 'fiets'], answer: 'fiets' },
      { n: 2, text: 'Het is {koud/warm}.', options: ['koud', 'warm'], answer: 'koud' },
    ],
  },
};

describe('PlayableExerciseComponent', () => {
  let fixture: ComponentFixture<PlayableExerciseComponent>;
  let el: HTMLElement;

  function render(exercise: ContentExercise) {
    TestBed.configureTestingModule({ imports: [PlayableExerciseComponent] });
    fixture = TestBed.createComponent(PlayableExerciseComponent);
    el = fixture.nativeElement;
    fixture.componentRef.setInput('exercise', exercise);
    fixture.detectChanges();
  }

  function button(label: string): HTMLButtonElement {
    return Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === label
    )!;
  }

  function click(label: string) {
    button(label).click();
    fixture.detectChanges();
  }

  function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  describe('fill_gap', () => {
    beforeEach(() => render(FILL_GAP));

    it('renders one input per gap, the cue and the word bank, without answers', () => {
      expect(el.querySelectorAll('.gap-input').length).toBe(3);
      expect(el.textContent).toContain('(kat)');
      const chips = Array.from(el.querySelectorAll('.word-bank-chip')).map((c) =>
        c.textContent?.trim()
      );
      expect(chips).toEqual(['aap', 'noot', 'mies']);
      expect(el.querySelector('.expected-answer')).toBeNull();
      expect(el.querySelector('.score')).toBeNull();
    });

    it('marks each gap, shows expected answers for wrong ones and the score', () => {
      const inputs = el.querySelectorAll<HTMLInputElement>('.gap-input');
      type(inputs[0], ' Aap ');
      type(inputs[1], 'noten.');
      type(inputs[2], 'muis');
      click('Controleer');

      expect(inputs[0].classList).toContain('is-correct');
      expect(inputs[1].classList).toContain('is-correct');
      expect(inputs[2].classList).toContain('is-wrong');
      const expected = Array.from(el.querySelectorAll('.expected-answer')).map((e) =>
        e.textContent?.trim()
      );
      expect(expected).toEqual(['mies']);
      expect(el.querySelector('.score')?.textContent?.trim()).toBe('2 / 3');
      expect(inputs[0].readOnly).toBeTrue();
    });

    it('resets with Opnieuw', () => {
      const inputs = el.querySelectorAll<HTMLInputElement>('.gap-input');
      type(inputs[0], 'aap');
      click('Controleer');
      click('Opnieuw');

      const after = el.querySelectorAll<HTMLInputElement>('.gap-input');
      expect(Array.from(after).map((i) => i.value)).toEqual(['', '', '']);
      expect(el.querySelector('.is-correct, .is-wrong, .score')).toBeNull();
      expect(button('Controleer')).toBeTruthy();
    });

    it('notes that generated answers may be wrong', () => {
      expect(el.querySelector('.generated-note')?.textContent).toContain(
        'not printed in the book'
      );
    });
  });

  describe('choose_option', () => {
    beforeEach(() => render(CHOOSE_OPTION));

    it('renders the options instead of the braces', () => {
      expect(el.textContent).not.toContain('{');
      expect(el.querySelectorAll('.option-button').length).toBe(4);
      expect(el.textContent).toContain('graag.');
      expect(el.querySelector('.generated-note')).toBeNull();
    });

    it('marks the chosen options and shows the score', () => {
      click('fiets');
      click('warm');
      expect(button('fiets').getAttribute('aria-pressed')).toBe('true');
      click('Controleer');

      expect(button('fiets').classList).toContain('is-correct');
      expect(button('warm').classList).toContain('is-wrong');
      expect(el.querySelector('.expected-answer')?.textContent?.trim()).toBe('koud');
      expect(el.querySelector('.score')?.textContent?.trim()).toBe('1 / 2');
      expect(button('loop').disabled).toBeTrue();
    });

    it('counts unanswered items as wrong and resets', () => {
      click('Controleer');
      expect(el.querySelector('.score')?.textContent?.trim()).toBe('0 / 2');
      expect(el.querySelectorAll('.expected-answer').length).toBe(2);

      click('Opnieuw');
      expect(el.querySelector('.score')).toBeNull();
      expect(el.querySelector('.selected')).toBeNull();
    });
  });
});
