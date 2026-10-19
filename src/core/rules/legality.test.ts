import { makeCard, makeMage, paladin, priest, warlock, wizard } from './fixtures';
import { isLegalFor, isTrainedIn } from './legality';

describe('isLegalFor', () => {
  it('allows a card with no "Only" restriction', () => {
    expect(isLegalFor(makeCard(), wizard)).toBe(true);
  });

  it('allows a mage-only card for that mage', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Warlock' }), warlock)).toBe(true);
  });

  it('rejects a mage-only card for another mage', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Warlock' }), wizard)).toBe(false);
  });

  it('matches any of the mage names', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Priestess' }), priest)).toBe(true);
  });

  it('allows a school mage card for a mage trained in that school', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Dark Mage' }), warlock)).toBe(true);
  });

  it('rejects a school mage card for a mage not trained in that school', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Dark Mage' }), wizard)).toBe(false);
  });

  it('allows an Air Mage card for the Wizard, trained in Air', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Air Mage' }), wizard)).toBe(true);
  });

  it('rejects a Fire Mage card for the Wizard', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Fire Mage' }), wizard)).toBe(false);
  });

  it('counts partial training as trained', () => {
    expect(isLegalFor(makeCard({ onlyFor: 'Holy Mage' }), paladin)).toBe(true);
  });

  it('allows an Academy card for an Arena mage', () => {
    expect(isLegalFor(makeCard({ format: 'academy' }), wizard)).toBe(true);
  });

  it('rejects an Arena card for an Academy mage', () => {
    const academyMage = makeMage({ format: 'academy' });

    expect(isLegalFor(makeCard({ format: 'arena' }), academyMage)).toBe(false);
  });
});

describe('isTrainedIn', () => {
  it('counts full training', () => {
    expect(isTrainedIn('Dark', warlock)).toBe(true);
  });

  it('does not count an untrained school', () => {
    expect(isTrainedIn('Holy', warlock)).toBe(false);
  });
});
