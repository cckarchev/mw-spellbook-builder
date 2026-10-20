import { strToU8, zipSync } from 'fflate';
import { makeCard, makeMage } from '@/core/rules/fixtures';
import {
  parseDeckXml,
  type RawDeck,
  readOfficialDecks,
  resolveOfficialSpellbook,
} from './readOfficialSpellbooks';

const FILE_NAME = 'Wizard Official.o8d';
const BYTE_ORDER_MARK = '﻿';

const WIZARD_CARD_ID = 'wizard-card';
const WIZARD_STATS_ID = 'wizard-stats';
const BOLT_ID = 'bolt-id';
const DISPEL_ID = 'dispel-id';
const OTHER_DISPEL_ID = 'dispel-other-printing';
const ACADEMY_ONLY_ID = 'academy-other-printing';

const BOLT_COPIES = 3;
const DISPEL_COPIES = 2;

const DECK_XML = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<deck game="9acef3d0-efa8-4d3f-a10c-54812baecdda">
  <section name="Mage" shared="False">
    <card qty="1" id="${WIZARD_CARD_ID}">Wizard</card>
    <card qty="1" id="${WIZARD_STATS_ID}">Wizard Stats</card>
  </section>
  <section name="Attack" shared="False">
    <card qty="${BOLT_COPIES}" id="${BOLT_ID}">Lightning Bolt</card>
  </section>
  <section name="Incantation" shared="False">
    <card qty="${DISPEL_COPIES}" id="${DISPEL_ID}">Dispel</card>
  </section>
