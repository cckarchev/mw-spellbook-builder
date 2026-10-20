import { savedCopy } from '@/core/persistence/savedSpellbooks';
import { hasUnsavedChanges } from '@/core/rules/spellbookChanges';
import { useSpellbookStore } from './useSpellbookStore';

interface SpellbookStatus {
  /** The saved spellbook's name, null when the spellbook has none or its saved copy is gone. */
  name: string | null;
  unsaved: boolean;
}

/**
 * The spellbook's name and whether it differs from its saved copy. Reads storage on each render,
 * which is cheap for spellbooks this small and picks up a save or a delete right away.
 */
export const useSpellbookStatus = (): SpellbookStatus => {
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const storedName = useSpellbookStore((state) => state.name);
  // Read only to render again after a save, which can leave the spellbook and the name unchanged.
  useSpellbookStore((state) => state.savedRevision);

  const saved = savedCopy(spellbook, storedName);
  const name = saved === null ? null : storedName;

  return { name, unsaved: hasUnsavedChanges(spellbook, saved) };
};
