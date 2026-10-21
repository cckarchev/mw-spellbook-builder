import { useCallback } from "react";
import { type Location, useLocation, useNavigate } from "react-router-dom";
import { PICKER_PATH } from "@/core/routing/builderPath";
import { backgroundOf, REFERENCE_PATH } from "@/core/routing/referencePath";

const ONE_STEP_BACK = -1;

interface ReferenceRoute {
  isOpen: boolean;
  /** The screen the Quick reference was opened over, or null when it was opened directly. */
  background: Location | null;
  /** Back to the screen underneath, or to the mage picker without one. */
  close: () => void;
}

/**
 * Whether the Quick reference is open. Inside the app's routes the location is the screen
 * underneath, so there it always reads closed.
 */
export const useReferenceRoute = (): ReferenceRoute => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOpen = location.pathname === REFERENCE_PATH;
  const background = isOpen ? backgroundOf(location.state) : null;
  const hasBackground = background !== null;

  const close = useCallback(() => {
    if (hasBackground) {
      navigate(ONE_STEP_BACK);

      return;
    }

    navigate(PICKER_PATH, { replace: true });
  }, [hasBackground, navigate]);

  return { isOpen, background, close };
};
