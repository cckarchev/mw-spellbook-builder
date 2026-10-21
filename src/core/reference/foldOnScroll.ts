/** Scrolled down this far, in pixels, the letters fold away. */
export const FOLD_AFTER = 120;
/** This close to the top, in pixels, the letters always show. */
export const UNFOLD_BEFORE = 24;
/** Scrolled up this far in one go, in pixels, the letters show again. */
export const SHOW_ON_UP = 24;
/** Scrolled down this far, in pixels, the back to top button shows. */
export const BACK_TO_TOP_AFTER = 1200;

export interface FoldState {
  folded: boolean;
  lastTop: number;
  /** How far the list has scrolled up since it last scrolled down. */
  upDistance: number;
}

export const INITIAL_FOLD: FoldState = { folded: false, lastTop: 0, upDistance: 0 };

/** The letters' fold after the list scrolls to `scrollTop`. */
export const foldStep = (state: FoldState, scrollTop: number): FoldState => {
  const delta = scrollTop - state.lastTop;

  if (scrollTop <= UNFOLD_BEFORE) {
    return { folded: false, lastTop: scrollTop, upDistance: 0 };
  }

  if (delta > 0) {
    const pastThreshold = scrollTop > FOLD_AFTER;

    return { folded: state.folded || pastThreshold, lastTop: scrollTop, upDistance: 0 };
  }

  const upDistance = state.upDistance - delta;
  const scrolledUpEnough = upDistance >= SHOW_ON_UP;

  return { folded: state.folded && !scrolledUpEnough, lastTop: scrollTop, upDistance };
};
