import { render, screen } from "@testing-library/react";
import { Badge, type BadgeVariant } from "../Badge";

const VARIANTS: BadgeVariant[] = ["green", "amber", "red", "cyan", "gray"];

describe("Badge", () => {
  it.each(VARIANTS)("renders the %s variant", (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>);

    expect(screen.getByText(variant)).toBeInTheDocument();
  });

  it("defaults to the gray variant", () => {
    render(<Badge>Unknown</Badge>);

    expect(screen.getByText("Unknown")).toHaveClass("bg-white/10");
  });

  it("hides the decorative status dot from assistive technology", () => {
    const { container } = render(<Badge variant="green">Verified</Badge>);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
