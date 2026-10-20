import { magesById } from '@/data/catalog';
import { mageImage, mageStatsImage } from './mageImage';

describe('mageImage', () => {
  it('points at the mage card image by its code', () => {
    const wizard = magesById.get('wizard');

    expect(wizard && mageImage(wizard)).toBe('/cards/4208e1b0.webp');
  });

  it('is null for a mage without a card', () => {
    const wizard = magesById.get('wizard');

    expect(wizard && mageImage({ ...wizard, imageCardId: null })).toBeNull();
  });
});

describe('mageStatsImage', () => {
  it('points at the mage stats card image by its code', () => {
    const wizard = magesById.get('wizard');

    expect(wizard && mageStatsImage(wizard)).toBe('/cards/56ee2c14.webp');
  });

  it('is null for a mage without a stats card', () => {
    const wizard = magesById.get('wizard');

    expect(wizard && mageStatsImage({ ...wizard, statsCardId: null })).toBeNull();
  });
});
