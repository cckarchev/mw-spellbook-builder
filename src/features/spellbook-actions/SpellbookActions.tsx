import { ClearAction } from "./clear-action/ClearAction";
import { LoadAction } from "./load-action/LoadAction";
import styles from "./SpellbookActions.module.css";
import { SaveAction } from "./save-action/SaveAction";

/** Save the spellbook under a name, load a saved one, or clear it. */
export const SpellbookActions = () => (
  <section className={styles.actions} aria-label="Save and load">
    <SaveAction />
    <LoadAction />
    <ClearAction />
  </section>
);
