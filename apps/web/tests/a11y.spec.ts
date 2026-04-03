import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("homepage has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();

  const severe = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(severe).toEqual([]);
});
