import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasUnsavedDraft, readDraft } from "@/core/persistence/drafts";
import { builderPath, PICKER_PATH } from "@/core/routing/builderPath";
import { sameSpellbook } from "@/core/rules/spellbookChanges";
import type { Spellbook } from "@/core/rules/types";
import { summarizeSpellbook } from "@/core/rules/validateSpellbook";
import { SPELLBOOK_PARAM } from "@/core/share-link/shareUrl";
import {
  type DecodedSpellbook,
  decodeSpellbook,
} from "@/core/share-link/spellbookCodec";
import {
  incomingProblems,
  noMageProblems,
} from "@/core/share-link/spellbookNotes";
import { cardsById, spellbookMage } from "@/data/catalog";
import { currentSpellbookPath } from "@/features/shared/currentSpellbookPath";
import { useSpellbookStore } from "@/store/useSpellbookStore";

const UNREADABLE =
  "This link could not be read. Your current spellbook is unchanged.";

/**
 * Where a spellbook opened from a link goes, and what to tell the player about
 * it.
 */
const openedSpellbook = ({
  spellbook,
  unknownCodes,
  unknownMage,
}: DecodedSpellbook) => {
  const mage = spellbookMage(spellbook);

  if (!mage) {
    return {
      path: PICKER_PATH,
      problems: noMageProblems(unknownMage, unknownCodes),
    };
  }

  const { issues } = summarizeSpellbook(spellbook, mage, cardsById);

  return {
    path: builderPath(mage.name, "spellbook"),
    problems: incomingProblems(
      unknownCodes,
      issues,
      mage,
      spellbook.counts,
      cardsById,
    ),
  };
};

/**
 * Whether opening the spellbook would replace unsaved work in a draft of its
 * mage.
 */
const replacesWork = (spellbook: Spellbook): boolean => {
  const { mageId } = spellbook;

  if (mageId === null || !hasUnsavedDraft(mageId)) {
    return false;
  }

  const draft = readDraft(mageId);

  return draft !== null && !sameSpellbook(draft.spellbook, spellbook);
};

/**
 * Loads the spellbook from a share link (?b=) once at startup and opens it on
 * the Spellbook tab. A draft of the link's mage with unsaved work is only
 * replaced once the player confirms it in pendingReplace; the drafts of other
 * mages are never touched. Returns the problems found in the link's spellbook,
 * for the player to see, until dismissed.
 */
export const useIncomingSpellbook = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loadSpellbook = useSpellbookStore((state) => state.loadSpellbook);
  const handled = useRef(false);

  const [problems, setProblems] = useState<string[]>([]);
  const [pendingReplace, setPendingReplace] = useState<DecodedSpellbook | null>(
    null,
  );

  const open = (decoded: DecodedSpellbook) => {
    const { path, problems: found } = openedSpellbook(decoded);

    loadSpellbook(decoded.spellbook);
    setProblems(found);
    navigate(path, { replace: true });
  };

  useEffect(() => {
    const encoded = new URLSearchParams(location.search).get(SPELLBOOK_PARAM);

    if (handled.current || encoded === null) {
      return;
    }

    handled.current = true;

    const decoded = decodeSpellbook(encoded);
    const current = useSpellbookStore.getState().spellbook;

    if (!decoded) {
      setProblems([UNREADABLE]);
      navigate(currentSpellbookPath(current, "cards"), { replace: true });

      return;
    }

    if (replacesWork(decoded.spellbook)) {
      // The current spellbook stays on screen while the player decides.
      setPendingReplace(decoded);
      navigate(currentSpellbookPath(current, "spellbook"), { replace: true });

      return;
    }

    open(decoded);
  });

  const confirmReplace = () => {
    if (pendingReplace) {
      open(pendingReplace);
    }

    setPendingReplace(null);
  };

  const cancelReplace = () => {
    setPendingReplace(null);
  };

  const dismiss = () => {
    setProblems([]);
  };

  return { problems, dismiss, pendingReplace, confirmReplace, cancelReplace };
};
