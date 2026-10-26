import type { Location } from "react-router-dom";

export const REFERENCE_PATH = "/reference";
export const QUERY_PARAM = "q";

/** Navigation state of the Quick reference: the screen it was opened over. */
export interface ReferenceState {
  background: Location;
}

export const referenceState = (background: Location): ReferenceState => ({
  background,
});

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * The screen underneath the Quick reference, or null when it was opened
 * directly.
 */
export const backgroundOf = (state: unknown): Location | null => {
  if (!isObject(state)) {
    return null;
  }

  const { background } = state;

  if (!isObject(background) || typeof background.pathname !== "string") {
    return null;
  }

  return background as unknown as Location;
};
