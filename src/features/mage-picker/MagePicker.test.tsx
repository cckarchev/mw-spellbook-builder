import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FIREBALL } from '@/features/shared/testBooks';
import { useBookStore } from '@/store/useBookStore';
import { MagePicker } from './MagePicker';

/** A "Warlock Only" card, illegal for every other mage. */
const ADRAMELECHS_TORMENT = '9e7cbef4-1ad9-46cf-95c0-1aafd656c85d';
const ONE_COPY = 1;
const RULES_QUESTION_COUNT = 3;

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

const chooseWizard = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Wizard' }));
};

beforeEach(() => {
  useBookStore.getState().clear();
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

describe('MagePicker rules questions', () => {
  it('lists the rules still being checked below the mages', () => {
    renderPicker();

    const box = screen.getByRole('region', { name: 'Rules we are still checking' });

    expect(within(box).getAllByRole('listitem')).toHaveLength(RULES_QUESTION_COUNT);
    expect(box).toHaveTextContent('Death Ring (Necromancer Only)');
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
});
