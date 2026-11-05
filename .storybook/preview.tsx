import type { Preview } from "@storybook/nextjs-vite";

import { Toaster } from "../src/components/ui/Toast";
import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "navy",
      values: [{ name: "navy", value: "#0a1628" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
