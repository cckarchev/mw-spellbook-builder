import type { GlossaryEntry } from '@/core/glossary/types';
import { markSegments } from './markSegments';

const flame: GlossaryEntry = { term: 'Flame', definition: 'Fire.' };

describe('markSegments', () => {
  it('marks a range that runs from plain text into a term', () => {
    const marked = markSegments(
      [
        { text: 'a Burn', entry: null },
        { text: 'Flame', entry: flame },
      ],
      [{ start: 2, end: 8 }],
    );

    expect(marked).toEqual([
      {
        entry: null,
        parts: [
          { text: 'a ', marked: false },
          { text: 'Burn', marked: true },
        ],
      },
      {
        entry: flame,
        parts: [
          { text: 'Fl', marked: true },
          { text: 'ame', marked: false },
        ],
      },
    ]);
  });

  it('marks a range inside a segment', () => {
    const marked = markSegments([{ text: 'a Burn b', entry: null }], [{ start: 2, end: 6 }]);

    expect(marked[0]?.parts).toEqual([
      { text: 'a ', marked: false },
      { text: 'Burn', marked: true },
      { text: ' b', marked: false },
    ]);
  });

  it('leaves segments whole without ranges', () => {
    const marked = markSegments([{ text: 'Flame', entry: flame }], []);

    expect(marked).toEqual([{ entry: flame, parts: [{ text: 'Flame', marked: false }] }]);
  });
});
