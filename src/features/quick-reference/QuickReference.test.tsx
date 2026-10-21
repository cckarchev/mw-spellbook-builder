import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { App } from '@/App';
import { letterAnchorId, termAnchorId } from '@/core/reference/anchors';
import { BACK_TO_TOP_AFTER } from '@/core/reference/foldOnScroll';
import { glossary } from '@/data/glossary';
import { APP_NAME } from '@/features/app-header/AppHeader';
import { useOpenTermStore } from '@/features/shared/glossary-text/useOpenTermStore';
import { smallSpellbook } from '@/features/shared/testSpellbooks';
import { useSpellbookStore } from '@/store/useSpellbookStore';
import { resetAppState } from '@/test/renderAppAt';
import { letterGroups } from './sortedGlossary';

const TITLE = 'Quick reference';
const SEARCH_LABEL = 'Search terms and rules';
const SCROLLED_FAR = BACK_TO_TOP_AFTER * 2;

/** Shows how the last navigation changed the history, for the test to read. */
const NavigationProbe = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  return (
    <output aria-label="Navigation">
      {`${navigationType} ${location.pathname}${location.search}`}
    </output>
  );
};

const renderAt = (path: string) => {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <NavigationProbe />
    </MemoryRouter>,
  );
};

const navigation = () => screen.getByRole('status', { name: 'Navigation' });

const reference = () => screen.queryByRole('dialog', { name: TITLE });

const openReference = async () => {
  await userEvent.click(screen.getByRole('link', { name: TITLE }));
};

const openDialog = () => screen.getByRole('dialog', { name: TITLE });

const clickBack = async () => {
  const dialog = screen.getByRole('dialog', { name: TITLE });

  await userEvent.click(within(dialog).getByRole('button', { name: 'Back' }));
};

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  Element.prototype.scrollIntoView = scrollIntoView;
  resetAppState();
  useSpellbookStore.getState().loadSpellbook(smallSpellbook);
  useOpenTermStore.setState({ openId: null });
});

describe('QuickReference', () => {
  it('opens over the builder and comes back to the same tab', async () => {
    renderAt('/wizard/spellbook');

    await openReference();

    expect(reference()).toBeInTheDocument();

    await clickBack();

    expect(reference()).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps the screen underneath inert while open', async () => {
    renderAt('/wizard/spellbook');
    const panel = screen.getByRole('tabpanel');

    await openReference();

    expect(panel.closest('[inert]')).not.toBeNull();
  });

  it('closes on Escape', async () => {
    renderAt('/wizard');

    await openReference();
    await userEvent.keyboard('{Escape}');

    expect(reference()).not.toBeInTheDocument();
  });

  it('goes to the picker from a direct open, replacing the entry', async () => {
    renderAt('/reference');

    await clickBack();

    expect(reference()).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Navigation' })).toHaveTextContent('REPLACE /');
  });

  it('leaves Back as the only way out on screen, with no second reference button', async () => {
    renderAt('/wizard');

    await openReference();
    const dialog = openDialog();

    expect(within(dialog).queryByRole('link', { name: TITLE })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: APP_NAME })).toBeInTheDocument();
  });

  it('moves focus to the title on open and back to the header button on close', async () => {
    renderAt('/wizard');
    const headerButton = screen.getByRole('link', { name: TITLE });

    await openReference();

    expect(screen.getByRole('heading', { level: 1, name: TITLE })).toHaveFocus();

    await clickBack();

    expect(headerButton).toHaveFocus();
  });

  it('closes an open glossary popover underneath on open', async () => {
    renderAt('/wizard');
    act(() => {
      useOpenTermStore.setState({ openId: 'some-term' });
    });

    await openReference();

    expect(useOpenTermStore.getState().openId).toBeNull();
  });
});

describe('QuickReference list', () => {
  it('lists every term under its letter', () => {
    renderAt('/reference');
    const dialog = openDialog();
    const letterHeadings = within(dialog).getAllByRole('heading', { level: 2 });

    expect(letterHeadings.map((heading) => heading.textContent)).toEqual(
      letterGroups.map((group) => group.letter),
    );
    expect(within(dialog).getByRole('status')).toHaveTextContent(`${glossary.length} terms`);
  });

  it('links a term inside a definition once and jumps to it', async () => {
    renderAt('/reference');
    const bashed = document.getElementById(termAnchorId('Bashed'));
    const target = document.getElementById(termAnchorId('Passage Blocked'));

    if (!(bashed && target)) {
      throw new Error('missing entries');
    }

    const links = within(bashed).getAllByRole('button', { name: 'Passage Blocked' });

    expect(links).toHaveLength(1);

    await userEvent.click(links[0] as HTMLElement);

    expect(scrollIntoView.mock.contexts).toContain(target);
  });
});

