import { hasUnsavedDraft } from '@/core/persistence/drafts';
import { savedSpellbooks } from '@/core/persistence/savedSpellbooks';
import type { Mage } from '@/core/rules/types';
import { type MageBadge, mageBadge } from '@/core/text/mageBadge';

/**
 * The badge on the mage's tile: how many spellbooks it has saved, and whether its draft holds
 * unsaved work. A draft that matches its saved copy is not one; the count already shows it.
 */
export const mageBadgeFor = (mage: Mage): MageBadge | null =>
  mageBadge(hasUnsavedDraft(mage.id), savedSpellbooks(mage.id).length);
