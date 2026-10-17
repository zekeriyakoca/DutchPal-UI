import { exerciseText } from './content-format';

describe('exerciseText', () => {
  it('returns the reading text with title and source', () => {
    expect(exerciseText({ title: 'Een tekst', text: 'Lees dit.', source: 'Bron: test' })).toEqual({
      title: 'Een tekst',
      text: 'Lees dit.',
      source: 'Bron: test',
    });
  });

  it('falls back to source_text', () => {
    expect(exerciseText({ source_text: 'Beste Piet,' })?.text).toBe('Beste Piet,');
  });

  it('returns null when the exercise prints no text', () => {
    expect(exerciseText({ items: [{ text: 'Ik ___ hier.' }] })).toBeNull();
    expect(exerciseText(null)).toBeNull();
  });
});
