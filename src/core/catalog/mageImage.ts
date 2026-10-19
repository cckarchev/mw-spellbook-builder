import type { Mage } from '@/core/rules/types';
import { cardCode, cardImagePath } from './cardImage';

/** Public path of the mage card image, or null when the mage has no card. */
export const mageImage = (mage: Mage): string | null => {
  if (mage.imageCardId === null) {
    return null;
  }

  return cardImagePath(cardCode(mage.imageCardId));
};
