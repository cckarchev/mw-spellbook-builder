import type { CropBox } from './whiteFrame';

// A few pack images have a blemish at an edge that is neither white nor a frame, so the
// automatic cut leaves it. These cuts are measured by hand on the pack image, in its own pixels.

type Side = 'top' | 'bottom' | 'left' | 'right';

type ImageCut = Partial<Record<Side, number>>;

/** Pixels to cut from each side of a card's pack image, by card id. */
export const IMAGE_CUTS: Record<string, ImageCut> = {
  // Forcemaster: a light grey line along the top of the scan.
  '7f88625f-591b-41ef-861d-4a89a4a57f24': { top: 1 },
};

const NO_CUT = 0;

/** The box with the hand measured cut of a card taken off, or the same box when it has none. */
export const cutImageBox = (box: CropBox, cardId: string): CropBox => {
  const cut = IMAGE_CUTS[cardId];

  if (!cut) {
    return box;
  }

  const top = cut.top ?? NO_CUT;
  const bottom = cut.bottom ?? NO_CUT;
  const left = cut.left ?? NO_CUT;
  const right = cut.right ?? NO_CUT;

  return {
    left: box.left + left,
    top: box.top + top,
    width: box.width - left - right,
    height: box.height - top - bottom,
  };
};
