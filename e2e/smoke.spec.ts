import { expect, test } from "@playwright/test";

test("login page renders the admin sign-in form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "LockA Admin" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("unauthenticated visitors are redirected to login", async ({ page }) => {
  await page.goto("/applications");

  await expect(page).toHaveURL(/\/login\?from=%2Fapplications$/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
