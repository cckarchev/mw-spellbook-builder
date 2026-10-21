import { act, renderHook } from '@testing-library/react';
import { BACK_TO_TOP_AFTER, FOLD_AFTER } from '@/core/reference/foldOnScroll';
import { useFoldOnScroll } from './useFoldOnScroll';

const STEP = 10;
const FOLDED = FOLD_AFTER + STEP;
const FURTHER = FOLDED + STEP;
const FURTHER_STILL = FURTHER + STEP;

const scrollTo = (element: HTMLElement, top: number) => {
  act(() => {
    element.scrollTop = top;
    element.dispatchEvent(new Event('scroll'));
  });
};

describe('useFoldOnScroll', () => {
  it('renders again only when the fold or the back to top button change', () => {
    const element = document.createElement('div');
    const scroller = { current: element };
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;

      return useFoldOnScroll(scroller);
    });
    const rendersAtStart = renders;

    scrollTo(element, FOLDED);
    scrollTo(element, FURTHER);
    scrollTo(element, FURTHER_STILL);

    expect(result.current.folded).toBe(true);
    expect(renders).toBe(rendersAtStart + 1);

    scrollTo(element, BACK_TO_TOP_AFTER + STEP);

    expect(result.current.showBackToTop).toBe(true);
  });
});
