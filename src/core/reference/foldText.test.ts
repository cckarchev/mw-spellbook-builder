import { foldQuery, foldText } from './foldText';

const PRECOMPOSED = 'Écho';
const DECOMPOSED = 'Écho';
// The accent mark of the decomposed text, which folds away.
const ACCENT_AT = 1;

/** Every index of a text, plus its length. */
const everyIndex = (text: string): number[] =>
  Array.from({ length: text.length + 1 }, (_, index) => index);

describe('foldText', () => {
  it('lowercases, drops accents and maps each character back', () => {
    expect(foldText(PRECOMPOSED)).toEqual({ folded: 'echo', origins: everyIndex(PRECOMPOSED) });
  });

  it('maps back past an accent written as its own mark', () => {
    const origins = everyIndex(DECOMPOSED).filter((index) => index !== ACCENT_AT);

    expect(foldText(DECOMPOSED)).toEqual({ folded: 'echo', origins });
  });

  it('reads a curly apostrophe as a straight one', () => {
    expect(foldText('Siren’s').folded).toBe("siren's");
  });
});

describe('foldQuery', () => {
  it('reads a query of spaces as no query', () => {
    expect(foldQuery('   ')).toBe('');
  });

  it('trims and folds the query', () => {
    expect(foldQuery('  Écho ')).toBe('echo');
  });
});
