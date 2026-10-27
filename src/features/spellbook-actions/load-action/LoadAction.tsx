import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { ActionButton } from "@/features/shared/action-button/ActionButton";
import { LoadDialog } from "@/features/shared/load-dialog/LoadDialog";
import { LoadIcon } from "../Icons";
import { useSavedSpellbooks } from "./useSavedSpellbooks";

const LOAD_TITLE = "Load spellbook";

/**
 * The Load button, the official and saved spellbooks, and the questions before
 * replacing or deleting one.
 */
export const LoadAction = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const spellbooks = useSavedSpellbooks(close);
  const isConfirming =
    spellbooks.pendingLoad !== null || spellbooks.pendingDelete !== null;

  const open = () => {
    spellbooks.refresh();
    setIsOpen(true);
  };

  return (
    <>
      <ActionButton icon={<LoadIcon />} label="Load" onClick={open} />
      {/* The list steps aside while a confirm asks, so only one dialog is open
          at a time. */}
      <LoadDialog
        open={isOpen && !isConfirming}
        title={LOAD_TITLE}
        saved={spellbooks.saved}
        onLoad={spellbooks.requestLoad}
        onDelete={spellbooks.requestDelete}
        official={spellbooks.official}
        onLoadOfficial={spellbooks.requestLoadOfficial}
        onClose={close}
      />
      <ConfirmDialog
        open={spellbooks.pendingLoad !== null}
        title="Replace current spellbook?"
        body={<p>Unsaved changes will be lost.</p>}
        confirmLabel="Replace"
        onConfirm={spellbooks.confirmLoad}
        onCancel={spellbooks.cancelLoad}
      />
      <ConfirmDialog
        open={spellbooks.pendingDelete !== null}
        title={`Delete "${spellbooks.pendingDelete ?? ""}"?`}
        body={<p>This saved spellbook will be removed permanently.</p>}
        confirmLabel="Delete"
        onConfirm={spellbooks.confirmDelete}
        onCancel={spellbooks.cancelDelete}
      />
    </>
  );
};
