// Makes the white around a scanned card's rounded corners transparent, so the
// corners look like those of the cards that come cut out. Nothing is cropped:
// scans are not always straight, and any straight cut deep enough for the
// corners would eat into the card's border.

import type { CropBox, RawImage } from "./whiteFrame";

/**
 * Each of red, green and blue at least this bright is the white around a
 * corner.
 */
const CORNER_WHITE_MIN = 240;
/**
 * The one pixel ring past the white this bright is the soft edge where it meets
 * the card. Only that ring: a corner of light grey stone with no white is the
 * card itself.
 */
const SOFT_EDGE_MIN = 200;
/** A rounded corner fits in a square of this share of the shorter side. */
const CORNER_REGION_SHARE = 0.06;
/**
 * White over more than this share of a corner's square is the art itself, such
 * as a pale sky.
 */
const MAX_FILL_SHARE = 0.5;

const ALPHA_INDEX = 3;
const CLEAR_ALPHA = 0;
const MIN_REGION = 1;

interface Region {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The darkest of a pixel's red, green and blue. */
const darkestChannel = (image: RawImage, x: number, y: number): number => {
  const offset = (y * image.width + x) * image.channels;
  const red = image.data[offset];
  const green = image.data[offset + 1];
  const blue = image.data[offset + 2];

  return Math.min(red, green, blue);
};

interface Pixel {
  x: number;
  y: number;
}

const neighbors = (pixel: Pixel): Pixel[] => [
  { x: pixel.x + 1, y: pixel.y },
  { x: pixel.x - 1, y: pixel.y },
  { x: pixel.x, y: pixel.y + 1 },
  { x: pixel.x, y: pixel.y - 1 },
];

const isInRegion = (region: Region, x: number, y: number): boolean =>
  x >= region.left &&
  x <= region.right &&
  y >= region.top &&
  y <= region.bottom;

/**
 * The pixels of the white reaching in from a corner, as indexes into the image,
 * or none when the white fills too much of the corner's square to be a rounded
 * corner.
 */
const cornerFill = (
  image: RawImage,
  start: Pixel,
  region: Region,
): number[] => {
  const regionWidth = region.right - region.left + 1;
  const regionHeight = region.bottom - region.top + 1;
  const maxFill = regionWidth * regionHeight * MAX_FILL_SHARE;
  const filled = new Set<number>();
  const softEdge = new Set<number>();
  const queue = [start];

  while (queue.length > 0) {
    const pixel = queue.pop();

    if (!pixel || !isInRegion(region, pixel.x, pixel.y)) {
      continue;
    }

    const index = pixel.y * image.width + pixel.x;

    if (filled.has(index)) {
      continue;
    }

    const brightness = darkestChannel(image, pixel.x, pixel.y);

    if (brightness < CORNER_WHITE_MIN) {
      const onSoftEdge = filled.size > 0 && brightness >= SOFT_EDGE_MIN;

      if (onSoftEdge) {
        softEdge.add(index);
      }

      continue;
    }

    filled.add(index);

    if (filled.size > maxFill) {
      return [];
    }

    queue.push(...neighbors(pixel));
  }

  return [...filled, ...softEdge];
};

/**
 * A copy of the image with the white of each of the box's corners made
 * transparent.
 */
export const clearWhiteCorners = (image: RawImage, box: CropBox): RawImage => {
  const hasAlpha = image.channels > ALPHA_INDEX;

  if (!hasAlpha) {
    throw new Error("clearWhiteCorners needs an image with an alpha channel");
  }

  const shorterSide = Math.min(box.width, box.height);
  const regionSize = Math.max(
    MIN_REGION,
    Math.round(shorterSide * CORNER_REGION_SHARE),
  );
  const reach = regionSize - 1;
  const right = box.left + box.width - 1;
  const bottom = box.top + box.height - 1;
  const leftEdge = { left: box.left, right: box.left + reach };
  const rightEdge = { left: right - reach, right };
  const topEdge = { top: box.top, bottom: box.top + reach };
  const bottomEdge = { top: bottom - reach, bottom };

  const corners = [
    { start: { x: box.left, y: box.top }, region: { ...leftEdge, ...topEdge } },
    { start: { x: right, y: box.top }, region: { ...rightEdge, ...topEdge } },
    {
      start: { x: box.left, y: bottom },
      region: { ...leftEdge, ...bottomEdge },
    },
    { start: { x: right, y: bottom }, region: { ...rightEdge, ...bottomEdge } },
  ];
  const data = new Uint8Array(image.data);

  for (const corner of corners) {
    for (const index of cornerFill(image, corner.start, corner.region)) {
      data[index * image.channels + ALPHA_INDEX] = CLEAR_ALPHA;
    }
  }

  return { ...image, data };
};