const searchField = () => within(openDialog()).getByRole('searchbox', { name: SEARCH_LABEL });

const search = async (query: string) => {
  await userEvent.type(searchField(), query);
};

describe('QuickReference search', () => {
  it('shows name matches before definition matches, highlighted', async () => {
    renderAt('/reference');

    await search('burn');

    const byName = within(openDialog()).getByRole('region', { name: /In the name/ });
    const firstTerm = within(byName).getAllByRole('term')[0];

    expect(firstTerm).toHaveTextContent(/^Burn$/);
    expect(
      within(openDialog()).getByRole('region', { name: /In the definition/ }),
    ).toBeInTheDocument();
    expect(firstTerm?.querySelector('mark')).toHaveTextContent('Burn');
  });
});

describe('QuickReference search details', () => {
  it('counts the results of each group', async () => {
    renderAt('/reference');

    await search('bashed');

    const heading = within(openDialog()).getByRole('heading', { name: 'In the name 1 result' });

    expect(heading).toBeInTheDocument();
  });

  it('keeps what was typed while the address catches up', async () => {
    renderAt('/reference');

    await search('bu');

    expect(searchField()).toHaveValue('bu');
    expect(navigation()).not.toHaveTextContent('?q=');
    await waitFor(() => {
      expect(navigation()).toHaveTextContent('REPLACE /reference?q=bu');
    });
  });

  it('goes back to the top of the list when the search changes', async () => {
    renderAt('/reference');
    const dialog = openDialog();

    Object.defineProperty(dialog, 'scrollTop', { value: SCROLLED_FAR, writable: true });
    await search('b');

    expect(dialog.scrollTop).toBe(0);
  });

  it('says when nothing matches', async () => {
    renderAt('/reference');

    await search('zzzz');

    expect(within(openDialog()).getByText('No term matches “zzzz”.')).toBeInTheDocument();
    expect(within(openDialog()).getByRole('status')).toHaveTextContent('No matches');
  });

  it('keeps the screen underneath while typing', async () => {
    renderAt('/wizard/spellbook');

    await openReference();
    await search('burn');
    await clickBack();

    expect(screen.getByRole('tab', { name: 'Spellbook' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('status', { name: 'Navigation' })).toHaveTextContent(
      'POP /wizard/spellbook',
    );
  });

  it('opens with the query from the address', () => {
    renderAt('/reference?q=burn');

    expect(searchField()).toHaveValue('burn');
  });

  it('clears the search when a term is tapped', async () => {
    renderAt('/reference');

    await search('bashed');
    const bashed = within(openDialog()).getByRole('region', { name: /In the name/ });

    await userEvent.click(within(bashed).getByRole('button', { name: 'Passage Blocked' }));

    expect(searchField()).toHaveValue('');
    expect(scrollIntoView.mock.contexts).toContain(
      document.getElementById(termAnchorId('Passage Blocked')),
    );
  });

  it('clears from the clear button', async () => {
    renderAt('/reference');

    await search('burn');
    await userEvent.click(within(openDialog()).getByRole('button', { name: 'Clear search' }));

    expect(searchField()).toHaveValue('');
    expect(within(openDialog()).getByRole('status')).toHaveTextContent(`${glossary.length} terms`);
  });
});

describe('QuickReference letters and back to top', () => {
  const letterNav = () =>
    within(openDialog()).queryByRole('navigation', { name: 'Jump to letter' });

  it('jumps to a letter', async () => {
    renderAt('/reference');
    const nav = letterNav();

    if (!nav) {
      throw new Error('missing letters');
    }

    await userEvent.click(within(nav).getByRole('button', { name: 'C' }));

    expect(scrollIntoView.mock.contexts).toContain(document.getElementById(letterAnchorId('C')));
  });

  it('hides the letters while searching', async () => {
    renderAt('/reference');

    await userEvent.type(within(openDialog()).getByRole('searchbox'), 'burn');

    expect(letterNav()).not.toBeInTheDocument();
  });

  it('goes back to the top and into the search', async () => {
    const scrollTo = vi.fn();

    Element.prototype.scrollTo = scrollTo;
    renderAt('/reference');
    const dialog = openDialog();

    Object.defineProperty(dialog, 'scrollTop', { value: SCROLLED_FAR, configurable: true });
    fireEvent.scroll(dialog);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Back to top' }));

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
    expect(within(dialog).getByRole('searchbox')).toHaveFocus();
  });
});
