// Client-side checking for the playable exercise types (fill_gap, choose_option).
// The expected answers come with the exercise payload from the content API.

import { formatValue, isRecord } from './content-format';

export const PLAYABLE_EXERCISE_TYPES = new Set(['fill_gap', 'choose_option']);

export interface FillGapItem {
  n: number;
  /** Text around the gaps: segments.length === answers.length + 1. */
  segments: string[];
  answers: string[];
  cue: string;
  response: string;
}

export interface ChooseOptionItem {
  n: number;
  /** Text before and after the {a/b} choice (or the whole text and ''). */
  before: string;
  after: string;
  options: string[];
  answer: string;
}

const GAP = /_{3,}/;
const CHOICE = /\{([^{}]*\/[^{}]*)\}/;

/** Trim, collapse spaces, lower-case, unify apostrophes, drop trailing .,!? */
export function normalizeAnswer(value: string): string {
  return value
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,!?]+$/, '')
    .trim()
    .toLowerCase();
}

/** True when the given answer matches any `|`-separated alternative. */
export function isCorrectAnswer(given: string, expected: string): boolean {
  const answer = normalizeAnswer(given);
  if (!answer) return false;
  return expected.split('|').some((alt) => normalizeAnswer(alt) === answer);
}

/** The first alternative, for showing the expected answer. */
export function primaryAnswer(expected: string): string {
  return expected.split('|')[0].trim();
}

function items(payload: Record<string, unknown> | null | undefined): Record<string, unknown>[] {
  const list = payload?.['items'];
  return Array.isArray(list) ? list.filter(isRecord) : [];
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

export function parseFillGap(
  payload: Record<string, unknown> | null | undefined
): FillGapItem[] {
  return items(payload).map((item, i) => {
    const text = formatValue(item['text']);
    const answers = Array.isArray(item['answers'])
      ? item['answers'].map(formatValue)
      : [];
    let segments = text.split(GAP);
    // No printed gap: put the single input after the text.
    if (segments.length === 1) segments = [text, ''];
    const gapCount = segments.length - 1;
    return {
      n: toNumber(item['n'], i + 1),
      segments,
      answers: Array.from({ length: gapCount }, (_, g) => answers[g] ?? ''),
      cue: formatValue(item['cue']),
      response: formatValue(item['response']),
    };
  });
}

export function parseChooseOption(
  payload: Record<string, unknown> | null | undefined
): ChooseOptionItem[] {
  return items(payload).map((item, i) => {
    const text = formatValue(item['text']);
    const match = CHOICE.exec(text);
    let options = Array.isArray(item['options'])
      ? item['options'].map(formatValue)
      : [];
    if (!options.length && match) {
      options = match[1].split('/').map((o) => o.trim());
    }
    return {
      n: toNumber(item['n'], i + 1),
      before: match ? text.slice(0, match.index) : text,
      after: match ? text.slice(match.index + match[0].length) : '',
      options,
      answer: formatValue(item['answer']),
    };
  });
}

/** Word bank printed with a fill_gap exercise, if any. */
export function wordBank(
  payload: Record<string, unknown> | null | undefined
): string[] {
  const options = payload?.['options'];
  return Array.isArray(options) ? options.map(formatValue) : [];
}
