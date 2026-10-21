import type { Spellbook } from "@/core/rules/types";
import { cardsByCode, cardsById, magesById } from "@/data/catalog";
import { fromBase64Url, toBase64Url } from "./base64Url";

// Wire format: base64url JSON of { v: 1, m: mageId, c: { [cardCode]: qty } }.
// Older links may also carry s (the Wizard's element, no longer chosen); it is ignored.
// Card codes (8 hex chars) keep links short; quantities are kept as sent so validation
// can report a hand-edited count above the copy limit.

const WIRE_VERSION = 1;

interface Wire {
  v: number;
  m?: string;
  c: Record<string, number>;
}

export interface DecodedSpellbook {
  spellbook: Spellbook;
  /** Codes in the link that match no card, such as cards removed from the data. */
  unknownCodes: string[];
  /** The mage id the link names when the catalog has no such mage, else null. */
  unknownMage: string | null;
}

export const encodeSpellbook = (spellbook: Spellbook): string => {
  const counts: Record<string, number> = {};

  for (const [cardId, quantity] of Object.entries(spellbook.counts)) {
    const code = cardsById.get(cardId)?.code;

    if (code) {
      counts[code] = quantity;
    }
  }

  const wire: Wire = {
    v: WIRE_VERSION,
    m: spellbook.mageId ?? undefined,
    c: counts,
  };

  return toBase64Url(JSON.stringify(wire));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseWire = (encoded: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded));

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const isQuantity = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

interface DecodedCounts {
  counts: Spellbook["counts"];
  unknownCodes: string[];
}

const decodeCounts = (wireCounts: Record<string, unknown>): DecodedCounts => {
  const counts: Spellbook["counts"] = {};
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

/** Reads a share link's spellbook. Returns null when the link cannot be read at all. */
export const decodeSpellbook = (encoded: string): DecodedSpellbook | null => {
  const wire = parseWire(encoded);

  if (!wire || wire.v !== WIRE_VERSION || !isRecord(wire.c)) {
    return null;
  }

  const namedMage = typeof wire.m === "string" ? wire.m : null;
  const isKnownMage = namedMage !== null && magesById.has(namedMage);
  const mageId = isKnownMage ? namedMage : null;
  const unknownMage = isKnownMage ? null : namedMage;
  const { counts, unknownCodes } = decodeCounts(wire.c);

  return { spellbook: { mageId, counts }, unknownCodes, unknownMage };
};
