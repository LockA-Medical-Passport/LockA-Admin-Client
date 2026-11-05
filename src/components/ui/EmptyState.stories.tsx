import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Design System/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "No pending applications",
    description: "New provider applications will show up here when they arrive.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    title: "No providers match your filters",
    description: "Try clearing the filters or searching for a different provider.",
    action: <Button variant="secondary">Clear filters</Button>,
  },
};
