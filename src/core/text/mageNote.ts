const DRAFT_LABEL = 'Draft';
const POINTS_UNIT = 'pts';
const SAVED_LABEL = 'saved';
const SEPARATOR = ' · ';

/**
 * What a mage tile says the mage has: "Draft · 87 pts · 3 saved", either part alone, or
 * null for nothing. `draftPoints` is null when the mage's draft has no cards.
 */
export const mageNote = (draftPoints: number | null, savedCount: number): string | null => {
  const parts: string[] = [];

  if (draftPoints !== null) {
    parts.push(`${DRAFT_LABEL}${SEPARATOR}${draftPoints} ${POINTS_UNIT}`);
  }

  if (savedCount > 0) {
    parts.push(`${savedCount} ${SAVED_LABEL}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(SEPARATOR);
};
