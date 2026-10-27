import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Stepper } from "./Stepper";

/**
 * A Stepper that holds its own value, so a press re-renders it like a real
 * caller.
 */
const LiveStepper = ({ start }: { start: number }) => {
  const [value, setValue] = useState(start);

  return (
    <Stepper
      value={value}
      max={4}
      label="Fireball"
      onIncrement={() => setValue((current) => current + 1)}
      onDecrement={() => setValue((current) => current - 1)}
      disabledReason={null}
    />
  );
};

describe("Stepper", () => {
  it("shows the value in a status, so a screen reader reads each change", async () => {
    render(<LiveStepper start={2} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Add one Fireball" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent("3");
  });
});
