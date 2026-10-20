import type { Card } from '@/core/rules/types';

// The module's printed text gets a few cards wrong. These fixes are copied by hand from the card
// images. The engine data in the module is no better: it misses effects that the cards print.

interface CardCorrection extends Partial<Pick<Card, 'attackBar' | 'traits'>> {
  code: string;
  /** Checked against the card, so a correction never lands on the wrong one. */
  name: string;
}

export const CARD_CORRECTIONS: CardCorrection[] = [
  // The module prints a single Corrode on 5+.
  {
    code: 'a5386a31',
    name: 'Acid Ball',
    attackBar: 'Ranged | Acid | 2d6 | d12 1-4 = Corrode, 5+ = 2 Corrode',
  },
  // The cards below have no attack bar in the module at all.
  {
    code: '7c50b8b4',
    name: 'Burst of Thorns',
    attackBar: 'Thornburst\nRanged 0-0 | 4d6 | d12 7+ = Bleed | Piercing +1',
  },
  {
    code: '1ed8a709',
    name: 'Circle of Fire',
    attackBar:
      'Searing Heat\nDamage Barrier | Flame | 2d6 | d12 7-9 = Burn, 10+ = 2 Burn | Unavoidable',
  },
  {
    code: '8330e07a',
    name: 'Circle of Light',
    attackBar:
      'Blinding Aura\nDamage Barrier | Light | 1d6 | d12 5-10 = Daze, 11+ = Stun | Unavoidable, Ethereal, +2 vs. Nonliving Creatures',
  },
  {
    code: '0574a699',
    name: 'Circle of Lightning',
    attackBar:
      'Electric Surge\nDamage Barrier | Lightning | 2d6 | d12 7-10 = Daze, 11+ = Stun | Ethereal, Unavoidable',
  },
  {
    code: '0c8ccd8a',
    name: 'Combustion',
    attackBar: 'Burnout\nRanged | Flame | Xd6 | Defrost, Unavoidable',
  },
  {
    code: 'a3a04a1e',
    name: 'Corrosive Orchid',
    attackBar: 'Corrosive Mist\nRanged 0-0 | Acid | 2d6 | d12 7+ = Corrode | Unavoidable',
  },
  {
    code: '22fe0c48',
    name: 'Hellfire Trap',
    attackBar: 'Trap Attack\nFlame | 4d6 | d12 5-8 = Burn, 9+ = 2 Burn | Unavoidable, Defrost',
  },
  {
    code: '12dda20e',
    name: 'Hydrothermal Vent',
    attackBar: 'Superheated Vent\nHydro | 5d6 | d12 4-8 = Daze, 9+ = Stun',
  },
  {
    code: '8cfdf60f',
    name: 'Spiked Pit',
    attackBar: 'Impaling Spikes\n4d6 | d12 1+ = Stuck | Unavoidable, Piercing +2',
  },
  {
    code: 'aa9d500c',
    name: 'Telekinetic Bomb',
    attackBar: 'Blast\n4d6 | d12 4+ = Stagger | Ethereal, Unavoidable',
  },
  // Misprinted traits.
  { code: '7add1431', name: 'Dire Wolf', traits: ['Frost -2', 'Bloodthirsty +2'] },
  { code: 'd6f98712', name: 'Deathlock', traits: ['Zone Exclusive', 'Epic'] },
  { code: 'ca2b10a9', name: 'Tjusut, the Risen King', traits: ['Nonliving', 'Legendary'] },
];

/** The cards with their corrections applied. Throws on a correction that matches no card. */
export const applyCorrections = (
  cards: readonly Card[],
  corrections: readonly CardCorrection[],
): Card[] => {
  const byCode = new Map(corrections.map((correction) => [correction.code, correction]));
  const unmatched = corrections.filter(
    (correction) =>
      !cards.some((card) => card.code === correction.code && card.name === correction.name),
  );

  if (unmatched.length > 0) {
    const names = unmatched.map((correction) => `${correction.name} (${correction.code})`);

    throw new Error(`Card corrections match no card: ${names.join(', ')}`);
  }

  return cards.map((card) => {
    const correction = byCode.get(card.code);

    if (!correction) {
      return card;
    }

    const { code: _code, name: _name, ...fields } = correction;

    return { ...card, ...fields };
  });
};
