import { existsSync } from 'node:fs';
import path from 'node:path';
import { cardCode, cardImagePath } from '@/core/catalog/cardImage';
import { mageStatsImage } from '@/core/catalog/mageImage';
import { SCHOOLS } from '@/core/rules/types';
import { cards, cardsByCode, magesById } from './catalog';
import { mages } from './mages';

const PUBLIC_DIR = 'public';
const PALADIN_HOLY_LEVEL = 2;
const PALADIN_WAR_LEVEL = 2;
const SCHOOL_MAGE_NAMES = new Set(SCHOOLS.map((school) => `${school} Mage`));
const MAGE_ONLY_NAMES = new Set(mages.flatMap((mage) => mage.onlyNames));

const publicFileExists = (publicPath: string): boolean =>
  existsSync(path.join(PUBLIC_DIR, publicPath));

describe('card data integrity', () => {
  it('has a unique code per card', () => {
    expect(cardsByCode.size).toBe(cards.length);
  });

  it('has an image file for every card that names one', () => {
    const missing = cards.filter((card) => card.image !== null && !publicFileExists(card.image));

    expect(missing.map((card) => card.name)).toEqual([]);
  });

  it('resolves every "Only" restriction to a mage or a school mage', () => {
    const unresolved = cards.filter((card) => {
      if (card.onlyFor === null) {
        return false;
      }

      return !(MAGE_ONLY_NAMES.has(card.onlyFor) || SCHOOL_MAGE_NAMES.has(card.onlyFor));
    });

    expect(unresolved.map((card) => `${card.name}: ${card.onlyFor}`)).toEqual([]);
  });
});

describe('mage data integrity', () => {
  it('has a unique id per mage', () => {
    expect(magesById.size).toBe(mages.length);
  });

  it('has an image file for every mage card', () => {
    const missing = mages.filter((mage) => {
      const code = cardCode(mage.imageCardId ?? '');

      return !publicFileExists(cardImagePath(code));
    });

    expect(missing.map((mage) => mage.name)).toEqual([]);
  });

  it('has an image file for every mage stats card', () => {
    const missing = mages.filter((mage) => {
      const image = mageStatsImage(mage);

      return image === null || !publicFileExists(image);
    });

    expect(missing.map((mage) => mage.name)).toEqual([]);
  });

  it('trains the Paladin in Holy and War up to level 2, as the current module does', () => {
    const paladin = magesById.get('paladin');

    expect(paladin?.training.partial).toEqual([
      { school: 'Holy', maxLevel: PALADIN_HOLY_LEVEL },
      { school: 'War', maxLevel: PALADIN_WAR_LEVEL },
    ]);
  });

  it.each(['wizard', 'sistarran-wizard'])(
    'trains %s in Arcane and Air, as the current module does',
    (mageId) => {
      const training = magesById.get(mageId)?.training;

      expect(training?.full).toEqual(['Arcane', 'Air']);
    },
  );

  it('names the Salenia Forcemaster as the current module does, not the legacy sets', () => {
    expect(magesById.get('salenia-forcemaster')?.name).toBe('Salenia Forcemaster');
  });
});
