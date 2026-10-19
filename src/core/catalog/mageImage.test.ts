import { magesById } from '@/data/catalog';
import { mageImage } from './mageImage';

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
