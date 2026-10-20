import { type BuilderTab, builderPath, PICKER_PATH } from '@/core/routing/builderPath';
import type { Spellbook } from '@/core/rules/types';
import { spellbookMage } from '@/data/catalog';

/** Where the spellbook already lives: its mage's builder, or the mage picker when it has no mage. */
export const currentSpellbookPath = (spellbook: Spellbook, tab: BuilderTab): string => {
  const mage = spellbookMage(spellbook);

  if (!mage) {
    return PICKER_PATH;
  }

  return builderPath(mage.name, tab);
};
