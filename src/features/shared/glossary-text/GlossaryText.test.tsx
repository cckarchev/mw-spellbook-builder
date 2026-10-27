import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { glossary } from "@/data/glossary";
import { Definition } from "./Definition";
import { GlossaryText } from "./GlossaryText";

const ATTACK_BAR =
  "Ranged | Lightning | 3d6 | d12 7-8 = Daze, 9+ = Stun | Ethereal, Unavoidable";

const definitionOf = (term: string): string => {
  const entry = glossary.find((candidate) => candidate.term === term);

  if (!entry) {
    throw new Error(`No glossary entry for ${term}`);
  }

  return entry.definition;
};

const renderText = () => {
  render(
    <>
      <p>
        <GlossaryText text={ATTACK_BAR} />
      </p>
      <button type="button">Elsewhere</button>
    </>,
  );
};

describe("GlossaryText", () => {
  it("keeps the whole text and turns each term into a button", () => {
    renderText();

    expect(screen.getByText(/Ranged/).closest("p")).toHaveTextContent(
      ATTACK_BAR,
    );
    expect(screen.getByRole("button", { name: "Stun" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "Unavoidable" }),
    ).toBeInTheDocument();
  });

  it("shows the definition when a term is tapped, and hides it on a second tap", async () => {
    renderText();
    const stun = screen.getByRole("button", { name: "Stun" });

    await userEvent.click(stun);

    expect(screen.getByRole("dialog", { name: "Stun" })).toHaveTextContent(
      definitionOf("Stun"),
    );
    expect(stun).toHaveAttribute("aria-expanded", "true");
    // The popover sits at the end of the page, so a screen reader reads the
    // definition as the term's description.
    expect(stun).toHaveAccessibleDescription(
      expect.stringContaining(definitionOf("Stun")),
    );

    await userEvent.click(stun);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps one definition open at a time", async () => {
    renderText();

    await userEvent.click(screen.getByRole("button", { name: "Stun" }));
    await userEvent.click(screen.getByRole("button", { name: "Ethereal" }));

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(
      screen.getByRole("dialog", { name: "Ethereal" }),
    ).toBeInTheDocument();
  });

  it("closes on a tap outside, but not on a tap inside the definition", async () => {
    renderText();

    await userEvent.click(screen.getByRole("button", { name: "Stun" }));
    await userEvent.click(screen.getByRole("dialog", { name: "Stun" }));

    expect(screen.getByRole("dialog", { name: "Stun" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and gives the focus back to the term", async () => {
    renderText();
    const stun = screen.getByRole("button", { name: "Stun" });

    await userEvent.click(stun);
    await userEvent.click(screen.getByRole("dialog", { name: "Stun" }));
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(stun).toHaveFocus();
  });
});

describe("Definition", () => {
  it("lists the bulleted items under the intro", () => {
    render(
      <Definition text="Glyphs below. • Air: roll more • Earth: gain armor." />,
    );

    const items = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);

    expect(screen.getByText("Glyphs below.")).toBeInTheDocument();
    expect(items).toEqual(["Air: roll more", "Earth: gain armor."]);
  });
});
