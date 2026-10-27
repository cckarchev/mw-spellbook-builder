import { render, screen, within } from "@testing-library/react";
import { BarList } from "./BarList";

const TEN = 10;
const FIVE = 5;

describe("BarList", () => {
  it("scales bars to the largest value", () => {
    render(
      <BarList
        label="By type"
        rows={[
          { label: "Creature", value: TEN },
          { label: "Attack", value: FIVE },
        ]}
      />,
    );

    const [creature, attack] = within(
      screen.getByRole("list", { name: "By type" }),
    ).getAllByRole("listitem");

    expect(creature).toHaveTextContent("Creature");
    expect(creature).toHaveTextContent("10");
    expect(attack).toHaveTextContent("Attack");
    expect(attack).toHaveTextContent("5");
    expect(creature?.querySelector("[data-bar]")).toHaveStyle({
      width: "100%",
    });
    expect(attack?.querySelector("[data-bar]")).toHaveStyle({ width: "50%" });
  });
});
