import { LONG_TOAST_DURATION_MS, useToastStore } from '@/components/toast/useToastStore';
import { bookText } from '@/core/export/bookText';
import { builderPath } from '@/core/routing/builderPath';
import type { Book, Mage } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';
import { encodeBook } from '@/core/share-link/bookCodec';
import { getEmbedBase } from '@/core/share-link/embed';
import { buildShareUrl } from '@/core/share-link/shareUrl';
import { cardsById } from '@/data/catalog';
import { ActionMenu, type ActionMenuItem } from '@/features/shared/action-menu/ActionMenu';
import { CopyIcon, LinkIcon, ShareIcon } from './Icons';

interface ShareActionsProps {
  book: Book;
  mage: Mage;
  summary: BookSummary;
}

const COPY_FAILED = 'Could not copy. Try again, or copy the link from the address bar.';

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
};

/** The Share menu: the share sheet on phones that have one; the copy items work everywhere. */
export const ShareActions = ({ book, mage, summary }: ShareActionsProps) => {
  const showToast = useToastStore((state) => state.show);

  const url = buildShareUrl({
    encoded: encodeBook(book),
    embedBase: getEmbedBase(),
    origin: window.location.origin,
    magePath: builderPath(mage.name, 'cards'),
  });
  const canShare = typeof navigator.share === 'function';

  const copy = async (text: string, doneMessage: string) => {
    const copied = await copyText(text);

    if (!copied) {
      showToast(COPY_FAILED, LONG_TOAST_DURATION_MS);

      return;
    }

    showToast(doneMessage);
  };

  const share = async () => {
    try {
      await navigator.share({ title: `${mage.name} spellbook`, url });
    } catch {
      // The player closed the share sheet; nothing to report.
    }
  };

  const shareItem: ActionMenuItem = { label: 'Share…', icon: <ShareIcon />, onSelect: share };
  const copyItems: ActionMenuItem[] = [
    { label: 'Copy link', icon: <LinkIcon />, onSelect: () => copy(url, 'Link copied') },
    {
      label: 'Copy text',
      icon: <CopyIcon />,
      onSelect: () => copy(bookText(book, mage, summary, cardsById, url), 'Text copied'),
    },
  ];
  const items = canShare ? [shareItem, ...copyItems] : copyItems;

  return <ActionMenu icon={<ShareIcon />} label="Share" primary={true} items={items} />;
};
