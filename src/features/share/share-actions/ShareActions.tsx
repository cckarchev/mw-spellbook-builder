import { spellbookText } from "@/core/export/spellbookText";
import { builderPath } from "@/core/routing/builderPath";
import type { Mage, Spellbook } from "@/core/rules/types";
import type { SpellbookSummary } from "@/core/rules/validateSpellbook";
import { buildShareUrl } from "@/core/share-link/shareUrl";
import { encodeSpellbook } from "@/core/share-link/spellbookCodec";
import { cardsById } from "@/data/catalog";
import {
  ActionMenu,
  type ActionMenuItem,
} from "@/features/shared/action-menu/ActionMenu";
import { copyWithToast, LINK_COPIED } from "@/features/shared/copyWithToast";
import { LinkIcon } from "@/features/shared/LinkIcon";
import { CopyIcon, ShareIcon } from "./Icons";

interface ShareActionsProps {
  spellbook: Spellbook;
  mage: Mage;
  summary: SpellbookSummary;
}

/**
 * The Share menu: the share sheet on phones that have one; the copy items work
 * everywhere.
 */
export const ShareActions = ({
  spellbook,
  mage,
  summary,
}: ShareActionsProps) => {
  const url = buildShareUrl({
    encoded: encodeSpellbook(spellbook),
    origin: window.location.origin,
    magePath: builderPath(mage.name, "cards"),
  });
  const canShare = typeof navigator.share === "function";

  const share = async () => {
    try {
      await navigator.share({ title: `${mage.name} spellbook`, url });
    } catch {
      // The player closed the share sheet; nothing to report.
    }
  };

  const shareItem: ActionMenuItem = {
    label: "Share…",
    icon: <ShareIcon />,
    onSelect: share,
  };
  const copyItems: ActionMenuItem[] = [
    {
      label: "Copy link",
      icon: <LinkIcon />,
      onSelect: () => copyWithToast(url, LINK_COPIED),
    },
    {
      label: "Copy text",
      icon: <CopyIcon />,
      onSelect: () =>
        copyWithToast(
          spellbookText(spellbook, mage, summary, cardsById, url),
          "Text copied",
        ),
    },
  ];
  const items = canShare ? [shareItem, ...copyItems] : copyItems;

  return (
    <ActionMenu
      icon={<ShareIcon />}
      label="Share"
      primary={true}
      items={items}
    />
  );
};
