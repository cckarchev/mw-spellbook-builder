import sharp from 'sharp';
import { decodeImage } from './decodeImage';
import { whiteFrameBox } from './whiteFrame';

const SIZE = 100;
const FRAME = 10;
const INNER = SIZE - FRAME * 2;
const WHITE = 255;
const DARK = 40;
const EDGE = 1;

/** A one-channel greyscale PNG: a white frame around dark art. */
const greyFramedPng = async (): Promise<Uint8Array> => {
  const pixels = new Uint8Array(SIZE * SIZE);

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const inFrame = x < FRAME || y < FRAME || x >= SIZE - FRAME || y >= SIZE - FRAME;

      pixels[y * SIZE + x] = inFrame ? WHITE : DARK;
    }
  }

  const png = await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 1 } })
    .png()
    .toBuffer();

  return new Uint8Array(png);
};

describe('decodeImage', () => {
  it('decodes a greyscale image so its frame can be found', async () => {
    const box = whiteFrameBox(await decodeImage(await greyFramedPng()));

    expect(box).toEqual({
      left: FRAME + EDGE,
      top: FRAME + EDGE,
      width: INNER - EDGE * 2,
      height: INNER - EDGE * 2,
    });
  });
});
