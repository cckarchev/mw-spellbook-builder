import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/toast/Toast';
import { LONG_TOAST_DURATION_MS, useToastStore } from '@/components/toast/useToastStore';
import { bookText } from '@/core/export/bookText';
import { builderPath } from '@/core/routing/paths';
import type { Book } from '@/core/rules/types';
import { summarizeBook } from '@/core/rules/validateBook';
import { encodeBook } from '@/core/share-link/bookCodec';
import { buildShareUrl } from '@/core/share-link/shareUrl';
import { cardsById } from '@/data/catalog';
import { overBudgetBook, smallBook, wizard } from '@/features/shared/testBooks';
import { ShareActions } from './ShareActions';

const shareUrlOf = (book: Book): string =>
  buildShareUrl({
    encoded: encodeBook(book),
    embedBase: null,
    origin: window.location.origin,
    magePath: builderPath(wizard.name, 'cards'),
  });

// The toast store outlives each render, so every test starts with no message.
beforeEach(() => {
  useToastStore.getState().hide();
});

const renderActions = (book: Book) => {
  const user = userEvent.setup();
  const summary = summarizeBook(book, wizard, cardsById);

  render(
    <>
      <ShareActions book={book} mage={wizard} summary={summary} />
      <Toast />
    </>,
  );

  return { user, summary };
};

describe('ShareActions copying', () => {
  it('copies the share link', async () => {
    const { user } = renderActions(smallBook);

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(await navigator.clipboard.readText()).toBe(shareUrlOf(smallBook));
    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
  });

  it('copies the book as text', async () => {
    const { user, summary } = renderActions(smallBook);

    await user.click(screen.getByRole('button', { name: 'Copy text' }));

    const expected = bookText(smallBook, wizard, summary, cardsById, shareUrlOf(smallBook));

    expect(await navigator.clipboard.readText()).toBe(expected);
    expect(screen.getByRole('status')).toHaveTextContent('Text copied');
  });

  it('says how to copy by hand, for longer, when the clipboard fails', async () => {
    const { user } = renderActions(smallBook);

    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(screen.getByRole('status')).toHaveTextContent('copy the link from the address bar');
    expect(useToastStore.getState().durationMs).toBe(LONG_TOAST_DURATION_MS);
  });

  it('still copies an over-budget book, with a note', async () => {
    const { user } = renderActions(overBudgetBook);

    expect(screen.getByText('Not a legal book yet: 2 points over')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(await navigator.clipboard.readText()).toBe(shareUrlOf(overBudgetBook));

    await user.click(screen.getByRole('button', { name: 'Copy text' }));

    expect(await navigator.clipboard.readText()).toContain('122/120 pts (2 over)');
  });
});

describe('ShareActions with the Web Share API', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'share');
  });

  it('offers the system share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', { value: share, configurable: true });

    const { user } = renderActions(smallBook);

    await user.click(screen.getByRole('button', { name: 'Share' }));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Wizard spellbook', url: shareUrlOf(smallBook) }),
    );
  });

  it('has no Share button without the API', () => {
    renderActions(smallBook);

    expect(screen.queryByRole('button', { name: 'Share' })).not.toBeInTheDocument();
  });
});
