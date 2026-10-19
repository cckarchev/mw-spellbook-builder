import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
        <Route path="/build" element={<h1>Build screen</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

const buildScreen = () => screen.queryByRole('heading', { name: 'Build screen' });

const chooseWizardFire = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));
  await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
};

beforeEach(() => {
  useBookStore.getState().clear();
});

describe('MagePicker', () => {
  it('sets a mage without a choice and goes to the builder', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Warlock' }));

    expect(useBookStore.getState().book.mageId).toBe('warlock');
    expect(useBookStore.getState().book.schoolChoice).toBeNull();
    expect(buildScreen()).toBeInTheDocument();
  });

  it('asks the Wizard for an element before going to the builder', async () => {
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));

    const dialog = screen.getByRole('dialog', { name: 'Choose a school' });
    const schools = within(dialog)
      .getAllByRole('button')
      .map((button) => button.textContent)
      .filter((label) => label !== 'Cancel');

    expect(schools).toEqual(['Air', 'Earth', 'Fire', 'Water']);
    expect(buildScreen()).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Fire' }));

    expect(useBookStore.getState().book.mageId).toBe('wizard');
    expect(useBookStore.getState().book.schoolChoice).toBe('Fire');
    expect(buildScreen()).toBeInTheDocument();
  });
});

describe('MagePicker switching to another mage', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook({
      mageId: 'warlock',
      schoolChoice: null,
      counts: { [ADRAMELECHS_TORMENT]: ONE_COPY },
    });
  });

  it('asks before starting a new book, and Cancel keeps the old one', async () => {
    renderPicker();

    await chooseWizardFire();

    const dialog = screen.getByRole('dialog', { name: 'Start a new book?' });

    expect(dialog).toHaveTextContent('Your Warlock book has 1 card. It will be cleared.');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book.mageId).toBe('warlock');
    expect(useBookStore.getState().book.counts).toEqual({ [ADRAMELECHS_TORMENT]: ONE_COPY });
    expect(buildScreen()).not.toBeInTheDocument();
  });

  it('clears the book and switches when confirmed', async () => {
    renderPicker();

    await chooseWizardFire();
    await userEvent.click(screen.getByRole('button', { name: 'Clear and switch' }));

    expect(useBookStore.getState().book).toEqual({
      mageId: 'wizard',
      schoolChoice: 'Fire',
      counts: {},
    });
    expect(buildScreen()).toBeInTheDocument();
  });
});

describe('MagePicker changing the Wizard school', () => {
  it('keeps the cards the new school can still use, without asking', async () => {
    useBookStore.getState().loadBook({
      mageId: 'wizard',
      schoolChoice: 'Fire',
      counts: { [FIREBALL]: ONE_COPY },
    });
    renderPicker();

    await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    await userEvent.click(screen.getByRole('button', { name: 'Air' }));

    expect(useBookStore.getState().book).toEqual({
      mageId: 'wizard',
      schoolChoice: 'Air',
      counts: { [FIREBALL]: ONE_COPY },
    });
    expect(buildScreen()).toBeInTheDocument();
  });
});
