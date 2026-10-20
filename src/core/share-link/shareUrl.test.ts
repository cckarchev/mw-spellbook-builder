import { buildShareUrl, SPELLBOOK_PARAM } from './shareUrl';

const ENCODED = 'eyJ2IjoxfQ';
const ORIGIN = 'https://mw.example.dev';
const MAGE_PATH = '/sistarran-wizard';

describe('buildShareUrl', () => {
  it('points at the club page when embedded', () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      embedBase: 'https://cckarchev.ar/juegos/magewars/spellbook/',
      origin: ORIGIN,
      magePath: MAGE_PATH,
    });

    expect(url).toBe(
      `https://cckarchev.ar/juegos/magewars/spellbook/?${SPELLBOOK_PARAM}=${ENCODED}`,
    );
  });

  it('keeps query params already on the club page', () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      embedBase: 'https://cckarchev.ar/juegos/magewars/?tool=spellbook',
      origin: ORIGIN,
      magePath: MAGE_PATH,
    });

    expect(url).toBe(`https://cckarchev.ar/juegos/magewars/?tool=spellbook&b=${ENCODED}`);
  });

  it("points at the mage in this app's builder when standalone", () => {
    const url = buildShareUrl({
      encoded: ENCODED,
      embedBase: null,
      origin: ORIGIN,
      magePath: MAGE_PATH,
    });

    expect(url).toBe(`${ORIGIN}${MAGE_PATH}?b=${ENCODED}`);
  });
});
