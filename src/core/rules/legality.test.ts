import { makeCard, makeMage, paladin, priest, warlock, wizard } from './fixtures';
import { isLegalFor, isTrainedIn } from './legality';

describe('isLegalFor', () => {
  it('allows a card with no "Only" restriction', () => {
    expect(isLegalFor(makeCard(), wizard, 'Fire')).toBe(true);
  });

  it('allows a mage-only card for that mage', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Warlock' }), warlock, null)).toBe(true);
  });

  it('rejects a mage-only card for another mage', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Warlock' }), wizard, 'Fire')).toBe(false);
  });

  it('matches any of the mage names', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Priestess' }), priest, null)).toBe(true);
  });

  it('allows a school mage card for a mage trained in that school', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Dark Mage' }), warlock, null)).toBe(true);
  });

  it('rejects a school mage card for a mage not trained in that school', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Dark Mage' }), wizard, 'Fire')).toBe(false);
  });

  it('counts the chosen school as trained', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Fire Mage' }), wizard, 'Fire')).toBe(true);
  });

  it('rejects a school mage card when another school was chosen', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Fire Mage' }), wizard, 'Air')).toBe(false);
  });

  it('counts partial training as trained', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Holy Mage' }), paladin, null)).toBe(true);
  });

  it('allows an Academy card for an Arena mage', () => {
    expect(isLegalFor(makeCard({ format: 'academy' }), wizard, 'Fire')).toBe(true);
  });

  it('rejects an Arena card for an Academy mage', () => {
    const academyMage = makeMage({ format: 'academy' });

    expect(isLegalFor(makeCard({ format: 'arena' }), academyMage, null)).toBe(false);
  });
});

describe('isTrainedIn', () => {
  it('counts full training', () => {
    expect(isTrainedIn('Dark', warlock, null)).toBe(true);
  });

  it('ignores a school choice the mage cannot make', () => {
    expect(isTrainedIn('Holy', warlock, 'Holy')).toBe(false);
  });
});
