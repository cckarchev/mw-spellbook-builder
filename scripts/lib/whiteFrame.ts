// Finds the white (or transparent) frame some pack images have around the card art,
// so it can be cut before the image is resized.

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
/** A row or column is frame when at least this share of its pixels is white or transparent. */
const FRAME_SHARE = 0.5;

/** Once a side had a frame, this share of the image is also cut there: the frame's soft edge. */
const EDGE_SHARE = 0.01;

const ALPHA_INDEX = 3;
const RGB_CHANNELS = 3;

const isFramePixel = (image: RawImage, x: number, y: number): boolean => {
  const offset = (y * image.width + x) * image.channels;
  const hasAlpha = image.channels > RGB_CHANNELS;

  if (hasAlpha && image.data[offset + ALPHA_INDEX] < CLEAR_MAX_ALPHA) {
    return true;
  }

  const red = image.data[offset];
  const green = image.data[offset + 1];
  const blue = image.data[offset + 2];

  return Math.min(red, green, blue) >= WHITE_MIN;
};

const isFrameLine = (pixels: boolean[]): boolean => {
  const framePixels = pixels.filter(Boolean).length;

  return framePixels >= pixels.length * FRAME_SHARE;
};

const rowPixels = (image: RawImage, y: number, box: CropBox): boolean[] =>
  Array.from({ length: box.width }, (_, index) => isFramePixel(image, box.left + index, y));

const columnPixels = (image: RawImage, x: number, box: CropBox): boolean[] =>
  Array.from({ length: box.height }, (_, index) => isFramePixel(image, x, box.top + index));

type Side = 'top' | 'bottom' | 'left' | 'right';

/** Cuts one frame line from each side that has one, and returns those sides. */
const cutFrameLine = (image: RawImage, box: CropBox): Side[] => {
  const right = box.left + box.width - 1;
  const bottom = box.top + box.height - 1;
  const cut: Side[] = [];

  if (box.height > 1 && isFrameLine(rowPixels(image, box.top, box))) {
    box.top += 1;
    box.height -= 1;
    cut.push('top');
  }

  if (box.height > 1 && isFrameLine(rowPixels(image, bottom, box))) {
    box.height -= 1;
    cut.push('bottom');
  }

  if (box.width > 1 && isFrameLine(columnPixels(image, box.left, box))) {
    box.left += 1;
    box.width -= 1;
    cut.push('left');
  }

  if (box.width > 1 && isFrameLine(columnPixels(image, right, box))) {
    box.width -= 1;
    cut.push('right');
  }

  return cut;
};

const cutEdges = (image: RawImage, box: CropBox, sides: ReadonlySet<Side>): CropBox => {
  const rowEdge = Math.round(image.height * EDGE_SHARE);
  const columnEdge = Math.round(image.width * EDGE_SHARE);
  const top = sides.has('top') ? rowEdge : 0;
  const bottom = sides.has('bottom') ? rowEdge : 0;
  const left = sides.has('left') ? columnEdge : 0;
  const right = sides.has('right') ? columnEdge : 0;

  return {
    left: box.left + left,
    top: box.top + top,
    width: box.width - left - right,
    height: box.height - top - bottom,
  };
};

/** The part of the image inside its white or transparent frame; the whole image when it has none. */
export const whiteFrameBox = (image: RawImage): CropBox => {
  const box: CropBox = { left: 0, top: 0, width: image.width, height: image.height };
  const framedSides = new Set<Side>();
  let cutting = true;

  while (cutting) {
    const cut = cutFrameLine(image, box);

    for (const side of cut) {
      framedSides.add(side);
    }

    cutting = cut.length > 0;
  }

  return cutEdges(image, box, framedSides);
};
