import { cutImageBox, IMAGE_CUTS } from './imageCorrections';

const BOX = { left: 10, top: 20, width: 300, height: 400 };

describe('cutImageBox', () => {
  it('keeps the box of a card with no correction', () => {
    expect(cutImageBox(BOX, 'no-such-card')).toEqual(BOX);
  });

  it('cuts the pixels a correction names from each side', () => {
    const [cardId, cut] = Object.entries(IMAGE_CUTS)[0];
    const top = cut.top ?? 0;
    const bottom = cut.bottom ?? 0;
    const left = cut.left ?? 0;
    const right = cut.right ?? 0;

    expect(cutImageBox(BOX, cardId)).toEqual({
      left: BOX.left + left,
      top: BOX.top + top,
      width: BOX.width - left - right,
      height: BOX.height - top - bottom,
    });
  });
});
