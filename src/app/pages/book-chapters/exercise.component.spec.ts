import { isCorrect } from './exercise.component';

describe('isCorrect', () => {
  it('ignores case, surrounding spaces and trailing punctuation', () => {
    expect(isCorrect('  Ben. ', 'ben')).toBeTrue();
    expect(isCorrect('ben', 'Ben!')).toBeTrue();
  });

  it('accepts any |-separated alternative', () => {
    expect(isCorrect('ze', 'Zij|Ze')).toBeTrue();
    expect(isCorrect('hij', 'Zij|Ze')).toBeFalse();
  });

  it('rejects an empty answer', () => {
    expect(isCorrect('', '')).toBeFalse();
    expect(isCorrect(' ', 'ben')).toBeFalse();
  });
});
