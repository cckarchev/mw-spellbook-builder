import type { GlossaryEntry } from './types';

/** A piece of card text: a glossary term with its entry, or plain text with none. */
export interface TextSegment {
  text: string;
  entry: GlossaryEntry | null;
}

export interface GlossaryIndexOptions {
  /** Extra names by term, written like terms: "Flame +X" for "Damage Type +/- X". */
  aliases?: Readonly<Record<string, readonly string[]>>;
  /** Terms that only count with a capital, such as "Attack", the spell type, over "attacks". */
  capitalizedOnly?: readonly string[];
}

interface IndexedForm {
  entry: GlossaryEntry;
  capitalizedOnly: boolean;
}

export interface GlossaryIndex {
  pattern: RegExp;
  /** The form behind each capture group in the pattern, in order. */
  forms: IndexedForm[];
}

interface TermForm extends IndexedForm {
  /** The words to look for, such as "Aegis" for "Aegis X". */
  name: string;
  /** Whether a number or X follows, as in "Aegis 2" or "Melee +X". */
  takesNumber: boolean;
}

// "Bloodreaper (Warlock)" names a mage; "Line of Sight (LoS)" gives a short form.
const PARENTHESES_PATTERN = /^(.+?)\s*\(([^)]+)\)$/;
// A short form is one word with a capital after its first letter, such as "LoS".
const SHORT_FORM_PATTERN = /^[A-Za-z][A-Za-z]*[A-Z][A-Za-z]*$/;
// "Aegis X", "Melee +X", "Tough -X" and "Armor +/- X".
const NUMBER_SUFFIX_PATTERN = /\s+(?:\+\/-\s*|[+-])?X$/;
const REGEX_SPECIAL_PATTERN = /[.*+?^${}()|[\]\\]/g;
const SPACES_PATTERN = /\s+/g;
const APOSTROPHES_PATTERN = /['’]/g;

const NUMBER_SOURCE = String.raw`\s+[+-]?(?:\d+|X)`;
const PLURAL_SOURCE = '(?:e?s)?';
const SPACES_SOURCE = String.raw`\s+`;
const APOSTROPHE_SOURCE = "['’]";
const WORD_START_SOURCE = String.raw`(?<![\p{L}\p{N}])`;
const WORD_END_SOURCE = String.raw`(?![\p{L}\p{N}])`;
const PATTERN_FLAGS = 'giu';

/** The names a term goes by: its own, without a mage in parentheses, plus any short form. */
const namesOf = (term: string): string[] => {
  const parentheses = PARENTHESES_PATTERN.exec(term);

  if (!parentheses) {
    return [term];
  }

  const [, name = term, inside = ''] = parentheses;

  if (SHORT_FORM_PATTERN.test(inside)) {
    return [name, inside];
  }

  return [name];
};

const formsOf = (entry: GlossaryEntry, options: GlossaryIndexOptions): TermForm[] => {
  const aliases = options.aliases?.[entry.term] ?? [];
  const capitalizedOnly = options.capitalizedOnly?.includes(entry.term) ?? false;

  return [...namesOf(entry.term), ...aliases].map((name) => {
    const takesNumber = NUMBER_SUFFIX_PATTERN.test(name);

    return {
      entry,
      capitalizedOnly,
      name: name.replace(NUMBER_SUFFIX_PATTERN, ''),
      takesNumber,
    };
  });
};

const nameSource = (name: string): string =>
  name
    .replace(REGEX_SPECIAL_PATTERN, String.raw`\$&`)
    .replace(SPACES_PATTERN, SPACES_SOURCE)
    .replace(APOSTROPHES_PATTERN, APOSTROPHE_SOURCE);

const formSource = (form: TermForm): string => {
  const suffix = form.takesNumber ? NUMBER_SOURCE : PLURAL_SOURCE;

  return `(${nameSource(form.name)}${suffix})`;
};

/**
 * Longest name first, since the pattern takes the first alternative that matches. On the same
 * name the numbered form goes first, so "Armor +2" reaches "Armor +/- X" before "Armor".
 */
const byPriority = (a: TermForm, b: TermForm): number => {
  const byLength = b.name.length - a.name.length;

  if (byLength !== 0) {
    return byLength;
  }

  return Number(b.takesNumber) - Number(a.takesNumber);
};

/** Compiles the glossary once into a single pattern. A repeated term keeps its first entry. */
export const buildGlossaryIndex = (
  glossary: readonly GlossaryEntry[],
  options: GlossaryIndexOptions = {},
): GlossaryIndex => {
  const seenTerms = new Set<string>();
  const uniqueEntries = glossary.filter((entry) => {
    const isNew = !seenTerms.has(entry.term);

    seenTerms.add(entry.term);

    return isNew;
  });
  const forms = uniqueEntries.flatMap((entry) => formsOf(entry, options)).sort(byPriority);
  const alternatives = forms.map(formSource).join('|');
  const source = `${WORD_START_SOURCE}(?:${alternatives})${WORD_END_SOURCE}`;

  return {
    pattern: new RegExp(source, PATTERN_FLAGS),
    forms: forms.map(({ entry, capitalizedOnly }) => ({ entry, capitalizedOnly })),
  };
};

const startsLowercase = (text: string): boolean => {
  const first = text.charAt(0);

  return first !== first.toUpperCase();
};

/** The entry a match stands for, or null when it is a capitalized-only term in lowercase. */
const entryOf = (match: RegExpMatchArray, index: GlossaryIndex): GlossaryEntry | null => {
  const groups = match.slice(1);
  const groupIndex = groups.findIndex((group) => group !== undefined);
  const form = index.forms[groupIndex];

  if (!form || (form.capitalizedOnly && startsLowercase(match[0]))) {
    return null;
  }

  return form.entry;
};

/** Splits a text into plain parts and glossary terms, in order, keeping every character. */
export const splitByTerms = (text: string, index: GlossaryIndex): TextSegment[] => {
  const segments: TextSegment[] = [];
  let position = 0;

  for (const match of text.matchAll(index.pattern)) {
    const start = match.index;
    const matched = match[0];
    const entry = entryOf(match, index);

    // Left for the plain text around it.
    if (entry === null) {
      continue;
    }

    if (start > position) {
      segments.push({ text: text.slice(position, start), entry: null });
    }

    segments.push({ text: matched, entry });
    position = start + matched.length;
  }

  if (position < text.length) {
    segments.push({ text: text.slice(position), entry: null });
  }

  return segments;
};
