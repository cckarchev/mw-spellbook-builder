/** Query param carrying an encoded spellbook in a share link. */
export const SPELLBOOK_PARAM = 'b';

interface ShareUrlInput {
  /** The spellbook, already encoded with encodeSpellbook. */
  encoded: string;
  /** This app's own origin, such as window.location.origin. */
  origin: string;
  /** The spellbook's mage in this app, such as "/wizard". */
  magePath: string;
}

/** The link the Share button copies: the spellbook's mage in this app's builder. */
export const buildShareUrl = ({ encoded, origin, magePath }: ShareUrlInput): string => {
  const url = new URL(`${origin}${magePath}`);

  url.searchParams.set(SPELLBOOK_PARAM, encoded);

  return url.toString();
};
