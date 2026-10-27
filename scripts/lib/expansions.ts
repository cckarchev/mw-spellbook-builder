export interface LegacySet {
  name: string;
  cardIds: string[];
}

const CORE_SET = "Core Set";

const RENAMES = new Map<string, string>([
  ["Core", CORE_SET],
  ["Mage Wars Arena Final Release", CORE_SET],
  ["Lost Grimore", "Lost Grimoire"],
]);

const DROPPED_SETS = new Set(["Gameboards"]);
const PLAYTEST_PREFIX = "Playtest:";

/**
 * The display name of a legacy OCTGN set, or null for sets that are not an
 * expansion.
 */
export const expansionName = (setName: string): string | null => {
  if (DROPPED_SETS.has(setName) || setName.startsWith(PLAYTEST_PREFIX)) {
    return null;
  }

  return RENAMES.get(setName) ?? setName;
};

/**
 * Card id to expansion. When a card is in several sets, the first one listed
 * wins.
 */
export const buildExpansionMap = (
  sets: readonly LegacySet[],
): Map<string, string> => {
  const map = new Map<string, string>();

  for (const set of sets) {
    const expansion = expansionName(set.name);

    if (expansion === null) {
      continue;
    }

    for (const cardId of set.cardIds) {
      if (!map.has(cardId)) {
        map.set(cardId, expansion);
      }
    }
  }

  return map;
};
