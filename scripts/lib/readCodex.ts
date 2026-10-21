import type { GlossaryEntry } from "@/core/glossary/types";

// Reads the glossary out of the Mage Wars Codex PDF, as `pdftohtml -xml` prints it: every
// run of text is a <text> tag with its position and font. Terms are the large bold runs that
// start a line, their definitions the body text that follows.

const TERM_SIZE = 15;
const BODY_SIZE = 12;
/** Terms start at the left margin; bold runs further right are blanks or references. */
const LINE_START_MAX_LEFT = 40;
/** Runs on one line differ a few points in top; a new line is a whole line height lower. */
const SAME_LINE_TOLERANCE = 4;

const TAG_PATTERN =
  /<fontspec id="(\d+)" size="(\d+)"[^>]*>|<text top="(\d+)" left="(\d+)"[^>]*font="(\d+)">(.*?)<\/text>/g;
const INNER_TAG_PATTERN = /<[^>]+>/g;
const WHITESPACE_PATTERN = /\s+/g;
const HYPHEN = "-";
/** The Codex prints a lowercase x as a capital, as in "teXt boX": an X touching a lowercase letter. */
const MISCASED_X_PATTERN = /(?<=[a-z])X|X(?=[a-z])/g;
const LOWERCASE_X = "x";

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};
const ENTITY_PATTERN = /&(amp|lt|gt|quot|apos|#39);/g;

interface Run {
  top: number;
  left: number;
  size: number;
  text: string;
}

interface Draft {
  term: string;
  termTop: number;
  termOpen: boolean;
  definition: string;
  lastTop: number;
}

const decode = (text: string): string =>
  text
    .replace(INNER_TAG_PATTERN, "")
    .replace(ENTITY_PATTERN, (entity) => ENTITIES[entity] ?? entity);

const tidy = (text: string): string =>
  text
    .replace(WHITESPACE_PATTERN, " ")
    .replace(MISCASED_X_PATTERN, LOWERCASE_X)
    .trim();

/** Every text run in document order, with the size of its font. */
const readRuns = (xml: string): Run[] => {
  const sizes = new Map<string, number>();
  const runs: Run[] = [];

  for (const match of xml.matchAll(TAG_PATTERN)) {
    const [, fontId, fontSize, top, left, font, content] = match;

    if (fontId !== undefined && fontSize !== undefined) {
      sizes.set(fontId, Number(fontSize));
      continue;
    }

    runs.push({
      top: Number(top),
      left: Number(left),
      size: sizes.get(font ?? "") ?? 0,
      text: decode(content ?? ""),
    });
  }

  return runs;
};

const isOnNewLine = (run: Run, draft: Draft): boolean =>
  Math.abs(run.top - draft.lastTop) > SAME_LINE_TOLERANCE;

const appendBody = (run: Run, draft: Draft): void => {
  // Smaller runs are superscripts, such as the "nd" of "2nd": they stick to the word before.
  const isBodyText = run.size >= BODY_SIZE;

  // A word broken with a hyphen at the end of a line goes on without a space, as "non-Flying".
  const endsInHyphen = draft.definition.endsWith(HYPHEN);

  draft.termOpen = false;

  if (isBodyText && isOnNewLine(run, draft) && !endsInHyphen) {
    draft.definition += " ";
  }

  draft.definition += run.text;

  if (isBodyText) {
    draft.lastTop = run.top;
  }
};

const toEntry = (draft: Draft): GlossaryEntry => ({
  term: tidy(draft.term),
  definition: tidy(draft.definition),
});

const isBlank = (run: Run): boolean => run.text.trim() === "";

/** A run in the term size: more of the term on its line, a new term, or a space. */
const readTermSizedRun = (run: Run, drafts: Draft[]): void => {
  const current = drafts.at(-1);
  const continuesTerm =
    current?.termOpen === true && run.top === current.termTop;
  const startsTerm = !isBlank(run) && run.left <= LINE_START_MAX_LEFT;

  if (current && continuesTerm) {
    current.term += run.text;

    return;
  }

  if (startsTerm) {
    drafts.push({
      term: run.text,
      termTop: run.top,
      termOpen: true,
      definition: "",
      lastTop: run.top,
    });

    return;
  }

  // A large blank run inside a definition is the space between two words.
  if (current) {
    current.definition += run.text;
  }
};

/** The glossary entries of the Codex, up to the first section heading after them. */
export const parseCodexXml = (xml: string): GlossaryEntry[] => {
  const drafts: Draft[] = [];

  for (const run of readRuns(xml)) {
    const current = drafts.at(-1);
    const isHeading = run.size > TERM_SIZE && !isBlank(run);

    if (isHeading) {
      break;
    }

    if (run.size === TERM_SIZE) {
      readTermSizedRun(run, drafts);
      continue;
    }

    if (current && run.size < TERM_SIZE) {
      appendBody(run, current);
    }
  }

  return drafts.map(toEntry).filter((entry) => entry.definition !== "");
};
