import { BarList } from "@/components/bar-list/BarList";
import { SplitBar } from "@/components/split-bar/SplitBar";
import type { AttackStats } from "@/core/stats/types";
import { countBars } from "./countBars";
import { StatNote } from "./stat-note/StatNote";

/**
 * Melee against ranged, then copies per damage type, or a line saying there are
 * none.
 */
export const AttacksStat = ({ attacks }: { attacks: AttackStats }) => {
  const reaches = [
    { label: "Melee", count: attacks.melee },
    { label: "Ranged", count: attacks.ranged },
  ].filter((reach) => reach.count > 0);

  if (attacks.damageTypes.length === 0) {
    return <StatNote>No attacks.</StatNote>;
  }

  return (
    <>
      {reaches.length > 0 ? (
        <SplitBar parts={reaches} label="Melee and ranged" />
      ) : null}
      <BarList rows={countBars(attacks.damageTypes)} label="Damage types" />
    </>
  );
};
