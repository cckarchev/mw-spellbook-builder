/** Query param carrying an encoded spellbook in a share link. */
export const SPELLBOOK_PARAM = 'b';

interface ShareUrlInput {
  /** The spellbook, already encoded with encodeSpellbook. */
  encoded: string;
  /** The embedding club page, or null when the builder runs standalone. */
  embedBase: string | null;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
  /** The spellbook's mage in this app, such as "/wizard". */
  magePath: string;
}

/**
 * The link the Share button copies. Embedded, it points back at the club page, which
 * re-embeds the builder with the spellbook. Standalone, it points at the spellbook's mage in this app's builder.
 */
export const buildShareUrl = ({ encoded, embedBase, origin, magePath }: ShareUrlInput): string => {
  const url = new URL(embedBase ?? `${origin}${magePath}`);

  url.searchParams.set(SPELLBOOK_PARAM, encoded);

  return url.toString();
};
