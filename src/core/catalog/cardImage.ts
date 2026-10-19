// Card.code is the start of the card's OCTGN GUID: short enough for share links and still
// unique across the catalog. Card images are named by it.

const CODE_LENGTH = 8;

/** The short code of a card id, as used in share links and image names. */
export const cardCode = (cardId: string): string => cardId.slice(0, CODE_LENGTH);

/** The public path of a card's image, such as '/cards/4208e1b0.webp'. */
export const cardImagePath = (code: string): string => `/cards/${code}.webp`;
