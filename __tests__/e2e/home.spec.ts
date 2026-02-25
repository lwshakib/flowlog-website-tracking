import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Flowlog/);
});

test("get started link", async ({ page }) => {
  await page.goto("/");

  // Click the get started link.
  // Note: Adjust the selector based on your actual landing page
  const getStarted = page.getByRole("link", { name: /get started/i }).first();

  if ((await getStarted.count()) > 0) {
    await getStarted.click();
    await expect(page).toHaveURL(/.*sign-up|sign-in|login|dashboard/);
  }
});
