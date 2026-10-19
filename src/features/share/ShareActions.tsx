import { useState } from 'react';
import { Button } from '@/components/button/Button';
import { bookText } from '@/core/export/bookText';
import type { Book, Mage } from '@/core/rules/types';
import type { BookSummary } from '@/core/rules/validateBook';
import { encodeBook } from '@/core/share-link/bookCodec';
import { shareNote } from '@/core/share-link/bookNotes';
import { getEmbedBase } from '@/core/share-link/embed';
import { buildShareUrl } from '@/core/share-link/shareUrl';
import { cardsById } from '@/data/catalog';
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

/** The share sheet on phones that have one; the copy buttons work everywhere. */
export const ShareActions = ({ book, mage, summary }: ShareActionsProps) => {
  const [status, setStatus] = useState<string | null>(null);

  const url = buildShareUrl({
    encoded: encodeBook(book),
    embedBase: getEmbedBase(),
    origin: window.location.origin,
  });
  const note = shareNote(summary);
  const canShare = typeof navigator.share === 'function';

  const copy = async (text: string, doneMessage: string) => {
    const copied = await copyText(text);

    setStatus(copied ? doneMessage : COPY_FAILED);
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
          <Button variant="primary" onClick={share}>
            Share
          </Button>
        ) : null}
        <Button variant={canShare ? 'ghost' : 'primary'} onClick={() => copy(url, 'Link copied')}>
          Copy link
        </Button>
        <Button onClick={() => copy(bookText(book, mage, summary, cardsById, url), 'Text copied')}>
          Copy text
        </Button>
      </div>
      <p className={styles.status} role="status">
        {status}
      </p>
    </section>
  );
};
