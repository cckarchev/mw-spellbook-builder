import { act, renderHook } from '@testing-library/react';
import { stubMatchMedia } from '@/test/stubMatchMedia';
import { DESKTOP_QUERY, useIsDesktop, useMediaQuery } from './useMediaQuery';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
  it('is false when matchMedia does not exist', () => {
    vi.stubGlobal('matchMedia', undefined);

    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));

    expect(result.current).toBe(false);
  });

  it('reports a query that matches', () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));

    expect(result.current).toBe(true);
  });

  it('reports a query that does not match', () => {
    stubMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));

    expect(result.current).toBe(false);
  });

  it('follows the query when it starts or stops matching', () => {
    const { setMatches } = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery(DESKTOP_QUERY));

    act(() => {
      setMatches(true);
    });

    expect(result.current).toBe(true);

    act(() => {
      setMatches(false);
    });

    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('checks the desktop query', () => {
    const { queries } = stubMatchMedia(true);

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
    expect(queries).toContain('(min-width: 1024px)');
  });
});
