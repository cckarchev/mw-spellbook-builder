import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toast } from "@/components/toast/Toast";
import {
  PICKER_PATH,
  SPELLBOOK_SEGMENT,
  STATS_SEGMENT,
} from "@/core/routing/builderPath";
import { Builder } from "@/features/builder/Builder";
import { MagePicker } from "@/features/mage-picker/MagePicker";
import { QuickReference } from "@/features/quick-reference/QuickReference";
import { IncomingLink } from "@/features/share/IncomingLink";
import { useReferenceRoute } from "@/features/shared/useReferenceRoute";
import { Layout } from "@/layout/Layout";

/**
 * While the Quick reference is open, the routes keep showing the screen it was opened over, or
 * the mage picker without one, so going back finds that screen as the player left it.
 */
export const App = () => {
  const location = useLocation();
  const { isOpen, background } = useReferenceRoute();
  const shown = isOpen ? (background ?? PICKER_PATH) : location;

  return (
    <>
      <div inert={isOpen}>
        <Routes location={shown}>
          <Route element={<Layout />}>
            <Route index={true} element={<MagePicker />} />
            <Route path=":mageSlug" element={<Builder tab="cards" />} />
            <Route
              path={`:mageSlug/${SPELLBOOK_SEGMENT}`}
              element={<Builder tab="spellbook" />}
            />
            <Route
              path={`:mageSlug/${STATS_SEGMENT}`}
              element={<Builder tab="stats" />}
            />
            <Route
              path="*"
              element={<Navigate to={PICKER_PATH} replace={true} />}
            />
          </Route>
        </Routes>
      </div>
      {isOpen ? <QuickReference /> : null}
      <IncomingLink />
      <Toast />
    </>
  );
};
