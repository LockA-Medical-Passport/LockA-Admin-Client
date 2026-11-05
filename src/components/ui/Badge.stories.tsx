import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Design System/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Pending", variant: "amber" },
  argTypes: {
    variant: { control: "select", options: ["green", "amber", "red", "cyan", "gray"] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge {...args} variant="amber">
        Pending
      </Badge>
      <Badge {...args} variant="green">
        Verified
      </Badge>
      <Badge {...args} variant="gray">
        Suspended
      </Badge>
      <Badge {...args} variant="red">
        Revoked
      </Badge>
      <Badge {...args} variant="cyan">
        On-chain
      </Badge>
    </div>
  ),
};
