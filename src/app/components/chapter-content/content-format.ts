// Helpers that turn the free-form JSON parts of a chapter (grammar content,
// exercise payloads, culture boxes) into simple, renderable shapes.

export type GrammarBlock =
  | { kind: 'list'; key: string; items: string[] }
  | { kind: 'table'; key: string; columns: string[]; rows: string[][] }
  | { kind: 'pairs'; key: string; pairs: { q: string; a: string }[] }
  | { kind: 'note'; key: string; paragraphs: string[] }
  | { kind: 'json'; key: string; json: string };

const LIST_KEYS = new Set([
  'examples',
  'phrases',
  'highlight',
  'months',
  'seasons',
  'responses',
]);

const NOTE_KEYS = new Set(['note', 'notes', 'text', 'explanation']);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** One readable line for a primitive or a small object, e.g. {nl, en} -> "nl — en". */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  const parts = Object.values(value)
    .filter((v) => v !== null && v !== undefined && typeof v !== 'object')
    .map(String);
  return parts.length ? parts.join(' — ') : JSON.stringify(value);
}

function toJson(key: string, value: unknown): GrammarBlock {
  return { kind: 'json', key, json: JSON.stringify(value, null, 2) };
}

function toTable(key: string, value: unknown): GrammarBlock {
  if (
    !isRecord(value) ||
    !Array.isArray(value['columns']) ||
    !Array.isArray(value['rows'])
  ) {
    return toJson(key, value);
  }
  const columns = value['columns'].map(formatValue);
  const rows = value['rows'].map((row) => {
    if (Array.isArray(row)) return row.map(formatValue);
    if (isRecord(row)) return columns.map((c) => formatValue(row[c]));
    return [formatValue(row)];
  });
  return { kind: 'table', key, columns, rows };
}

function toPairs(key: string, value: unknown): GrammarBlock {
  if (!Array.isArray(value) || !value.every(isRecord)) {
    return toJson(key, value);
  }
  return {
    kind: 'pairs',
    key,
    pairs: value.map((p) => ({ q: formatValue(p['q']), a: formatValue(p['a']) })),
  };
}

/** conjugation {verbs, rows [{pronoun, forms}]} -> a table with one column per verb. */
function toConjugation(key: string, value: unknown): GrammarBlock {
  if (!isRecord(value) || !Array.isArray(value['rows'])) {
    return toJson(key, value);
  }
  const verbs = Array.isArray(value['verbs'])
    ? value['verbs'].map(formatValue)
    : [];
  const rows = value['rows'].map((row) => {
    if (!isRecord(row)) return [formatValue(row)];
    const forms = Array.isArray(row['forms'])
      ? row['forms'].map(formatValue)
      : [formatValue(row['forms'])];
    return [formatValue(row['pronoun']), ...forms];
  });
  return { kind: 'table', key, columns: ['', ...verbs], rows };
}

/** Splits grammar content into blocks in the order its keys appear. */
export function toGrammarBlocks(content: unknown): GrammarBlock[] {
  if (content === null || content === undefined) return [];
  if (typeof content === 'string') {
    return [{ kind: 'note', key: 'note', paragraphs: [content] }];
  }
  if (Array.isArray(content)) {
    return [{ kind: 'list', key: 'items', items: content.map(formatValue) }];
  }
  if (!isRecord(content)) return [toJson('content', content)];

  const blocks: GrammarBlock[] = [];
  for (const [key, value] of Object.entries(content)) {
    if (value === null || value === undefined) continue;
    if (LIST_KEYS.has(key) && Array.isArray(value)) {
      blocks.push({ kind: 'list', key, items: value.map(formatValue) });
    } else if (key === 'table') {
      blocks.push(toTable(key, value));
    } else if (key === 'pairs') {
      blocks.push(toPairs(key, value));
    } else if (key === 'conjugation') {
      blocks.push(toConjugation(key, value));
    } else if (NOTE_KEYS.has(key) && typeof value === 'string') {
      blocks.push({ kind: 'note', key, paragraphs: [value] });
    } else if (
      NOTE_KEYS.has(key) &&
      Array.isArray(value) &&
      value.every((v) => typeof v === 'string')
    ) {
      blocks.push({ kind: 'note', key, paragraphs: value });
    } else {
      blocks.push(toJson(key, value));
    }
  }
  return blocks;
}

/** The printed prompts of an exercise (items or prompts), without answers. */
export function exercisePrompts(
  payload: Record<string, unknown> | null | undefined
): string[] {
  if (!payload) return [];
  const source = Array.isArray(payload['items'])
    ? payload['items']
    : Array.isArray(payload['prompts'])
    ? payload['prompts']
    : [];
  return source
    .map((item) => {
      if (!isRecord(item)) return formatValue(item);
      const prompt =
        item['text'] ?? item['q'] ?? item['word'] ?? item['cue'] ?? item['prompt'];
      return prompt !== undefined ? formatValue(prompt) : '';
    })
    .filter((p) => p.length > 0);
}

/** Culture boxes may be plain strings or {title, text}-like objects. */
export function cultureText(box: unknown): { title: string; text: string } {
  if (!isRecord(box)) return { title: '', text: formatValue(box) };
  const title = formatValue(box['title'] ?? '');
  const body = box['text'] ?? box['content'] ?? box['body'];
  if (body !== undefined) {
    const text = Array.isArray(body)
      ? body.map(formatValue).join('\n')
      : formatValue(body);
    return { title, text };
  }
  const { title: _ignored, ...rest } = box;
  return { title, text: formatValue(rest) };
}
