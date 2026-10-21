import { FOLD_AFTER, foldStep, INITIAL_FOLD, SHOW_ON_UP, UNFOLD_BEFORE } from './foldOnScroll';

const FAR_DOWN = 500;
const STEP = 10;
const NEAR_TOP = UNFOLD_BEFORE - STEP;
const BEFORE_FOLD = FOLD_AFTER - STEP;
const PAST_FOLD = FOLD_AFTER + STEP;
const START = BEFORE_FOLD / 2;
const TWITCH_UP = FAR_DOWN - STEP;
const ENOUGH_UP = FAR_DOWN - SHOW_ON_UP - STEP;

const scrollThrough = (tops: number[]) => tops.reduce(foldStep, INITIAL_FOLD);

describe('foldStep', () => {
  it('folds once scrolled down past the threshold', () => {
    expect(scrollThrough([START, PAST_FOLD]).folded).toBe(true);
    expect(scrollThrough([START, BEFORE_FOLD]).folded).toBe(false);
  });

  it('unfolds after a short scroll up, not on a twitch', () => {
    expect(scrollThrough([FAR_DOWN, TWITCH_UP]).folded).toBe(true);
    expect(scrollThrough([FAR_DOWN, ENOUGH_UP]).folded).toBe(false);
  });

  it('adds up a scroll up made of small steps', () => {
    const smallSteps = [FAR_DOWN, FAR_DOWN - STEP, FAR_DOWN - 2 * STEP, ENOUGH_UP];

    expect(scrollThrough(smallSteps).folded).toBe(false);
  });

  it('folds again when scrolling down after unfolding', () => {
    expect(scrollThrough([FAR_DOWN, ENOUGH_UP, ENOUGH_UP + STEP]).folded).toBe(true);
  });

  it('always unfolds near the top', () => {
    expect(scrollThrough([FAR_DOWN, NEAR_TOP]).folded).toBe(false);
  });
});
