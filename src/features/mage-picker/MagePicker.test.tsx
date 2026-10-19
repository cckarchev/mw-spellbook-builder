import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

describe('MagePicker switching mage', () => {
  beforeEach(() => {
    useBookStore.getState().loadBook({
      mageId: 'warlock',
      schoolChoice: null,
      counts: { [ADRAMELECHS_TORMENT]: ONE_COPY },
    });
  });

  it('names the cards the new mage cannot use, and Cancel keeps the old mage', async () => {
    renderPicker();

    await chooseWizardFire();

    const dialog = screen.getByRole('dialog', { name: 'Remove cards?' });

    expect(within(dialog).getByText("Adramelech's Torment")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(useBookStore.getState().book.mageId).toBe('warlock');
    expect(useBookStore.getState().book.counts).toEqual({ [ADRAMELECHS_TORMENT]: ONE_COPY });
    expect(buildScreen()).not.toBeInTheDocument();
  });

  it('removes those cards and switches when confirmed', async () => {
    renderPicker();

    await chooseWizardFire();
    await userEvent.click(screen.getByRole('button', { name: 'Remove and switch' }));

    expect(useBookStore.getState().book.mageId).toBe('wizard');
    expect(useBookStore.getState().book.counts).toEqual({});
    expect(buildScreen()).toBeInTheDocument();
  });
});
