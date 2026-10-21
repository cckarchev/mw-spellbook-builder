import { clearWhiteCorners } from "./whiteCorners";
import type { CropBox, RawImage } from "./whiteFrame";

const CHANNELS = 4;
const ALPHA = 3;
const FULL = 255;
const DARK = 60;
const WHITE = [FULL, FULL, FULL, FULL];
/** The soft grey where a scanned card's corner meets the white around it. */
const BLEND_GREY = 210;
const BLEND = [BLEND_GREY, BLEND_GREY, BLEND_GREY, FULL];
const ART = [DARK, DARK, DARK, FULL];
const SIZE = 200;
/** How far each rounded corner reaches along its diagonal. */
const CORNER = 3;
const WHOLE: CropBox = { left: 0, top: 0, width: SIZE, height: SIZE };

/** An image painted by a function of each pixel's column and row. */
const paint = (colorAt: (x: number, y: number) => number[]): RawImage => {
  const data = new Uint8Array(SIZE * SIZE * CHANNELS);

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      data.set(colorAt(x, y), (y * SIZE + x) * CHANNELS);
    }
  }

  return { data, width: SIZE, height: SIZE, channels: CHANNELS };
};

/** How many diagonal steps a pixel is from its nearest corner. */
const cornerDistance = (x: number, y: number): number => {
  const fromSide = Math.min(x, SIZE - 1 - x);
  const fromEnd = Math.min(y, SIZE - 1 - y);

  return (fromSide + fromEnd) / 2;
};

const roundedScan = (x: number, y: number): number[] => {
  const distance = cornerDistance(x, y);

  if (distance < CORNER) {
    return WHITE;
  }

  return distance < CORNER + 1 ? BLEND : ART;
};

const alphaAt = (image: RawImage, x: number, y: number): number =>
  image.data[(y * image.width + x) * image.channels + ALPHA];

describe("clearWhiteCorners", () => {
  it("makes the white rounded corners of a scan transparent, soft edge included", () => {
    const cleared = clearWhiteCorners(paint(roundedScan), WHOLE);

    expect(alphaAt(cleared, 0, 0)).toBe(0);
    expect(alphaAt(cleared, SIZE - 1, SIZE - 1)).toBe(0);
    expect(alphaAt(cleared, CORNER, CORNER)).toBe(0);
    expect(alphaAt(cleared, CORNER + 1, CORNER + 1)).toBe(FULL);
    expect(alphaAt(cleared, SIZE / 2, SIZE / 2)).toBe(FULL);
  });

  it("leaves the image it was given untouched", () => {
    const image = paint(roundedScan);

    clearWhiteCorners(image, WHOLE);

    expect(alphaAt(image, 0, 0)).toBe(FULL);
  });

  it("keeps a light grey corner that has no white, such as a stone border", () => {
    const image = paint((x, y) =>
      cornerDistance(x, y) < CORNER ? BLEND : ART,
    );
    const cleared = clearWhiteCorners(image, WHOLE);

    expect(alphaAt(cleared, 0, 0)).toBe(FULL);
  });

  it("takes only one pixel of soft edge past the white", () => {
    const image = paint((x, y) =>
      cornerDistance(x, y) < CORNER ? WHITE : BLEND,
    );
    const cleared = clearWhiteCorners(image, WHOLE);
    const pastEdge = CORNER + 1;

    expect(alphaAt(cleared, CORNER, CORNER)).toBe(0);
    expect(alphaAt(cleared, pastEdge, pastEdge)).toBe(FULL);
  });

  it("keeps white that fills most of a corner, as art does", () => {
    const sky = 50;
    const image = paint((x, y) => (x < sky && y < sky ? WHITE : ART));
    const cleared = clearWhiteCorners(image, WHOLE);

    expect(alphaAt(cleared, 0, 0)).toBe(FULL);
  });

  it("works on the corners of the box, not of the whole image", () => {
    const frame = 10;
    const box: CropBox = {
      left: frame,
      top: frame,
      width: SIZE - frame * 2,
      height: SIZE - frame * 2,
    };
    const image = paint((x, y) => {
      const inBox =
        x >= frame && y >= frame && x < SIZE - frame && y < SIZE - frame;
      const atBoxCorner = x === frame && y === frame;

      return inBox && !atBoxCorner ? ART : WHITE;
    });
    const cleared = clearWhiteCorners(image, box);

    expect(alphaAt(cleared, frame, frame)).toBe(0);
    expect(alphaAt(cleared, 0, 0)).toBe(FULL);
  });
});
