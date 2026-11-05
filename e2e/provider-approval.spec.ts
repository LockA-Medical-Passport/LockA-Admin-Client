import { expect, test } from "@playwright/test";
import { loginAsAdmin, resetMockApi } from "./support/auth";
import { installMockFreighter } from "./support/freighter";

test.beforeEach(async ({ request }) => {
  await resetMockApi(request);
});

test("an admin can log in, open a pending application, and approve it", async ({ page }) => {
  await installMockFreighter(page);
  await loginAsAdmin(page);

  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await expect(page.getByRole("button", { name: "Disconnect wallet" })).toBeVisible();

  await page.getByRole("link", { name: "Applications" }).click();
  await expect(page.getByRole("heading", { name: "Provider applications" })).toBeVisible();

  await page.getByRole("link", { name: "Riverside General Hospital" }).click();
  await expect(
    page.getByRole("heading", { name: "Riverside General Hospital", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Pending", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Approve", exact: true }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: /Approve Riverside General Hospital/ }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Approve", exact: true }).click();

  await expect(page.getByText("Provider approved", { exact: true })).toBeVisible();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Verified", { exact: true }).first()).toBeVisible();
});
