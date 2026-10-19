import sharp from 'sharp';
import { type CropBox, whiteFrameBox } from './whiteFrame';

/** The crop box inside the white or transparent frame of an encoded image. */
export const frameBox = async (data: Uint8Array): Promise<CropBox> => {
  const { data: pixels, info } = await sharp(data)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return whiteFrameBox({
    data: pixels,
    width: info.width,
    height: info.height,
    channels: info.channels,
  });
};
