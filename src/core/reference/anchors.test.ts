import { letterAnchorId, termAnchorId } from './anchors';

describe('anchors', () => {
  it('turns a term into an anchor id', () => {
    expect(termAnchorId('Armor +/- X')).toBe('term-armor-x');
    expect(termAnchorId('Siren’s Call')).toBe('term-sirens-call');
  });

  it('turns a letter into an anchor id', () => {
    expect(letterAnchorId('A')).toBe('letter-a');
  });
});
