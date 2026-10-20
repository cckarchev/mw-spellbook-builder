import { bookPath, builderPath, mageSlug, PICKER_PATH, parseBuilderPath } from './paths';

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

describe('parseBuilderPath', () => {
  it('reads the mage slug and the Cards tab of a mage path', () => {
    expect(parseBuilderPath('/sistarran-wizard')).toEqual({
      slug: 'sistarran-wizard',
      tab: 'cards',
    });
  });

  it('reads the Book tab under its segment', () => {
    expect(parseBuilderPath('/wizard/book')).toEqual({ slug: 'wizard', tab: 'book' });
  });

  it('ignores a trailing slash, as the router does', () => {
    expect(parseBuilderPath('/wizard/book/')).toEqual({ slug: 'wizard', tab: 'book' });
  });

  it('is not a builder path on the mage picker', () => {
    expect(parseBuilderPath(PICKER_PATH)).toBeNull();
  });

  it('is not a builder path under an unknown segment or deeper', () => {
    expect(parseBuilderPath('/wizard/not-a-tab')).toBeNull();
    expect(parseBuilderPath('/wizard/book/more')).toBeNull();
  });
});
