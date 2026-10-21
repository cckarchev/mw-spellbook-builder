import sharp from 'sharp';
import type { RawImage } from './whiteFrame';

/** The pixels of an encoded image, always with an alpha channel. */
export const decodeImage = async (data: Uint8Array): Promise<RawImage> => {
  const { data: pixels, info } = await sharp(data)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: pixels,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
};
