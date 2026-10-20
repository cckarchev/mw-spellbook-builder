import { act, renderHook } from '@testing-library/react';
import { CATALOG_VIEW_STORAGE_KEY, useCatalogView } from './useCatalogView';

beforeEach(() => {
  localStorage.clear();
});

describe('useCatalogView', () => {
  it('starts as a list when nothing is stored', () => {
    const { result } = renderHook(() => useCatalogView());

    expect(result.current.view).toBe('list');
  });

  it('starts with the stored view', () => {
    localStorage.setItem(CATALOG_VIEW_STORAGE_KEY, 'grid');

    const { result } = renderHook(() => useCatalogView());

    expect(result.current.view).toBe('grid');
  });

  it('starts as a list when the stored value is not a view', () => {
    localStorage.setItem(CATALOG_VIEW_STORAGE_KEY, 'table');

    const { result } = renderHook(() => useCatalogView());

    expect(result.current.view).toBe('list');
  });

  it('remembers the picked view for the next time', () => {
    const { result } = renderHook(() => useCatalogView());

    act(() => {
      result.current.setView('grid');
    });

    expect(result.current.view).toBe('grid');
    expect(localStorage.getItem(CATALOG_VIEW_STORAGE_KEY)).toBe('grid');
  });
});
