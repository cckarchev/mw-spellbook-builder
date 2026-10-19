import type { Book, Mage } from '@/core/rules/types';
import { magesById } from '@/data/catalog';

// Test fixtures for the builder screens, built on the real catalog.

export const FIREBALL = 'd8562a1d-6a95-4ca4-99aa-91c5ca769a33';
export const LIGHTNING_BOLT = '9217f8a0-e46d-401e-b8b6-477100eaba54';
export const MANA_CRYSTAL = '9efdd1ac-d30c-4773-9ccd-f916470f4861';
export const ALFIYA = '05102a2c-509c-41c1-a751-787f4c499f40';
export const WATER_ELEMENTAL = 'b9ced997-b7fb-4cef-9f57-7264f3fea633';

const FIREBALL_COPIES = 3;
const BOLT_COPIES = 2;
const CRYSTAL_COPIES = 2;
const BOLT_LIMIT = 4;
const ALFIYA_COPIES = 4;
const ELEMENTAL_COPIES = 3;

const wizardOrThrow = (): Mage => {
  const wizard = magesById.get('wizard');

  if (!wizard) {
    throw new Error('The catalog has no Wizard');
  }

  return wizard;
};

export const wizard = wizardOrThrow();

const wizardFireBook = (counts: Book['counts']): Book => ({
  mageId: wizard.id,
  schoolChoice: 'Fire',
  counts,
});

/** 16 / 120: Fireball 3 x 2, Lightning Bolt 2 x 4, Mana Crystal 2 x 1. */
export const smallBook = wizardFireBook({
  [FIREBALL]: FIREBALL_COPIES,
  [LIGHTNING_BOLT]: BOLT_COPIES,
  [MANA_CRYSTAL]: CRYSTAL_COPIES,
});

/** 124 / 120: the small book with 4 Lightning Bolts, 4 Alfiya (16 each) and 3 Water Elementals (12 each). */
export const overBudgetBook = wizardFireBook({
  [FIREBALL]: FIREBALL_COPIES,
  [LIGHTNING_BOLT]: BOLT_LIMIT,
  [MANA_CRYSTAL]: CRYSTAL_COPIES,
  [ALFIYA]: ALFIYA_COPIES,
  [WATER_ELEMENTAL]: ELEMENTAL_COPIES,
});
