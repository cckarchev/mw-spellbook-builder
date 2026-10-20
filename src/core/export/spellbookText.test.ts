import { makeCard, wizard } from '@/core/rules/fixtures';
import type { Card, Spellbook } from '@/core/rules/types';
import { type SpellbookSummary, summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { spellbookText } from './spellbookText';

const LEVEL_TWO = 2;
const FIREBALL_COPIES = 3;
const BOLT_COPIES = 2;
const CRYSTAL_COPIES = 2;
const OVER_BUDGET_POINTS = 124;
const OVER_BY = 4;

const SHARE_URL = 'https://cckarchev.ar/juegos/magewars/spellbook/?b=XYZ';

const fireball = makeCard({
  id: 'fireball',
  name: 'Fireball',
  type: 'Attack',
  schools: [{ school: 'Fire', level: LEVEL_TWO }],
});
const lightningBolt = makeCard({
  id: 'lightning-bolt',
  name: 'Lightning Bolt',
  type: 'Attack',
  schools: [{ school: 'Air', level: LEVEL_TWO }],
});
const manaCrystal = makeCard({
  id: 'mana-crystal',
  name: 'Mana Crystal',
  type: 'Conjuration',
  schools: [{ school: 'Arcane', level: 1 }],
});

const cardsById = new Map<string, Card>(
  [fireball, lightningBolt, manaCrystal].map((card) => [card.id, card]),
);

const spellbook: Spellbook = {
  mageId: wizard.id,
  counts: {
    [manaCrystal.id]: CRYSTAL_COPIES,
    [lightningBolt.id]: BOLT_COPIES,
    [fireball.id]: FIREBALL_COPIES,
  },
};

const firstLine = (text: string): string => text.split('\n')[0];

describe('spellbookText', () => {
  it('lists the spellbook grouped by type with points and the share link', () => {
    const summary = summarizeSpellbook(spellbook, wizard, cardsById);

    expect(spellbookText(spellbook, wizard, summary, cardsById, SHARE_URL)).toBe(
      [
        'Wizard · 18/120 pts',
        '',
        'ATTACK (5)',
        '3x Fireball',
        '2x Lightning Bolt',
        '',
        'CONJURATION (2)',
        '2x Mana Crystal',
        '',
        SHARE_URL,
      ].join('\n'),
    );
  });

  it('says how far over budget the spellbook is', () => {
    const summary: SpellbookSummary = {
      ...summarizeSpellbook(spellbook, wizard, cardsById),
      points: OVER_BUDGET_POINTS,
      overBy: OVER_BY,
    };

    expect(firstLine(spellbookText(spellbook, wizard, summary, cardsById, SHARE_URL))).toBe(
      'Wizard · 124/120 pts (4 over)',
    );
  });

  it('skips cards missing from the catalog', () => {
    const withUnknown: Spellbook = { ...spellbook, counts: { ...spellbook.counts, gone: 1 } };
    const summary = summarizeSpellbook(spellbook, wizard, cardsById);

    expect(spellbookText(withUnknown, wizard, summary, cardsById, SHARE_URL)).toBe(
      spellbookText(spellbook, wizard, summary, cardsById, SHARE_URL),
    );
  });
});
