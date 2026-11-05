import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, login } from "./auth";

test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:4000/__reset");
});

test("signs in and lands on the dashboard summary", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "LockA Admin" })).toBeVisible();

  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Application summary" })).toBeVisible();
  await expect(page.getByText("Lagos Central Clinic")).toBeVisible();
});

test("rejects invalid credentials without creating a session", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("wrong@example.com");
  await page.getByLabel("Password").fill("nope");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("protects application routes from unauthenticated visitors", async ({ page }) => {
  await page.goto("/applications");
  await expect(page).toHaveURL("/login?from=%2Fapplications");
});

test("shows the queue and audit log after signing in", async ({ page }) => {
  await login(page);

  await page.goto("/applications");
  await expect(page.getByRole("heading", { name: "Provider applications" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Nairobi Community Hospital" })).toBeVisible();

  await page.goto("/audit-log");
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await expect(page.getByText("Lagos Central Clinic").first()).toBeVisible();
});
