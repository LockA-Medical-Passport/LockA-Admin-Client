import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./Skeleton";

const meta = {
  title: "Design System/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: { shape: { control: "select", options: ["block", "text", "avatar"] } },
  args: { shape: "block", className: "h-24 w-64" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Block: Story = {};

export const Text: Story = {
  args: { shape: "text", className: "w-48" },
};

export const Avatar: Story = {
  args: { shape: "avatar" },
};
