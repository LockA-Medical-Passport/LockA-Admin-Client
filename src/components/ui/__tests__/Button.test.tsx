import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, type ButtonVariant } from "../Button";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "success", "danger", "amber"];

describe("Button", () => {
  it.each(VARIANTS)("renders the %s variant", (variant) => {
    render(<Button variant={variant}>{variant}</Button>);

    expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
  });

  it("shows a spinner and disables the button while loading", () => {
    render(<Button loading>Submitting</Button>);

    const button = screen.getByRole("button", { name: /submitting/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Disabled" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when enabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Approve</Button>);

    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
