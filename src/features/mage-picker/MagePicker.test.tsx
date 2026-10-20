import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { FIREBALL } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { MagePicker } from './MagePicker';

/** A "Warlock Only" card, illegal for every other mage. */
const ADRAMELECHS_TORMENT = '9e7cbef4-1ad9-46cf-95c0-1aafd656c85d';
const ONE_COPY = 1;

const renderPicker = () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route index={true} element={<MagePicker />} />
        <Route path=":mageSlug" element={<h1>Build screen</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

const buildScreen = () => screen.queryByRole('heading', { name: 'Build screen' });

const chooseWizard = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));
};

beforeEach(() => {
  useBookStore.getState().clear();
  useCatalogFiltersStore.getState().reset();
});

describe('MagePicker', () => {
  it('sets the mage and goes to the builder', async () => {
    renderPicker();

    await chooseWizard();

    expect(useBookStore.getState().book.mageId).toBe('wizard');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(buildScreen()).toBeInTheDocument();
  });

  it('keeps the book when the player picks the same mage again', async () => {
    useBookStore.getState().loadBook({ mageId: 'wizard', counts: { [FIREBALL]: ONE_COPY } });
    renderPicker();

    await chooseWizard();

    expect(useBookStore.getState().book.counts).toEqual({ [FIREBALL]: ONE_COPY });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(buildScreen()).toBeInTheDocument();
  });
});

describe('MagePicker stats card', () => {
  it('shows the mage stats card without picking the mage', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard stats' }));

    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    expect(within(dialog).getByRole('img', { name: 'Wizard stats card' })).toBeInTheDocument();
    expect(useBookStore.getState().book.mageId).toBeNull();
    expect(buildScreen()).not.toBeInTheDocument();
  });

  it('closes the stats card', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard stats' }));
    const dialog = screen.getByRole('dialog', { name: 'Wizard stats' });

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('MagePicker switching to another mage', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook({
      mageId: 'warlock',
      counts: { [ADRAMELECHS_TORMENT]: ONE_COPY },
    });
  });

  it('asks before starting a new book, and Cancel keeps the old one', async () => {
    renderPicker();

    await chooseWizard();

    const dialog = screen.getByRole('dialog', { name: 'Start a new book?' });

    expect(dialog).toHaveTextContent('Your Warlock book has 1 card. It will be cleared.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book.mageId).toBe('warlock');
    expect(useBookStore.getState().book.counts).toEqual({ [ADRAMELECHS_TORMENT]: ONE_COPY });
    expect(buildScreen()).not.toBeInTheDocument();
  });

  it('clears the book and switches when confirmed', async () => {
    renderPicker();

    await chooseWizard();
    await userEvent.click(screen.getByRole('button', { name: 'Clear and switch' }));

    expect(useBookStore.getState().book).toEqual({ mageId: 'wizard', counts: {} });
    expect(buildScreen()).toBeInTheDocument();
  });

  it('starts the new book with no filters left from an earlier book of that mage', async () => {
    useCatalogFiltersStore
      .getState()
      .setFilters('wizard', (filters) => ({ ...filters, query: 'fire' }));
    renderPicker();

    await chooseWizard();
    await userEvent.click(screen.getByRole('button', { name: 'Clear and switch' }));

    expect(useCatalogFiltersStore.getState().filters.query).toBe('');
  });
});
