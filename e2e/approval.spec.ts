import { expect, test } from "@playwright/test";
import { connectDemoWallet, login } from "./auth";

test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:4000/__reset");
});

test("approves a pending provider end to end", async ({ page }) => {
  await login(page);
  await page.goto("/applications");

  await page.getByRole("link", { name: "Nairobi Community Hospital" }).click();
  await expect(page.getByRole("heading", { name: "Nairobi Community Hospital" })).toBeVisible();

  await connectDemoWallet(page);

  await page.getByRole("button", { name: "Approve", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /Approve Nairobi Community Hospital/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/ProviderRegistry contract/)).toBeVisible();

  await dialog.getByRole("button", { name: "Approve", exact: true }).click();

  await expect(dialog).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("status").filter({ hasText: "Provider approved" })).toBeVisible();

  // The server component re-fetches the provider, so the decision persisted in locka-api.
  await expect(page.getByText("Verified").first()).toBeVisible();
  await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible();

  // The decision is also reflected in the global audit trail.
  await page.goto("/audit-log");
  await expect(page.getByText("Nairobi Community Hospital").first()).toBeVisible();
});

test("requires a reason before rejecting an application", async ({ page }) => {
  await login(page);
  await page.goto("/applications/p-2");

  await connectDemoWallet(page);
  await page.getByRole("button", { name: "Reject", exact: true }).click();

  const dialog = page.getByRole("dialog");
  const reason = dialog.getByLabel("Reason for rejection");
  await expect(reason).toHaveAttribute("required", "");

  await dialog.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(reason).toBeFocused();
});
