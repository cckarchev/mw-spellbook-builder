// Finds the white (or transparent) frame some pack images have around the card
// art, so it can be cut before the image is resized.

export interface RawImage {
  data: Uint8Array;
  width: number;
  height: number;
  /** Bytes per pixel; the 4th one, when present, is alpha. */
  channels: number;
}

export interface CropBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Each of red, green and blue at least this bright counts as white. */
const WHITE_MIN = 240;
/** Alpha below this counts as transparent. */
const CLEAR_MAX_ALPHA = 32;
/**
 * A row or column is frame when at least this share of its pixels is white or
 * transparent.
 */
const FRAME_SHARE = 0.5;

/**
 * Once a side had a frame, this share of the image is also cut there: the
 * frame's soft edge.
 */
const EDGE_SHARE = 0.01;

const RED_INDEX = 0;
const GREEN_INDEX = 1;
const BLUE_INDEX = 2;
const ALPHA_INDEX = 3;
const RGB_CHANNELS = 3;

/** Where a pixel's first channel sits in the image data. */
const pixelOffset = (image: RawImage, x: number, y: number): number =>
  (y * image.width + x) * image.channels;

/** The darkest of a pixel's red, green and blue. */
export const darkestChannel = (
  image: RawImage,
  x: number,
  y: number,
): number => {
  const offset = pixelOffset(image, x, y);
  const red = image.data[offset + RED_INDEX];
  const green = image.data[offset + GREEN_INDEX];
  const blue = image.data[offset + BLUE_INDEX];

  return Math.min(red, green, blue);
};

const isFramePixel = (image: RawImage, x: number, y: number): boolean => {
  const offset = pixelOffset(image, x, y);
  const hasAlpha = image.channels > RGB_CHANNELS;

  if (hasAlpha && image.data[offset + ALPHA_INDEX] < CLEAR_MAX_ALPHA) {
    return true;
  }

  return darkestChannel(image, x, y) >= WHITE_MIN;
};

const isFrameLine = (pixels: boolean[]): boolean => {
  const framePixels = pixels.filter(Boolean).length;

  return framePixels >= pixels.length * FRAME_SHARE;
};

const rowPixels = (image: RawImage, y: number, box: CropBox): boolean[] =>
  Array.from({ length: box.width }, (_, index) =>
    isFramePixel(image, box.left + index, y),
  );

const columnPixels = (image: RawImage, x: number, box: CropBox): boolean[] =>
  Array.from({ length: box.height }, (_, index) =>
    isFramePixel(image, x, box.top + index),
  );

type Side = "top" | "bottom" | "left" | "right";

interface LineCut {
  box: CropBox;
  sides: Side[];
}

/**
 * Cuts one frame line from each side that has one, and says which sides those
 * were.
 */
const cutFrameLine = (image: RawImage, box: CropBox): LineCut => {
  const right = box.left + box.width - 1;
  const bottom = box.top + box.height - 1;
  const cutTop = box.height > 1 && isFrameLine(rowPixels(image, box.top, box));
  const cutBottom =
    box.height > 1 + Number(cutTop) &&
    isFrameLine(rowPixels(image, bottom, box));
  const cutLeft =
    box.width > 1 && isFrameLine(columnPixels(image, box.left, box));
  const cutRight =
    box.width > 1 + Number(cutLeft) &&
    isFrameLine(columnPixels(image, right, box));

  const sides: Side[] = [];
  const flags: [Side, boolean][] = [
    ["top", cutTop],
    ["bottom", cutBottom],
    ["left", cutLeft],
    ["right", cutRight],
  ];

  for (const [side, cut] of flags) {
    if (cut) {
      sides.push(side);
    }
  }

  return {
    box: {
      left: box.left + Number(cutLeft),
      top: box.top + Number(cutTop),
      width: box.width - Number(cutLeft) - Number(cutRight),
      height: box.height - Number(cutTop) - Number(cutBottom),
    },
    sides,
  };
};

/**
 * The soft edge to cut on each framed side, unless that would leave nothing of
 * the image.
 */
const cutEdges = (
  image: RawImage,
  box: CropBox,
  sides: ReadonlySet<Side>,
): CropBox => {
  const rowEdge = Math.round(image.height * EDGE_SHARE);
  const columnEdge = Math.round(image.width * EDGE_SHARE);
  const top = sides.has("top") ? rowEdge : 0;
  const bottom = sides.has("bottom") ? rowEdge : 0;
  const left = sides.has("left") ? columnEdge : 0;
  const right = sides.has("right") ? columnEdge : 0;
  const width = box.width - left - right;
  const height = box.height - top - bottom;

  if (width < 1 || height < 1) {
    return box;
  }

  return { left: box.left + left, top: box.top + top, width, height };
};

/**
 * The part of the image inside its white or transparent frame; the whole image
 * when it has none.
 */
export const whiteFrameBox = (image: RawImage): CropBox => {
  let box: CropBox = {
    left: 0,
    top: 0,
    width: image.width,
    height: image.height,
  };
  const framedSides = new Set<Side>();
  let cutting = true;

  while (cutting) {
    const cut = cutFrameLine(image, box);

    box = cut.box;

    for (const side of cut.sides) {
      framedSides.add(side);
    }

    cutting = cut.sides.length > 0;
  }

  return cutEdges(image, box, framedSides);
};

/** Whether a crop box is wider than tall, as wall cards are printed. */
export const isLandscape = (box: CropBox): boolean => box.width > box.height;
