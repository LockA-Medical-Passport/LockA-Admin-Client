import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "./Spinner";

const meta = {
  title: "Design System/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: { size: { control: "select", options: ["sm", "md", "lg"] } },
  args: { size: "md" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-locka-cyan">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};
