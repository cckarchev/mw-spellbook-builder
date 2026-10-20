import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { readDraft } from '@/core/persistence/drafts';
import { useCatalogFiltersStore } from '@/features/catalog/useCatalogFilters';
import { FIREBALL, resetBookStore } from '@/features/shared/testBooks';
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
  resetBookStore();
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

  it('opens the other mage without asking and keeps the old book as its draft', async () => {
    renderPicker();

    await chooseWizard();

    const warlockDraft = readDraft('warlock');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useBookStore.getState().book).toEqual({ mageId: 'wizard', counts: {} });
    expect(warlockDraft?.book.counts).toEqual({ [ADRAMELECHS_TORMENT]: ONE_COPY });
    expect(buildScreen()).toBeInTheDocument();
  });
});
