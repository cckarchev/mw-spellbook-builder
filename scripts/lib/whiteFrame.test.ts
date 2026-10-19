import { type RawImage, whiteFrameBox } from './whiteFrame';

const CHANNELS = 4;
const FULL = 255;
const DARK = 60;
const LIGHT = 230;
const WHITE = [FULL, FULL, FULL, FULL];
const ART = [DARK, DARK, DARK, FULL];
/** Bright parchment art, just under the white threshold. */
const LIGHT_ART = [FULL, LIGHT, LIGHT, FULL];
const CLEAR = [0, 0, 0, 0];
const SIZE = 10;
const FRAME = 2;
const INNER_SIZE = SIZE - FRAME * 2;

/** An image painted by a function of each pixel's column and row. */
const paint = (width: number, height: number, colorAt: (x: number, y: number) => number[]) => {
  const data = new Uint8Array(width * height * CHANNELS);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data.set(colorAt(x, y), (y * width + x) * CHANNELS);
    }
  }

  const image: RawImage = { data, width, height, channels: CHANNELS };

  return image;
};

const isInFrame = (x: number, y: number, size: number, frame: number): boolean =>
  x < frame || y < frame || x >= size - frame || y >= size - frame;

describe('whiteFrameBox', () => {
  it('keeps an image with no frame whole', () => {
    const image = paint(SIZE, SIZE, () => ART);

    expect(whiteFrameBox(image)).toEqual({ left: 0, top: 0, width: SIZE, height: SIZE });
  });

  it('cuts a white frame on every side', () => {
    const image = paint(SIZE, SIZE, (x, y) => (isInFrame(x, y, SIZE, FRAME) ? WHITE : ART));

    expect(whiteFrameBox(image)).toEqual({
      left: FRAME,
      top: FRAME,
      width: INNER_SIZE,
      height: INNER_SIZE,
    });
  });

  it('cuts a transparent frame too', () => {
    const image = paint(SIZE, SIZE, (x, y) => (isInFrame(x, y, SIZE, FRAME) ? CLEAR : ART));

    expect(whiteFrameBox(image)).toEqual({
      left: FRAME,
      top: FRAME,
      width: INNER_SIZE,
      height: INNER_SIZE,
    });
  });

  it('also cuts the blended line next to a frame, on the sides that had one', () => {
    const size = 200;
    const frame = 10;
    // 1% of the size, the soft edge where a frame meets the art.
    const blend = 2;
    const grey = [LIGHT, LIGHT, LIGHT, FULL];
    const image = paint(size, size, (_x, y) => {
      if (y < frame) {
        return WHITE;
      }

      return y < frame + blend ? grey : ART;
    });

    expect(whiteFrameBox(image)).toEqual({
      left: 0,
      top: frame + blend,
      width: size,
      height: size - frame - blend,
    });
  });

  it('keeps an edge that only has white corners', () => {
    const isCorner = (x: number, y: number) =>
      (x === 0 || x === SIZE - 1) && (y === 0 || y === SIZE - 1);
    const image = paint(SIZE, SIZE, (x, y) => (isCorner(x, y) ? WHITE : ART));

    expect(whiteFrameBox(image)).toEqual({ left: 0, top: 0, width: SIZE, height: SIZE });
  });

  it('keeps an edge where the art itself is light but not white', () => {
    const image = paint(SIZE, SIZE, (_x, y) => (y === 0 ? LIGHT_ART : ART));

    expect(whiteFrameBox(image)).toEqual({ left: 0, top: 0, width: SIZE, height: SIZE });
  });
});
