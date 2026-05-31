import { expect, test } from "@playwright/test";

test("home page / on load / page title includes 'diary'", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/diary/i);
});
