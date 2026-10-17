import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogueViewComponent } from './dialogue-view.component';
import { ContentDialogue } from '../../models/contentModels';

// Synthetic fixture: never use real book text here (the books are copyrighted).
const DIALOGUE: ContentDialogue = {
  id: 1,
  title: 'Test dialogue',
  audio_tracks: ['9-9'],
  lines: [
    { speaker: 'Anna', text: 'Dit is een testzin.' },
    { speaker: '›', text: 'Tweede testzin.' },
    { speaker: '»', text: 'Derde testzin.' },
    { speaker: null, text: '(even later)', stage: true },
    { speaker: null, text: 'Een verhalende alinea.', narration: true },
  ],
  new_words: ['testwoord', 'proefwoord'],
};

describe('DialogueViewComponent', () => {
  let fixture: ComponentFixture<DialogueViewComponent>;
  let el: HTMLElement;

  function render(dialogue: ContentDialogue) {
    fixture.componentRef.setInput('dialogue', dialogue);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogueViewComponent] });
    fixture = TestBed.createComponent(DialogueViewComponent);
    el = fixture.nativeElement;
  });

  it('renders spoken lines with their speaker label, including symbol speakers', () => {
    render(DIALOGUE);
    const lines = el.querySelectorAll('.dialogue-line');
    expect(lines.length).toBe(3);
    const speakers = Array.from(el.querySelectorAll('.dialogue-speaker')).map(
      (s) => s.textContent?.trim()
    );
    expect(speakers).toEqual(['Anna', '›', '»']);
    expect(lines[0].textContent).toContain('Dit is een testzin.');
  });

  it('renders stage directions in italics without a speaker', () => {
    render(DIALOGUE);
    const stage = el.querySelectorAll('.dialogue-stage');
    expect(stage.length).toBe(1);
    expect(stage[0].classList).toContain('italic');
    expect(stage[0].textContent?.trim()).toBe('(even later)');
  });

  it('renders narration as a plain paragraph', () => {
    render(DIALOGUE);
    const narration = el.querySelectorAll('p.dialogue-narration');
    expect(narration.length).toBe(1);
    expect(narration[0].classList).not.toContain('italic');
    expect(narration[0].textContent?.trim()).toBe('Een verhalende alinea.');
  });

  it('renders new words as chips and the audio tracks', () => {
    render(DIALOGUE);
    const chips = Array.from(el.querySelectorAll('.new-word-chip')).map((c) =>
      c.textContent?.trim()
    );
    expect(chips).toEqual(['testwoord', 'proefwoord']);
    expect(el.textContent).toContain('Audio: 9-9');
  });

  it('omits the new words block when there are none', () => {
    render({ ...DIALOGUE, new_words: [], audio_tracks: [], title: null });
    expect(el.querySelectorAll('.new-word-chip').length).toBe(0);
    expect(el.textContent).not.toContain('New words');
    expect(el.textContent).not.toContain('Audio');
  });
});
