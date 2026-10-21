import { useState } from "react";
import { Dialog } from "@/components/dialog/Dialog";
import { ExternalLink } from "@/components/external-link/ExternalLink";
import { RULES_DOCUMENTS } from "@/data/rulesDocuments";
import styles from "./AppFooter.module.css";

const ARCANE_WONDERS_URL = "https://www.arcanewonders.com/";
const MAGE_WARS_ARENA_URL =
  "https://www.arcanewonders.com/product/mage-wars-arena/";

/** The disclaimer at the bottom of every page, with the full notice one tap away. */
export const AppFooter = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const openAbout = () => {
    setIsAboutOpen(true);
  };

  const closeAbout = () => {
    setIsAboutOpen(false);
  };

  return (
    <footer className={styles.footer}>
      <p>Unofficial fan project. Not affiliated with Arcane Wonders.</p>
      {RULES_DOCUMENTS.map((rulesDocument) => (
        <ExternalLink
          key={rulesDocument.url}
          className={styles.link}
          href={rulesDocument.url}
        >
          {rulesDocument.label}
        </ExternalLink>
      ))}
      <button type="button" className={styles.link} onClick={openAbout}>
        About
      </button>
      <Dialog
        open={isAboutOpen}
        title="About this site"
        onClose={closeAbout}
        closeButton={true}
      >
        <div className={styles.notice}>
          <p>
            Mage Wars Spellbook Builder is an unofficial, free fan project. It
            is not affiliated with, endorsed, sponsored or approved by Arcane
            Wonders.
          </p>
          <p>
            Mage Wars, the card names, card text and card images are trademarks
            and copyrights of Arcane Wonders, used here only to help players
            build their spellbooks.
          </p>
          <p>
            The card data and images come from the community OCTGN Mage Wars
            module and card image pack, and the expansion names from the
            sIKE23/Mage-Wars set files. The glossary comes from the Mage Wars
            Codex.
          </p>
          <p>
            The rulebook, Codex and rules supplement are published by Arcane
            Wonders on its own site; the links open them there.
          </p>
          <p>
            More about the game at{" "}
            <ExternalLink href={MAGE_WARS_ARENA_URL}>
              Mage Wars Arena
            </ExternalLink>{" "}
            on the{" "}
            <ExternalLink href={ARCANE_WONDERS_URL}>
              Arcane Wonders
            </ExternalLink>{" "}
            site.
          </p>
        </div>
      </Dialog>
    </footer>
  );
};
