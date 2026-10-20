import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '@/components/toast/Toast';
import { LONG_TOAST_DURATION_MS, useToastStore } from '@/components/toast/useToastStore';
import { spellbookText } from '@/core/export/spellbookText';
import { builderPath } from '@/core/routing/builderPath';
import type { Spellbook } from '@/core/rules/types';
import { summarizeSpellbook } from '@/core/rules/validateSpellbook';
import { buildShareUrl } from '@/core/share-link/shareUrl';
import { encodeSpellbook } from '@/core/share-link/spellbookCodec';
import { cardsById } from '@/data/catalog';
import { overBudgetSpellbook, smallSpellbook, wizard } from '@/features/shared/testSpellbooks';
import { ShareActions } from './ShareActions';

const shareUrlOf = (spellbook: Spellbook): string =>
  buildShareUrl({
    encoded: encodeSpellbook(spellbook),
    embedBase: null,
    origin: window.location.origin,
    magePath: builderPath(wizard.name, 'cards'),
  });

// The toast store outlives each render, so every test starts with no message.
beforeEach(() => {
  useToastStore.getState().hide();
});

/** Opens the Share menu and picks the item. */
const pick = async (user: ReturnType<typeof userEvent.setup>, item: string) => {
  await user.click(screen.getByRole('button', { name: 'Share' }));
  await user.click(screen.getByRole('menuitem', { name: item }));
};

const renderActions = (spellbook: Spellbook) => {
  const user = userEvent.setup();
  const summary = summarizeSpellbook(spellbook, wizard, cardsById);

  render(
    <>
      <ShareActions spellbook={spellbook} mage={wizard} summary={summary} />
      <Toast />
    </>,
  );

  return { user, summary };
};

describe('ShareActions copying', () => {
  it('copies the share link', async () => {
    const { user } = renderActions(smallSpellbook);

    await pick(user, 'Copy link');

    expect(await navigator.clipboard.readText()).toBe(shareUrlOf(smallSpellbook));
    expect(screen.getByRole('status')).toHaveTextContent('Link copied');
  });

  it('copies the spellbook as text', async () => {
    const { user, summary } = renderActions(smallSpellbook);

    await pick(user, 'Copy text');

    const expected = spellbookText(
      smallSpellbook,
      wizard,
      summary,
      cardsById,
      shareUrlOf(smallSpellbook),
    );

    expect(await navigator.clipboard.readText()).toBe(expected);
    expect(screen.getByRole('status')).toHaveTextContent('Text copied');
  });

  it('says how to copy by hand, for longer, when the clipboard fails', async () => {
    const { user } = renderActions(smallSpellbook);

    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    await pick(user, 'Copy link');

    expect(screen.getByRole('status')).toHaveTextContent('copy the link from the address bar');
    expect(useToastStore.getState().durationMs).toBe(LONG_TOAST_DURATION_MS);
  });

  it('still copies an over-budget spellbook', async () => {
    const { user } = renderActions(overBudgetSpellbook);

    await pick(user, 'Copy link');

    expect(await navigator.clipboard.readText()).toBe(shareUrlOf(overBudgetSpellbook));

    await pick(user, 'Copy text');

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

    const { user } = renderActions(smallSpellbook);

    await pick(user, 'Share…');

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Wizard spellbook', url: shareUrlOf(smallSpellbook) }),
    );
  });

  it('has no share sheet item without the API', async () => {
    const { user } = renderActions(smallSpellbook);

    await user.click(screen.getByRole('button', { name: 'Share' }));

    expect(screen.queryByRole('menuitem', { name: 'Share…' })).not.toBeInTheDocument();
  });
});
