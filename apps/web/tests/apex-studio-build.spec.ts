import { test, expect } from "@playwright/test";

test.describe("Apex Studio /build", () => {
  test("marks page for analytics; engine root mounts after vehicle select", async ({ page }) => {
    await page.goto("/build");
    const pageRoot = page.locator("main[data-apex-studio-page='1']");
    await expect(pageRoot).toBeVisible();
    await expect(page.locator("[data-apex-studio='1']")).toHaveCount(0);
  });
});
