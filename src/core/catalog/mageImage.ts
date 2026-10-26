import type { Mage } from "@/core/rules/types";
import { cardCode, cardImagePath } from "./cardImage";

const imageFor = (cardId: string | null): string | null => {
  if (cardId === null) {
    return null;
  }

  return cardImagePath(cardCode(cardId));
};

/** Public path of the mage card image, or null when the mage has no card. */
export const mageImage = (mage: Mage): string | null =>
  imageFor(mage.imageCardId);

/**
 * Public path of the mage stats card image, or null when the mage has no stats
 * card.
 */
export const mageStatsImage = (mage: Mage): string | null =>
  imageFor(mage.statsCardId);
