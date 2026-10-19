import type { Mage } from '@/core/rules/types';

/** Card images are named by the first 8 hex chars of the card id, like Card.code. */
const CODE_LENGTH = 8;

/** Public path of the mage card image, or null when the mage has no card. */
export const mageImage = (mage: Mage): string | null => {
  if (mage.imageCardId === null) {
    return null;
  }

  const code = mage.imageCardId.slice(0, CODE_LENGTH);

  return `/cards/${code}.webp`;
};
