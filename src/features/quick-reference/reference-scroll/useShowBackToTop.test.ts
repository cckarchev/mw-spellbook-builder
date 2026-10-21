import { act, renderHook } from '@testing-library/react';
import { BACK_TO_TOP_AFTER, useShowBackToTop } from './useShowBackToTop';

const STEP = 10;
const FAR_DOWN = BACK_TO_TOP_AFTER + STEP;
const FURTHER = FAR_DOWN + STEP;
const FURTHER_STILL = FURTHER + STEP;

const scrollTo = (element: HTMLElement, top: number) => {
  act(() => {
    element.scrollTop = top;
    element.dispatchEvent(new Event('scroll'));
  });
};

describe('useShowBackToTop', () => {
  it('renders again only when the back to top button comes or goes', () => {
    const element = document.createElement('div');
    const scroller = { current: element };
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;

      return useShowBackToTop(scroller);
    });
    const rendersAtStart = renders;

    scrollTo(element, FAR_DOWN);
    scrollTo(element, FURTHER);
    scrollTo(element, FURTHER_STILL);

    expect(result.current).toBe(true);
    expect(renders).toBe(rendersAtStart + 1);

    scrollTo(element, STEP);

    expect(result.current).toBe(false);
  });
});
