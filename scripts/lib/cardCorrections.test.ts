import type { Card } from '@/core/rules/types';
import { applyCorrections } from './cardCorrections';

const card = (code: string, name: string): Card =>
  ({ code, name, attackBar: '', effect: 'Makes the above attack.' }) as Card;

describe('applyCorrections', () => {
  it('replaces the corrected fields of the matching card and leaves the rest alone', () => {
    const bomb = card('aa9d500c', 'Telekinetic Bomb');
    const other = card('11111111', 'Other');
    const corrected = applyCorrections(
      [bomb, other],
      [{ code: 'aa9d500c', name: 'Telekinetic Bomb', attackBar: 'Blast\n4d6' }],
    );

    expect(corrected).toEqual([{ ...bomb, attackBar: 'Blast\n4d6' }, other]);
  });

  it('throws when a correction names a card that is not there, so a stale one shows up', () => {
    expect(() =>
      applyCorrections(
        [card('aa9d500c', 'Telekinetic Bomb')],
        [{ code: 'aa9d500c', name: 'Acid Ball', attackBar: 'Ranged' }],
      ),
    ).toThrow('Acid Ball');
  });
});