</deck>`;

const wizard = makeMage({
  id: 'wizard',
  name: 'Wizard',
  imageCardId: WIZARD_CARD_ID,
  statsCardId: WIZARD_STATS_ID,
});
const adramelech = makeMage({
  id: 'adramelech-warlock',
  name: 'Adramelech Warlock',
  imageCardId: 'adramelech-card',
  statsCardId: 'adramelech-stats',
});
const mages = [wizard, adramelech];

const cards = [
  makeCard({ id: BOLT_ID, code: 'bolt0000', name: 'Lightning Bolt' }),
  makeCard({ id: DISPEL_ID, code: 'dispel00', name: 'Dispel' }),
  makeCard({ id: 'heal-academy', code: 'heal0000', name: 'Heal', format: 'academy' }),
];

const deckWith = (overrides: Partial<RawDeck>): RawDeck => ({
  mageCards: [{ id: WIZARD_STATS_ID, name: 'Wizard Stats', count: 1 }],
  cards: [],
  ...overrides,
});

describe('parseDeckXml', () => {
  it('reads the Mage section apart from the spellbook sections', () => {
    const deck = parseDeckXml(DECK_XML);

    expect(deck.mageCards.map((card) => card.name)).toEqual(['Wizard', 'Wizard Stats']);
    expect(deck.cards).toEqual([
      { id: BOLT_ID, name: 'Lightning Bolt', count: BOLT_COPIES },
      { id: DISPEL_ID, name: 'Dispel', count: DISPEL_COPIES },
    ]);
  });

  it('ignores a leading byte order mark', () => {
    const deck = parseDeckXml(BYTE_ORDER_MARK + DECK_XML);

    expect(deck.cards).toHaveLength(2);
  });
});

describe('readOfficialDecks', () => {
  it('returns only the official folder, by decoded file name', () => {
    const archive = zipSync({
      'def/Decks/Official%20Spellbooks/Wizard%20Official.o8d': strToU8(DECK_XML),
      'def/Decks/Offical%20Academy%20Spellbooks/Wizard.o8d': strToU8(DECK_XML),
      'def/Sets/some-set/set.xml': strToU8('<set/>'),
    });

    const decks = readOfficialDecks(archive);

    expect([...decks.keys()]).toEqual([FILE_NAME]);
    expect(decks.get(FILE_NAME)).toBe(DECK_XML);
  });
});

describe('resolveOfficialSpellbook cards', () => {
  it('resolves a card by id', () => {
    const deck = deckWith({ cards: [{ id: BOLT_ID, name: 'Lightning Bolt', count: BOLT_COPIES }] });

    const spellbook = resolveOfficialSpellbook(deck, FILE_NAME, cards, mages);

    expect(spellbook).toEqual({ mageId: 'wizard', counts: { [BOLT_ID]: BOLT_COPIES } });
  });

  it('falls back to the exact name among Arena cards when the id is another printing', () => {
    const deck = deckWith({ cards: [{ id: OTHER_DISPEL_ID, name: 'Dispel', count: 1 }] });

    const spellbook = resolveOfficialSpellbook(deck, FILE_NAME, cards, mages);

    expect(spellbook.counts).toEqual({ [DISPEL_ID]: 1 });
  });

  it('does not fall back to an Academy card with that name', () => {
    const deck = deckWith({ cards: [{ id: ACADEMY_ONLY_ID, name: 'Heal', count: 1 }] });

    expect(() => resolveOfficialSpellbook(deck, FILE_NAME, cards, mages)).toThrow(
      `${FILE_NAME}: no card matches "Heal"`,
    );
  });

  it('does not resolve an id that belongs to an Academy card', () => {
    const deck = deckWith({ cards: [{ id: 'heal-academy', name: 'Heal', count: 1 }] });

    expect(() => resolveOfficialSpellbook(deck, FILE_NAME, cards, mages)).toThrow(
      `${FILE_NAME}: no card matches "Heal"`,
    );
  });

  it('adds up two printings of the same card', () => {
    const deck = deckWith({
      cards: [
        { id: DISPEL_ID, name: 'Dispel', count: 1 },
        { id: OTHER_DISPEL_ID, name: 'Dispel', count: DISPEL_COPIES },
      ],
    });

    const spellbook = resolveOfficialSpellbook(deck, FILE_NAME, cards, mages);

    expect(spellbook.counts).toEqual({ [DISPEL_ID]: 1 + DISPEL_COPIES });
  });

  it('throws naming the file and the card when a card does not resolve', () => {
    const deck = deckWith({ cards: [{ id: 'nowhere', name: 'Missing Card', count: 1 }] });

    expect(() => resolveOfficialSpellbook(deck, FILE_NAME, cards, mages)).toThrow(
      `${FILE_NAME}: no card matches "Missing Card"`,
    );
  });

  it('throws when a name matches more than one Arena card', () => {
    const twoBolts = [
      ...cards,
      makeCard({ id: 'bolt-two', code: 'bolt0002', name: 'Lightning Bolt' }),
    ];
    const deck = deckWith({ cards: [{ id: 'nowhere', name: 'Lightning Bolt', count: 1 }] });

    expect(() => resolveOfficialSpellbook(deck, FILE_NAME, twoBolts, mages)).toThrow(
      `${FILE_NAME}: "Lightning Bolt" matches more than one card`,
    );
  });
});

describe('resolveOfficialSpellbook mage', () => {
  it('resolves the mage by its stats card id', () => {
    const deck = deckWith({
      mageCards: [{ id: WIZARD_STATS_ID, name: 'Renamed Stats', count: 1 }],
    });

    expect(resolveOfficialSpellbook(deck, FILE_NAME, cards, mages).mageId).toBe('wizard');
  });

  it('resolves the mage by name when the ids are unknown', () => {
    const deck = deckWith({
      mageCards: [
        { id: 'unknown-card', name: 'Adramelech Warlock', count: 1 },
        { id: 'unknown-stats', name: 'Adramelech Warlock Stats', count: 1 },
      ],
    });

    expect(resolveOfficialSpellbook(deck, FILE_NAME, cards, mages).mageId).toBe(
      'adramelech-warlock',
    );
  });

  it('throws when no mage matches', () => {
    const deck = deckWith({ mageCards: [{ id: 'nowhere', name: 'Unknown Mage', count: 1 }] });

    expect(() => resolveOfficialSpellbook(deck, FILE_NAME, cards, mages)).toThrow(
      `${FILE_NAME}: no mage matches its Mage section`,
    );
  });
});
