import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { resetSpellbookStore } from '@/features/shared/testSpellbooks';

/** Renders the whole app at a path, as if the player opened that URL. */
export const renderAppAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
};

/** Empties the spellbook and the catalog filters, for a test to start from a fresh app. */
export const resetAppState = () => {
  resetSpellbookStore();
  useCatalogFiltersStore.getState().reset();
};
