import { bookPath, builderPath, mageSlug, PICKER_PATH, slugFromPath, tabFromPath } from './paths';

const WIZARD = { name: 'Sistarran Wizard' };

describe('mageSlug', () => {
  it('lowercases a one-word name', () => {
    expect(mageSlug('Wizard')).toBe('wizard');
  });

  it('joins the words of a longer name with dashes', () => {
    expect(mageSlug('Anvil Throne Warlord')).toBe('anvil-throne-warlord');
  });

  it('drops punctuation and accents', () => {
    expect(mageSlug("Salenia's  Forcemaster!")).toBe('salenias-forcemaster');
    expect(mageSlug('Élan Druid')).toBe('elan-druid');
  });
});

describe('builderPath', () => {
  it('opens the cards tab at the mage path', () => {
    expect(builderPath('Sistarran Wizard', 'cards')).toBe('/sistarran-wizard');
  });

  it('opens the book tab one level down', () => {
    expect(builderPath('Sistarran Wizard', 'book')).toBe('/sistarran-wizard/book');
  });
});

describe('bookPath', () => {
  it('opens the tab of the mage of the book', () => {
    expect(bookPath(WIZARD, 'book')).toBe('/sistarran-wizard/book');
  });

  it('goes to the mage picker when the book has no mage', () => {
    expect(bookPath(undefined, 'book')).toBe(PICKER_PATH);
  });
});

describe('slugFromPath', () => {
  it('reads the mage slug of a builder path', () => {
    expect(slugFromPath('/sistarran-wizard')).toBe('sistarran-wizard');
    expect(slugFromPath('/sistarran-wizard/book')).toBe('sistarran-wizard');
  });

  it('has no slug on the mage picker', () => {
    expect(slugFromPath(PICKER_PATH)).toBeNull();
  });
});

describe('tabFromPath', () => {
  it('reads the Book tab from its segment', () => {
    expect(tabFromPath('/wizard/book')).toBe('book');
  });

  it('reads the Cards tab from a bare mage path', () => {
    expect(tabFromPath('/wizard')).toBe('cards');
  });
});
