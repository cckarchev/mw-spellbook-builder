import type { Location } from "react-router-dom";
import { backgroundOf, referenceState } from "./referencePath";

describe("referencePath", () => {
  it("reads the screen underneath from navigation state", () => {
    const background: Location = {
      pathname: "/wizard",
      search: "",
      hash: "",
      state: null,
      key: "k",
    };

    expect(backgroundOf(referenceState(background))).toEqual(background);
  });

  it("reads anything else as no screen underneath", () => {
    expect(backgroundOf(null)).toBeNull();
    expect(backgroundOf({})).toBeNull();
    expect(backgroundOf({ background: "wizard" })).toBeNull();
    expect(backgroundOf({ background: { pathname: 3 } })).toBeNull();
  });
});
