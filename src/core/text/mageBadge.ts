import { plural } from "./plural";

const DRAFT_LABEL = "Draft";
const DESCRIPTION_SEPARATOR = ", ";

export interface MageBadge {
  /**
   * How many spellbooks the mage has saved; with none, the badge marks the
   * draft instead.
   */
  savedCount: number;
  /** What the badge means, for screen readers: "Draft, 3 saved spellbooks". */
  description: string;
  /** Whether the mage's draft holds work its saved copy does not. */
  hasDraft: boolean;
  hasSaved: boolean;
}

/**
 * The badge on a mage tile: how many spellbooks the mage has saved, and whether
 * it has a draft.
 */
export const mageBadge = (
  hasDraft: boolean,
  savedCount: number,
): MageBadge | null => {
  const hasSaved = savedCount > 0;

  if (!(hasDraft || hasSaved)) {
    return null;
  }

  const parts: string[] = [];

  if (hasDraft) {
    parts.push(DRAFT_LABEL);
  }

  if (hasSaved) {
    parts.push(plural(savedCount, "saved spellbook", "saved spellbooks"));
  }

  return {
    savedCount,
    description: parts.join(DESCRIPTION_SEPARATOR),
    hasDraft,
    hasSaved,
  };
};
