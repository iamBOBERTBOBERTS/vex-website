import { test, expect } from "@playwright/test";

test("v4.2 hero exposes cinematic GLSL data hook and survives scroll", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("#universe");
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute("data-cinematic-glsl", /^(on|off)$/);
  await page.evaluate(() => window.scrollBy(0, 420));
  await expect(hero).toBeVisible();
  const canvas = page.locator("#universe canvas").first();
  const count = await canvas.count();
  test.skip(count === 0, "No hero canvas (reduced motion or headless)");
  const box = await canvas.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(32);
});

test("configure exploded toggles interactive viewer prop (smoke)", async ({ page }) => {
  await page.goto("/configure");
  await page.getByRole("button", { name: /exploded view/i }).click();
  await expect(page.getByRole("button", { name: /exploded view/i })).toHaveAttribute("aria-pressed", "true");
});
