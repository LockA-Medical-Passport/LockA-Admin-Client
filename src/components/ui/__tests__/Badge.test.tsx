import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("defaults to the gray variant", () => {
    render(<Badge>Draft</Badge>);

    expect(screen.getByText("Draft")).toHaveClass("text-foreground/70");
  });

  it("uses the status-specific colour for each variant", () => {
    const { rerender } = render(<Badge variant="green">Verified</Badge>);
    expect(screen.getByText("Verified")).toHaveClass("text-brand-green");

    rerender(<Badge variant="red">Rejected</Badge>);
    expect(screen.getByText("Rejected")).toHaveClass("text-red-300");

    rerender(<Badge variant="amber">Suspended</Badge>);
    expect(screen.getByText("Suspended")).toHaveClass("text-brand-amber");
  });

  it("hides the decorative status dot from assistive technology", () => {
    const { container } = render(<Badge variant="cyan">Invited</Badge>);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
