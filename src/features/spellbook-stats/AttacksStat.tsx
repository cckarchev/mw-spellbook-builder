import { BarList } from '@/components/bar-list/BarList';
import { SplitBar } from '@/components/split-bar/SplitBar';
import type { AttackStats } from '@/core/stats/types';
import styles from './SpellbookStats.module.css';

/** Melee against ranged, then copies per damage type, or a line saying there are none. */
export const AttacksStat = ({ attacks }: { attacks: AttackStats }) => {
  const reaches = [
    { label: 'Melee', count: attacks.melee },
    { label: 'Ranged', count: attacks.ranged },
  ].filter((reach) => reach.count > 0);

  if (attacks.damageTypes.length === 0) {
    return <p className={styles.note}>No attacks.</p>;
  }

  const damageRows = attacks.damageTypes.map((row) => ({ label: row.label, value: row.count }));

  return (
    <>
      {reaches.length > 0 ? <SplitBar parts={reaches} label="Melee and ranged" /> : null}
      <BarList rows={damageRows} label="Damage types" />
    </>
  );
};
