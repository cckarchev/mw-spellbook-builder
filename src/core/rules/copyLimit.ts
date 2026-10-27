import { totalLevel } from "./cardCost";
import type { Card } from "./types";

const LEVEL_ONE_COPIES = 6;
const HIGHER_LEVEL_COPIES = 4;
const EPIC_COPIES = 1;

const EPIC_TRAIT = "Epic";

/** Most copies of a card one spellbook can hold. */
export const maxCopies = (card: Card): number => {
  if (card.traits.includes(EPIC_TRAIT)) {
    return EPIC_COPIES;
  }

  if (totalLevel(card) <= 1) {
    return LEVEL_ONE_COPIES;
  }

  return HIGHER_LEVEL_COPIES;
};
