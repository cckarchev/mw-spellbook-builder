import { mageNote } from './mageNote';

const DRAFT_POINTS = 87;
const SAVED_COUNT = 3;

describe('mageNote', () => {
  it('shows the draft points', () => {
    expect(mageNote(DRAFT_POINTS, 0)).toBe('Draft · 87 pts');
  });

  it('shows the saved count', () => {
    expect(mageNote(null, SAVED_COUNT)).toBe('3 saved');
  });

  it('shows both, the draft first', () => {
    expect(mageNote(DRAFT_POINTS, SAVED_COUNT)).toBe('Draft · 87 pts · 3 saved');
  });

  it('is null when the mage has neither', () => {
    expect(mageNote(null, 0)).toBeNull();
  });

  it('shows a draft of zero points', () => {
    expect(mageNote(0, 1)).toBe('Draft · 0 pts · 1 saved');
  });
});
