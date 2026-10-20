import { useId } from 'react';
import { mageImage } from '@/core/catalog/mageImage';
import type { Mage } from '@/core/rules/types';
import type { MageBadge } from '@/core/text/mageBadge';
import { MageStats } from '@/features/shared/mage-stats/MageStats';
import { AsteriskIcon } from './AsteriskIcon';
import styles from './MageTile.module.css';

interface MageTileProps {
  mage: Mage;
  /** The mage of the spellbook being built. */
  current: boolean;
  /** What the mage already has: a draft, saved spellbooks, or null for nothing. */
  badge: MageBadge | null;
  onSelect: (mage: Mage) => void;
  /** Opens the mage's saved spellbooks, from the badge when it counts them. */
  onOpenSaved: (mage: Mage) => void;
}

/** The badge opens the saved spellbooks when there are any, or else the mage and its draft. */
const badgeLabel = (mage: Mage, badge: MageBadge): string =>
  badge.hasSaved ? `Load a saved ${mage.name} spellbook` : `Continue the ${mage.name} draft`;

export const MageTile = ({ mage, current, badge, onSelect, onOpenSaved }: MageTileProps) => {
  const image = mageImage(mage);
  const descriptionId = useId();

  const openBadge = () => {
    if (badge?.hasSaved) {
      onOpenSaved(mage);

      return;
    }

    onSelect(mage);
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.tile}
        aria-current={current ? 'true' : undefined}
        // Named by the mage alone; what the badge means is its description.
        aria-label={mage.name}
        aria-describedby={badge === null ? undefined : descriptionId}
        onClick={() => onSelect(mage)}
      >
        {image ? <img className={styles.image} src={image} alt="" loading="lazy" /> : null}
        <span className={styles.name}>{mage.name}</span>
        {badge === null ? null : (
          <span id={descriptionId} hidden={true}>
            {badge.description}
          </span>
        )}
      </button>
      {/* Siblings, not inside the tile, so the stats and the saved spellbooks open without picking the mage. */}
      {badge === null ? null : (
        <button
          type="button"
          className={styles.badge}
          data-draft={badge.hasDraft}
          aria-label={badgeLabel(mage, badge)}
          title={badge.description}
          onClick={openBadge}
        >
          {badge.hasSaved ? badge.savedCount : <AsteriskIcon />}
        </button>
      )}
      <MageStats mage={mage} className={styles.stats} />
    </div>
  );
};
