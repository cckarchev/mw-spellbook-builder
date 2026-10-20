import { XMLParser } from 'fast-xml-parser';
import { unzipSync } from 'fflate';
import type { Card, Mage } from '@/core/rules/types';

export interface DeckCard {
  id: string;
  name: string;
  count: number;
}

/** An OCTGN deck: the cards of its "Mage" section apart from its spellbook cards. */
export interface RawDeck {
  mageCards: DeckCard[];
  cards: DeckCard[];
}

/** An official spellbook in the app's terms: its mage and the copies of each catalog card. */
export interface OfficialSpellbook {
  mageId: string;
  counts: Record<string, number>;
}

interface XmlCard {
  '@_qty': string;
  '@_id': string;
  '#text': string;
}

interface XmlSection {
  '@_name': string;
  card?: XmlCard[];
}

interface XmlDeck {
  deck: { section?: XmlSection[] };
}

const MAGE_SECTION = 'Mage';
const OFFICIAL_FOLDER = 'def/Decks/Official%20Spellbooks/';
const BYTE_ORDER_MARK = /^﻿/;
const ARRAY_PATHS = new Set(['deck.section', 'deck.section.card']);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: false,
  parseAttributeValue: false,
  // A card element always has an attribute, so its name always lands in #text.
  alwaysCreateTextNode: true,
  isArray: (_name, jpath) => ARRAY_PATHS.has(String(jpath)),
});

const toDeckCard = (card: XmlCard): DeckCard => ({
  id: card['@_id'],
  name: card['#text'].trim(),
  count: Number(card['@_qty']),
});

export const parseDeckXml = (xml: string): RawDeck => {
  const parsed = parser.parse(xml.replace(BYTE_ORDER_MARK, '')) as XmlDeck;
  const deck: RawDeck = { mageCards: [], cards: [] };

  for (const section of parsed.deck.section ?? []) {
    const sectionCards = (section.card ?? []).map(toDeckCard);
    const target = section['@_name'] === MAGE_SECTION ? deck.mageCards : deck.cards;

    target.push(...sectionCards);
  }

  return deck;
};

/** The official spellbooks in an OCTGN game package (`.nupkg`, a zip), by decoded file name. */
export const readOfficialDecks = (archive: Uint8Array): Map<string, string> => {
  const entries = unzipSync(archive, { filter: (file) => file.name.startsWith(OFFICIAL_FOLDER) });
  const decoder = new TextDecoder();
  const decks = new Map<string, string>();

  for (const [entryName, content] of Object.entries(entries)) {
    const fileName = decodeURIComponent(entryName.slice(OFFICIAL_FOLDER.length));

    decks.set(fileName, decoder.decode(content));
  }

  return decks;
};

/** The deck's mage: by its picture or stats card id, else by the name of one of its cards. */
const resolveMage = (deck: RawDeck, fileName: string, mages: readonly Mage[]): Mage => {
  const deckIds = new Set(deck.mageCards.map((card) => card.id));
  const deckNames = new Set(deck.mageCards.map((card) => card.name));

  const byId = mages.find(
    (mage) =>
      (mage.imageCardId !== null && deckIds.has(mage.imageCardId)) ||
      (mage.statsCardId !== null && deckIds.has(mage.statsCardId)),
  );
  const mage = byId ?? mages.find((candidate) => deckNames.has(candidate.name));

  if (!mage) {
    throw new Error(`${fileName}: no mage matches its Mage section`);
  }

  return mage;
};

/** The catalog card for a deck card: by id, else by exact name among Arena cards. */
const resolveCard = (deckCard: DeckCard, fileName: string, cards: readonly Card[]): Card => {
  const byId = cards.find((card) => card.id === deckCard.id);

  if (byId) {
    return byId;
  }

  const byName = cards.filter((card) => card.format === 'arena' && card.name === deckCard.name);

  if (byName.length > 1) {
    throw new Error(`${fileName}: "${deckCard.name}" matches more than one card`);
  }

  const [card] = byName;

  if (!card) {
    throw new Error(`${fileName}: no card matches "${deckCard.name}"`);
  }

  return card;
};

/** Resolves a deck against the catalog; throws naming the file and the card when anything is unknown. */
export const resolveOfficialSpellbook = (
  deck: RawDeck,
  fileName: string,
  cards: readonly Card[],
  mages: readonly Mage[],
): OfficialSpellbook => {
  const mage = resolveMage(deck, fileName, mages);
  const counts: Record<string, number> = {};

  for (const deckCard of deck.cards) {
    const card = resolveCard(deckCard, fileName, cards);
    const count = counts[card.id] ?? 0;

    counts[card.id] = count + deckCard.count;
  }

  return { mageId: mage.id, counts };
};
