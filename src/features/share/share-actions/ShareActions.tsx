import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import { LONG_TOAST_DURATION_MS, useToastStore } from '@/components/toast/useToastStore';
import { bookText } from '@/core/export/bookText';
import { builderPath } from '@/core/routing/paths';
import type { Book, Mage } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';
import { encodeBook } from '@/core/share-link/bookCodec';
import { shareNote } from '@/core/share-link/bookNotes';
import { getEmbedBase } from '@/core/share-link/embed';
import { buildShareUrl } from '@/core/share-link/shareUrl';
import { cardsById } from '@/data/catalog';
import { CopyIcon, LinkIcon, ShareIcon } from './Icons';
import styles from './ShareActions.module.css';

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

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  primary: boolean;
  onClick: () => void;
}

/** A small icon button; the label shows beside the icon above phone width, and as a tooltip. */
const ActionButton = ({ icon, label, primary, onClick }: ActionButtonProps) => (
  <Button
    variant={primary ? 'primary' : 'ghost'}
    size="small"
    className={styles.action}
    aria-label={label}
    title={label}
    onClick={onClick}
  >
    {icon}
    <span className={styles.label}>{label}</span>
  </Button>
);

/** The share sheet on phones that have one; the copy buttons work everywhere. */
export const ShareActions = ({ book, mage, summary }: ShareActionsProps) => {
  const showToast = useToastStore((state) => state.show);

  const url = buildShareUrl({
    encoded: encodeBook(book),
    embedBase: getEmbedBase(),
    origin: window.location.origin,
    magePath: builderPath(mage.name, 'cards'),
  });
  const note = shareNote(summary);
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

  return (
    <section className={styles.actions} aria-label="Share">
      {note ? <p className={styles.note}>{note}</p> : null}
      <div className={styles.buttons}>
        {canShare ? (
          <ActionButton icon={<ShareIcon />} label="Share" primary={true} onClick={share} />
        ) : null}
        <ActionButton
          icon={<LinkIcon />}
          label="Copy link"
          primary={!canShare}
          onClick={() => copy(url, 'Link copied')}
        />
        <ActionButton
          icon={<CopyIcon />}
          label="Copy text"
          primary={false}
          onClick={() => copy(bookText(book, mage, summary, cardsById, url), 'Text copied')}
        />
      </div>
    </section>
  );
};
