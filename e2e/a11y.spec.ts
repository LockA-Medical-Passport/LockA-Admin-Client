import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { loginAsAdmin, resetMockApi } from "./support/auth";
import { installMockFreighter } from "./support/freighter";

async function expectNoA11yViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

  expect(
    results.violations,
    `${context}: ${results.violations
      .map((violation) => `${violation.id} (${violation.nodes.length} nodes)`)
      .join(", ")}`,
  ).toEqual([]);
}

test.beforeEach(async ({ request }) => {
  await resetMockApi(request);
});

test("login screen passes the automated WCAG A/AA audit and is keyboard navigable", async ({
  page,
}) => {
  await page.goto("/login");
  await expectNoA11yViolations(page, "login");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Password")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeFocused();
});

test("queue, provider detail, and decision dialog pass the WCAG A/AA audit", async ({ page }) => {
  await installMockFreighter(page);
  await loginAsAdmin(page);

  await page.goto("/applications");
  await expect(page.getByRole("heading", { name: "Provider applications" })).toBeVisible();
  await expectNoA11yViolations(page, "application queue");

  await page.getByRole("link", { name: "Riverside General Hospital" }).click();
  await expect(
    page.getByRole("heading", { name: "Riverside General Hospital", level: 1 }),
  ).toBeVisible();
  await expectNoA11yViolations(page, "provider detail");

  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoA11yViolations(page, "decision dialog");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
