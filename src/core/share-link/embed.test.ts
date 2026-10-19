import { getEmbedBase, initEmbed } from './embed';

const CLUB_PAGE = 'https://cckarchev.ar/juegos/magewars/spellbook/';

const embedSearch = (base: string): string => `?embed=${encodeURIComponent(base)}`;

describe('embed', () => {
  beforeEach(() => {
    initEmbed('');
  });

  it('is null when there is no embed param', () => {
    initEmbed('?foo=bar');

    expect(getEmbedBase()).toBeNull();
  });

  it.each([
    CLUB_PAGE,
    'https://www.cckarchev.ar/juegos/magewars/spellbook/',
    'http://localhost:4321/juegos/magewars/spellbook/',
    'http://127.0.0.1:4321/juegos/magewars/spellbook/',
  ])('accepts %s', (base) => {
    initEmbed(embedSearch(base));

    expect(getEmbedBase()).toBe(base);
  });

  it.each(['https://evil.com/x', 'http://cckarchev.ar/juegos/magewars/spellbook/', 'not a url'])(
    'rejects %s',
    (base) => {
      initEmbed(embedSearch(base));

      expect(getEmbedBase()).toBeNull();
    },
  );
});
