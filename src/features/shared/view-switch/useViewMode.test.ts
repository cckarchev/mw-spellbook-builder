import { act, renderHook } from '@testing-library/react';
import { useViewMode, type ViewPanel, viewModeStorageKey } from './useViewMode';

const PANEL: ViewPanel = 'catalog';
const OTHER_PANEL: ViewPanel = 'book';

beforeEach(() => {
  localStorage.clear();
});

describe('useViewMode', () => {
  it('starts as a list when nothing is stored', () => {
    const { result } = renderHook(() => useViewMode(PANEL));

    expect(result.current.view).toBe('list');
  });

  it('starts with the stored view', () => {
    localStorage.setItem(viewModeStorageKey(PANEL), 'grid');

    const { result } = renderHook(() => useViewMode(PANEL));

    expect(result.current.view).toBe('grid');
  });

  it('starts as a list when the stored value is not a view', () => {
    localStorage.setItem(viewModeStorageKey(PANEL), 'table');

    const { result } = renderHook(() => useViewMode(PANEL));

    expect(result.current.view).toBe('list');
  });

  it('remembers the picked view for the next time', () => {
    const { result } = renderHook(() => useViewMode(PANEL));

    act(() => {
      result.current.setView('grid');
    });

    expect(result.current.view).toBe('grid');
    expect(localStorage.getItem(viewModeStorageKey(PANEL))).toBe('grid');
  });

  it('keeps each panel to its own view', () => {
    const { result } = renderHook(() => useViewMode(PANEL));

    act(() => {
      result.current.setView('grid');
    });

    const { result: other } = renderHook(() => useViewMode(OTHER_PANEL));

    expect(other.current.view).toBe('list');
  });
});
