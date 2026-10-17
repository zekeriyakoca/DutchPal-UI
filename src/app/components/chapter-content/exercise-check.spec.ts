import {
  isCorrectAnswer,
  normalizeAnswer,
  parseChooseOption,
  parseFillGap,
  primaryAnswer,
  wordBank,
} from './exercise-check';

// Synthetic fixtures: never use real book text here (the books are copyrighted).

describe('normalizeAnswer', () => {
  it('trims, collapses spaces and lower-cases', () => {
    expect(normalizeAnswer('  Een   Test  ')).toBe('een test');
  });

  it('ignores trailing punctuation', () => {
    expect(normalizeAnswer('klaar.')).toBe('klaar');
    expect(normalizeAnswer('klaar?!')).toBe('klaar');
    expect(normalizeAnswer('klaar ,')).toBe('klaar');
  });

  it('treats curly and straight apostrophes the same', () => {
    expect(normalizeAnswer('zo’n')).toBe("zo'n");
    expect(normalizeAnswer('‘s avonds')).toBe("'s avonds");
  });
});

describe('isCorrectAnswer', () => {
  it('accepts any | alternative', () => {
    expect(isCorrectAnswer('ze', 'Zij|Ze')).toBeTrue();
    expect(isCorrectAnswer('Zij', 'Zij|Ze')).toBeTrue();
    expect(isCorrectAnswer('wij', 'Zij|Ze')).toBeFalse();
  });

  it('normalises both sides', () => {
    expect(isCorrectAnswer(' zo’n  ding! ', "Zo'n ding")).toBeTrue();
    expect(isCorrectAnswer('test', ' Test. | proef')).toBeTrue();
  });

  it('never accepts an empty answer', () => {
    expect(isCorrectAnswer('', 'test')).toBeFalse();
    expect(isCorrectAnswer('  ', '')).toBeFalse();
  });

  it('does not accept partial matches', () => {
    expect(isCorrectAnswer('tes', 'test')).toBeFalse();
    expect(isCorrectAnswer('test test', 'test')).toBeFalse();
  });
});

describe('primaryAnswer', () => {
  it('returns the first alternative', () => {
    expect(primaryAnswer('Zij|Ze')).toBe('Zij');
    expect(primaryAnswer('test')).toBe('test');
  });
});

describe('parseFillGap', () => {
  it('splits multi-gap items into segments with one answer per gap', () => {
    const [item] = parseFillGap({
      items: [{ n: 3, text: 'Aa ___ bb ___.', answers: ['x', 'y|z'], cue: 'hint' }],
    });
    expect(item.n).toBe(3);
    expect(item.segments).toEqual(['Aa ', ' bb ', '.']);
    expect(item.answers).toEqual(['x', 'y|z']);
    expect(item.cue).toBe('hint');
    expect(item.response).toBe('');
  });

  it('checks each gap of a multi-gap item on its own', () => {
    const [item] = parseFillGap({
      items: [{ n: 1, text: '___ en ___', answers: ['een', 'twee|2'] }],
    });
    const given = ['Een', '2'];
    expect(item.answers.map((a, g) => isCorrectAnswer(given[g], a))).toEqual([
      true,
      true,
    ]);
    expect(isCorrectAnswer('twee', item.answers[0])).toBeFalse();
  });

  it('adds one gap after the text when none is printed', () => {
    const [item] = parseFillGap({ items: [{ n: 1, text: 'Vraag?', answers: ['a'] }] });
    expect(item.segments).toEqual(['Vraag?', '']);
    expect(item.answers).toEqual(['a']);
  });

  it('reads the word bank', () => {
    expect(wordBank({ options: ['a', 'b'] })).toEqual(['a', 'b']);
    expect(wordBank({})).toEqual([]);
    expect(wordBank(null)).toEqual([]);
  });
});

describe('parseChooseOption', () => {
  it('replaces the {a/b} braces with the options', () => {
    const [item] = parseChooseOption({
      items: [{ n: 2, text: 'Ik {x/y} hier.', options: ['x', 'y'], answer: 'y' }],
    });
    expect(item).toEqual({
      n: 2,
      before: 'Ik ',
      after: ' hier.',
      options: ['x', 'y'],
      answer: 'y',
    });
  });

  it('derives the options from the braces when they are missing', () => {
    const [item] = parseChooseOption({
      items: [{ n: 1, text: '{een / twee} keer', answer: 'een' }],
    });
    expect(item.options).toEqual(['een', 'twee']);
    expect(item.before).toBe('');
    expect(item.after).toBe(' keer');
  });

  it('keeps the whole text when there are no braces', () => {
    const [item] = parseChooseOption({
      items: [{ n: 1, text: 'Kies.', options: ['a', 'b'], answer: 'a' }],
    });
    expect(item.before).toBe('Kies.');
    expect(item.after).toBe('');
  });
});
