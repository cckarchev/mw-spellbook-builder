import type { Spellbook } from '@/core/rules/types';
import { officialSpellbook } from './officialSpellbooks';

// Test fixtures read from the generated data.

/** The Wizard's official spellbook; throws if the data ever stops having one. */
export const officialWizardSpellbook = (): Spellbook => {
  const official = officialSpellbook('wizard');

  if (official === null) {
    throw new Error('The Wizard has no official spellbook');
  }

  return official;
};
