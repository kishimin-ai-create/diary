import { expect, test } from "@playwright/test";

test("home page / on load / page title shows the service name", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("つづる日記");
});
