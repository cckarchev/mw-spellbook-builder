import { useNavigate } from "react-router-dom";
import { builderPath } from "@/core/routing/builderPath";
import type { Mage } from "@/core/rules/types";
import { useSpellbookStore } from "@/store/useSpellbookStore";

/**
 * Opens the builder on the mage's draft; the spellbook left behind stays as its
 * own mage's draft.
 */
export const useMageSwitch = () => {
  const navigate = useNavigate();
  const spellbook = useSpellbookStore((state) => state.spellbook);
  const openMage = useSpellbookStore((state) => state.openMage);

  const selectMage = (mage: Mage) => {
    openMage(mage.id);
    navigate(builderPath(mage.name, "cards"));
  };

  return { spellbook, selectMage };
};
