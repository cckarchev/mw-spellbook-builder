import { existsSync } from 'node:fs';
import path from 'node:path';
import { cardCode, cardImagePath } from '@/core/catalog/cardImage';
import { mageStatsImage } from '@/core/catalog/mageImage';
import { splitByTerms } from '@/core/glossary/findTerms';
import { mageSlug } from '@/core/routing/builderPath';
import { SCHOOLS } from '@/core/rules/types';
import { cards, cardsByCode, cardsById, magesById } from './catalog';
import { glossary, glossaryIndex } from './glossary';
import { mages } from './mages';
import { officialSpellbook } from './officialSpellbooks';

const PUBLIC_DIR = 'public';
const PALADIN_HOLY_LEVEL = 2;
const PALADIN_WAR_LEVEL = 2;
const SCHOOL_MAGE_NAMES = new Set(SCHOOLS.map((school) => `${school} Mage`));
const MAGE_ONLY_NAMES = new Set(mages.flatMap((mage) => mage.onlyNames));
// "Makes the above attack", "immediately attacks", "gains a Damage Barrier", "Orchid's attack targets".
const REFERS_TO_ATTACK_PATTERN =
  /above attack|immediately attacks|gains a Damage Barrier|'s attack targets/i;

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

  it('has an attack bar for every card whose text refers to its attack', () => {
    const missing = cards.filter(
      (card) => card.attackBar === '' && REFERS_TO_ATTACK_PATTERN.test(card.effect),
    );

    expect(missing.map((card) => card.name)).toEqual([]);
  });

  it('prints the double Corrode of Acid Ball, which the module drops', () => {
    const acidBall = cards.find((card) => card.name === 'Acid Ball');

    expect(acidBall?.attackBar).toContain('5+ = 2 Corrode');
  });

  it.each([
    ['Dire Wolf', 'Bloodthirsty +2'],
    ['Deathlock', 'Zone Exclusive'],
    ['Tjusut, the Risen King', 'Nonliving'],
  ])('fixes the trait the module misprints on %s', (name, trait) => {
    const card = cards.find((candidate) => candidate.name === name);

    expect(card?.traits).toContain(trait);
  });
});

describe('mage data integrity', () => {
  it('has a unique, non-empty URL slug per mage', () => {
    const slugs = mages.map((mage) => mageSlug(mage.name));

    expect(slugs.every((slug) => slug !== '')).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

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

describe('glossary data integrity', () => {
  /** The term each word of a text points at, leaving out plain text. */
  const termsIn = (text: string) =>
    splitByTerms(text, glossaryIndex).flatMap((segment) =>
      segment.entry ? [[segment.text, segment.entry.term]] : [],
    );

  it('has a definition for every term', () => {
    const empty = glossary.filter((entry) => entry.definition === '');

    expect(empty.map((entry) => entry.term)).toEqual([]);
  });

  it('explains the words of an attack bar', () => {
    expect(termsIn('d12 7-8 = Daze, 9+ = Stun | Ethereal, Unavoidable')).toEqual([
      ['Daze', 'Daze'],
      ['Stun', 'Stun'],
      ['Ethereal', 'Ethereal'],
      ['Unavoidable', 'Unavoidable'],
    ]);
  });

  it('points damage types, immunities and "Only" traits at their generic entries', () => {
    expect(termsIn('Flame +2, Hydro Immunity, Forcemaster Only, Holy Mage Only')).toEqual([
      ['Flame +2', 'Damage Type +/- X'],
      ['Hydro Immunity', 'Immunity'],
      ['Forcemaster Only', 'Mage Only'],
      ['Holy Mage Only', 'Mage Only'],
    ]);
  });

  it('explains Attack only as the spell type', () => {
    expect(termsIn('an Attack spell that attacks')).toEqual([['Attack', 'Attack']]);
  });

  it('has an entry for Stance, which the Codex leaves out', () => {
    expect(termsIn('Monk Only, Stance')).toContainEqual(['Stance', 'Stance']);
  });
});

const OFFICIAL_MAGE_IDS = [
  'adramelech-warlock',
  'anvil-throne-warlord',
  'beastmaster',
  'druid',
  'forcemaster',
  'johktari-beastmaster',
  'necromancer',
  'paladin',
  'priest',
  'priestess',
  'siren',
  'warlock',
  'warlord',
  'wizard',
];

describe('official spellbook data integrity', () => {
  it('has an official spellbook for exactly these 14 mages', () => {
    const withOfficial = mages.filter((mage) => officialSpellbook(mage.id) !== null);

    expect(withOfficial.map((mage) => mage.id).sort()).toEqual(OFFICIAL_MAGE_IDS);
  });

  it('uses only cards in the catalog, with positive counts', () => {
    const problems = OFFICIAL_MAGE_IDS.flatMap((mageId) => {
      const counts = officialSpellbook(mageId)?.counts ?? {};

      return Object.entries(counts)
        .filter(([cardId, count]) => !cardsById.has(cardId) || count <= 0)
        .map(([cardId]) => `${mageId}: ${cardId}`);
    });

    expect(problems).toEqual([]);
  });

  it('gives each official spellbook its own mage', () => {
    const wrongMage = OFFICIAL_MAGE_IDS.filter(
      (mageId) => officialSpellbook(mageId)?.mageId !== mageId,
    );

    expect(wrongMage).toEqual([]);
  });

  it('has no official spellbook for a mage without one', () => {
    expect(officialSpellbook('sistarran-wizard')).toBeNull();
  });
});
