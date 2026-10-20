import { builderPath, mageSlug } from './builderPath';

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

  it('opens the spellbook tab one level down', () => {
    expect(builderPath('Sistarran Wizard', 'spellbook')).toBe('/sistarran-wizard/spellbook');
  });

  it('opens the stats tab one level down', () => {
    expect(builderPath('Sistarran Wizard', 'stats')).toBe('/sistarran-wizard/stats');
  });
});
