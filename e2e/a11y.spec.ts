import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { login } from "./auth";

test.beforeEach(async ({ request }) => {
  await request.post("http://127.0.0.1:4000/__reset");
});

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoViolations(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const summary = results.violations
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(" "))
        .slice(0, 4)
        .join(", ");
      return `${violation.id} (${violation.impact}): ${violation.help} — ${targets}`;
    })
    .join("\n");

  expect(results.violations, `${label} accessibility violations:\n${summary}`).toEqual([]);
}

test("login page meets WCAG 2.1 AA", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "LockA Admin" })).toBeVisible();
  await expectNoViolations(page, "Login");
});

test("authenticated screens meet WCAG 2.1 AA", async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  await expectNoViolations(page, "Dashboard");

  await page.goto("/applications");
  await expect(page.getByRole("heading", { name: "Provider applications" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);
  await expectNoViolations(page, "Applications");

  await page.goto("/applications/p-1");
  await expect(page.getByRole("heading", { name: "Nairobi Community Hospital" })).toBeVisible();
  await page.waitForTimeout(1000);
  await expectNoViolations(page, "Application detail");

  await page.goto("/audit-log");
  await expect(page.getByRole("heading", { name: "Audit log" })).toBeVisible();
  await page.waitForTimeout(1000);
  await expectNoViolations(page, "Audit log");
});
