import {
  LONG_TOAST_DURATION_MS,
  useToastStore,
} from "@/components/toast/useToastStore";

/** The toast after copying a link, from the Share menu or a Quick reference entry. */
export const LINK_COPIED = "Link copied";

const COPY_FAILED =
  "Could not copy. Try again, or copy the link from the address bar.";

const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
};

/**
 * Copies text to the clipboard and says so in a toast, or says how to copy it by hand. Reads the
 * toast store only when called, so a long list of copy buttons does not subscribe to it.
 */
export const copyWithToast = async (text: string, doneMessage: string) => {
  const { show } = useToastStore.getState();
  const copied = await copyText(text);

  if (!copied) {
    show(COPY_FAILED, LONG_TOAST_DURATION_MS);

    return;
  }

  show(doneMessage);
};
