import { type Book, SCHOOLS, type School } from '@/core/rules/types';
import { cardsByCode, cardsById, magesById } from '@/data/catalog';
import { fromBase64Url, toBase64Url } from './base64Url';

// Wire format: base64url JSON of { v: 1, m: mageId, s: schoolChoice, c: { [cardCode]: qty } }.
// Card codes (8 hex chars) keep links short; quantities are kept as sent so validation
// can report a hand-edited count above the copy limit.

const WIRE_VERSION = 1;

interface Wire {
  v: number;
  m?: string;
  s?: string;
  c: Record<string, number>;
}

export interface DecodedBook {
  book: Book;
  /** Codes in the link that match no card, such as cards removed from the data. */
  unknownCodes: string[];
}

export const encodeBook = (book: Book): string => {
  const counts: Record<string, number> = {};

  for (const [cardId, quantity] of Object.entries(book.counts)) {
    const code = cardsById.get(cardId)?.code;

    if (code) {
      counts[code] = quantity;
    }
  }

  const wire: Wire = {
    v: WIRE_VERSION,
    m: book.mageId ?? undefined,
    s: book.schoolChoice ?? undefined,
    c: counts,
  };

  return toBase64Url(JSON.stringify(wire));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseWire = (encoded: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const isSchool = (value: unknown): value is School =>
  typeof value === 'string' && (SCHOOLS as readonly string[]).includes(value);

const isQuantity = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

interface DecodedCounts {
  counts: Book['counts'];
  unknownCodes: string[];
}

const decodeCounts = (wireCounts: Record<string, unknown>): DecodedCounts => {
  const counts: Book['counts'] = {};
  const unknownCodes: string[] = [];

  for (const [code, quantity] of Object.entries(wireCounts)) {
    const card = cardsByCode.get(code);

    if (!card) {
      unknownCodes.push(code);
      continue;
    }

    if (isQuantity(quantity)) {
      counts[card.id] = quantity;
    }
  }

  return { counts, unknownCodes };
};

/** Reads a share link's book. Returns null when the link cannot be read at all. */
export const decodeBook = (encoded: string): DecodedBook | null => {
  const wire = parseWire(encoded);

  if (!wire || wire.v !== WIRE_VERSION || !isRecord(wire.c)) {
    return null;
  }

  const mageId = typeof wire.m === 'string' && magesById.has(wire.m) ? wire.m : null;
  const schoolChoice = isSchool(wire.s) ? wire.s : null;
  const { counts, unknownCodes } = decodeCounts(wire.c);

  return { book: { mageId, schoolChoice, counts }, unknownCodes };
};
