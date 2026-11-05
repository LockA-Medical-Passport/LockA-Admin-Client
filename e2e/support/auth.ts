import { expect, type Page } from "@playwright/test";

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@locka.health");
  await page.getByLabel("Password").fill("correct-horse-battery-staple");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
}

export const MOCK_API_URL = `http://127.0.0.1:${process.env.MOCK_API_PORT ?? 4100}`;

export async function resetMockApi(request: {
  get: (url: string) => Promise<{ ok: () => boolean }>;
}) {
  const response = await request.get(`${MOCK_API_URL}/__reset`);
  expect(response.ok()).toBe(true);
}
