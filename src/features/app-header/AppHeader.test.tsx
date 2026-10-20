import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { App } from '@/App';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { resetSpellbookStore, smallSpellbook } from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { APP_NAME } from './AppHeader';

/** Shows how the last navigation changed the history, for the test to read. */
const NavigationProbe = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  return <output aria-label="Navigation">{`${navigationType} ${location.pathname}`}</output>;
};

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <NavigationProbe />
    </MemoryRouter>,
  );
};

const clickAppName = async () => {
  await userEvent.click(screen.getByRole('link', { name: APP_NAME }));
};

const pickerHeading = () => screen.queryByRole('heading', { name: 'Choose a mage' });

beforeEach(() => {
  resetSpellbookStore();
  useCatalogFiltersStore.getState().reset();
});

describe('AppHeader', () => {
  it('goes home without asking and keeps the spellbook', async () => {
    useSpellbookStore.getState().loadSpellbook(smallSpellbook);
    renderAt('/wizard');

    await clickAppName();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useSpellbookStore.getState().spellbook).toEqual(smallSpellbook);
    expect(pickerHeading()).toBeInTheDocument();
  });

  it('does not add a history entry when the player is already home', async () => {
    renderAt('/');

    await clickAppName();

    expect(screen.getByRole('status', { name: 'Navigation' })).toHaveTextContent('REPLACE /');
  });
});
