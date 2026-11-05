import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders its label and calls onClick", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Approve" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and busy while loading", async () => {
    const onClick = jest.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole("button", { name: /Saving/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the requested variant and size classes", () => {
    render(
      <Button variant="danger" size="lg">
        Revoke
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Revoke" });
    expect(button).toHaveClass("bg-brand-red", "h-12", "px-6");
  });
});
