import "@testing-library/jest-dom";

// jsdom doesn't implement matchMedia or ResizeObserver, which a few design-system components
// (and their future consumers) touch through layout-sensitive code.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

if (!globalThis.crypto?.randomUUID) {
  let sequence = 0;
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    value: () => {
      sequence += 1;
      return `00000000-0000-4000-8000-${String(sequence).padStart(12, "0")}`;
    },
  });
}
