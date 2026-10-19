import { BOOK_PARAM, buildShareUrl } from './shareUrl';

const ENCODED = 'eyJ2IjoxfQ';
const ORIGIN = 'https://mw.example.dev';

describe('buildShareUrl', () => {
  it('points at the club page when embedded', () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      embedBase: 'https://cckarchev.ar/juegos/magewars/spellbook/',
      origin: ORIGIN,
    });

    expect(url).toBe(`https://cckarchev.ar/juegos/magewars/spellbook/?${BOOK_PARAM}=${ENCODED}`);
  });

  it('keeps query params already on the club page', () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      embedBase: 'https://cckarchev.ar/juegos/magewars/?tool=spellbook',
      origin: ORIGIN,
    });

    expect(url).toBe(`https://cckarchev.ar/juegos/magewars/?tool=spellbook&b=${ENCODED}`);
  });

  it("points at this app's builder when standalone", () => {
    const url = buildShareUrl({ encoded: ENCODED, embedBase: null, origin: ORIGIN });

    expect(url).toBe(`${ORIGIN}/build?b=${ENCODED}`);
  });
});
