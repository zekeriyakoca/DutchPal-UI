import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrammarTopicComponent } from './grammar-topic.component';
import { GrammarTopic } from '../../models/contentModels';
import { toGrammarBlocks } from './content-format';

// Synthetic fixtures: never use real book text here (the books are copyrighted).
const TOPIC: GrammarTopic = {
  id: 1,
  title: 'Test topic',
  book_page: 12,
  content: {
    examples: ['voorbeeld een', { nl: 'voorbeeld twee', en: 'example two' }],
    table: { columns: ['col a', 'col b'], rows: [['a1', 'b1'], { 'col a': 'a2', 'col b': 'b2' }] },
    pairs: [{ q: 'vraag?', a: 'antwoord.' }],
    note: 'Een testnotitie.',
    mystery: { nested: [1, 2] },
  },
};

describe('toGrammarBlocks', () => {
  it('keeps key order and maps known keys to block kinds', () => {
    const blocks = toGrammarBlocks(TOPIC.content);
    expect(blocks.map((b) => b.kind)).toEqual([
      'list',
      'table',
      'pairs',
      'note',
      'json',
    ]);
  });

  it('formats object list items and object table rows', () => {
    const [list, table] = toGrammarBlocks(TOPIC.content);
    expect(list).toEqual({
      kind: 'list',
      key: 'examples',
      items: ['voorbeeld een', 'voorbeeld twee — example two'],
    });
    expect(table).toEqual({
      kind: 'table',
      key: 'table',
      columns: ['col a', 'col b'],
      rows: [
        ['a1', 'b1'],
        ['a2', 'b2'],
      ],
    });
  });

  it('turns a conjugation into a table with one column per verb', () => {
    const [block] = toGrammarBlocks({
      conjugation: {
        verbs: ['testen', 'proberen'],
        rows: [{ pronoun: 'ik', forms: ['test', 'probeer'] }],
      },
    });
    expect(block).toEqual({
      kind: 'table',
      key: 'conjugation',
      columns: ['', 'testen', 'proberen'],
      rows: [['ik', 'test', 'probeer']],
    });
  });

  it('falls back to JSON for unknown keys and malformed known keys', () => {
    const blocks = toGrammarBlocks({ table: 'not a table', other: 5 });
    expect(blocks.map((b) => b.kind)).toEqual(['json', 'json']);
  });

  it('handles empty, string and array content', () => {
    expect(toGrammarBlocks(null)).toEqual([]);
    expect(toGrammarBlocks('tekst')[0].kind).toBe('note');
    expect(toGrammarBlocks(['x', 'y'])[0]).toEqual({
      kind: 'list',
      key: 'items',
      items: ['x', 'y'],
    });
  });
});

describe('GrammarTopicComponent', () => {
  let fixture: ComponentFixture<GrammarTopicComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GrammarTopicComponent] });
    fixture = TestBed.createComponent(GrammarTopicComponent);
    fixture.componentRef.setInput('topic', TOPIC);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('renders the title and book page', () => {
    expect(el.querySelector('h4')?.textContent?.trim()).toBe('Test topic');
    expect(el.textContent).toContain('p. 12');
  });

  it('renders examples as a list', () => {
    const items = Array.from(el.querySelectorAll('.grammar-list li')).map((li) =>
      li.textContent?.trim()
    );
    expect(items).toEqual(['voorbeeld een', 'voorbeeld twee — example two']);
  });

  it('renders the table with headers and rows', () => {
    const table = el.querySelector('table.grammar-table')!;
    const headers = Array.from(table.querySelectorAll('th')).map((th) =>
      th.textContent?.trim()
    );
    expect(headers).toEqual(['col a', 'col b']);
    expect(table.querySelectorAll('tbody tr').length).toBe(2);
    expect(table.querySelector('tbody tr:last-child td')?.textContent?.trim()).toBe('a2');
  });

  it('renders pairs as question/answer rows', () => {
    const pair = el.querySelector('.grammar-pairs')!;
    expect(pair.querySelector('dt')?.textContent?.trim()).toBe('vraag?');
    expect(pair.querySelector('dd')?.textContent?.trim()).toBe('antwoord.');
  });

  it('renders the note as text', () => {
    expect(el.querySelector('.grammar-note')?.textContent?.trim()).toBe(
      'Een testnotitie.'
    );
  });

  it('shows unknown keys in a collapsed JSON view', () => {
    const details = el.querySelector('details.grammar-json') as HTMLDetailsElement;
    expect(details).toBeTruthy();
    expect(details.open).toBeFalse();
    expect(details.querySelector('summary')?.textContent?.trim()).toBe('mystery');
    expect(JSON.parse(details.querySelector('pre')!.textContent!)).toEqual({
      nested: [1, 2],
    });
  });
});
