import { termLink } from '@/core/reference/anchors';
import { copyWithToast } from '@/features/shared/copyWithToast';
import { LinkIcon } from '@/features/shared/LinkIcon';
import styles from './Entry.module.css';

const LINK_COPIED = 'Link copied';

/** Copies the link straight to a term, to share it in a chat. */
export const CopyLinkButton = ({ term }: { term: string }) => {
  const copyLink = () => copyWithToast(termLink(window.location.origin, term), LINK_COPIED);

  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={`Copy link to ${term}`}
      title="Copy link"
      onClick={copyLink}
    >
      <LinkIcon />
    </button>
  );
};
