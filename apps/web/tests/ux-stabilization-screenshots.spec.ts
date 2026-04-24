import { test, expect, devices, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const screenshotRoot = path.resolve(currentDir, "../testing/screenshots");
const productionBaseUrl = "https://vortex-exotics.netlify.app";

test.setTimeout(120000);

async function ensureScreenshotDir(relativeDir: string) {
  await fs.mkdir(path.join(screenshotRoot, relativeDir), { recursive: true });
}

async function saveShot(page: Page, relativePath: string) {
  const outputPath = path.join(screenshotRoot, relativePath);
  await ensureScreenshotDir(path.dirname(relativePath));
  await page.screenshot({ path: outputPath, fullPage: false });
}

async function stabilizePage(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
}

test("capture desktop route audit screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  await stabilizePage(page, "/");
  await saveShot(page, "homepage/homepage-hero-desktop.png");

  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(700);
  await saveShot(page, "homepage/homepage-mid-scroll-desktop.png");

  await page.getByText("Ready to acquire, consign, or structure a private deal?").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "homepage/homepage-cta-desktop.png");

  await stabilizePage(page, "/inventory");
  await saveShot(page, "inventory/inventory-top-desktop.png");

  await page.getByText("Filter the collection").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/inventory-filters-desktop.png");

  await page.getByText("Showing", { exact: false }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/inventory-cards-desktop.png");

  await stabilizePage(page, "/appraisal");
  await expect(page.getByRole("heading", { name: /premium appraisal flow/i })).toBeVisible();
  await saveShot(page, "appraisal/appraisal-desktop.png");

  await stabilizePage(page, "/contact");
  await expect(page.getByRole("heading", { name: /bring the right context/i })).toBeVisible();
  await saveShot(page, "contact/contact-desktop.png");

  await stabilizePage(page, "/configure");
  await saveShot(page, "homepage/configure-desktop.png");
});

test("capture mobile route audit screenshots", async ({ browser }) => {
  const context = await browser.newContext({
    ...devices["iPhone 13"],
  });
  const page = await context.newPage();

  await stabilizePage(page, "/");
  await saveShot(page, "mobile/homepage-hero-mobile.png");

  await page.getByRole("button", { name: /open menu/i }).click();
  await page.waitForTimeout(400);
  await saveShot(page, "mobile/mobile-nav.png");
  await page.getByRole("button", { name: /close menu/i }).first().click({ force: true });

  await stabilizePage(page, "/inventory");
  await saveShot(page, "mobile/inventory-mobile.png");

  await stabilizePage(page, "/appraisal");
  await saveShot(page, "mobile/appraisal-mobile.png");

  await stabilizePage(page, "/");
  await page.getByText("Ready to acquire, consign, or structure a private deal?").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "mobile/cta-mobile.png");

  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "mobile/footer-mobile.png");

  await context.close();
});

test("capture current production regression snapshots", async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  await stabilizePage(page, productionBaseUrl);
  await saveShot(page, "regression/production-homepage-hero.png");

  await stabilizePage(page, `${productionBaseUrl}/appraisal`);
  await saveShot(page, "regression/production-appraisal-route.png");

  await stabilizePage(page, `${productionBaseUrl}/contact`);
  await saveShot(page, "regression/production-contact-route.png");

  await stabilizePage(page, `${productionBaseUrl}/inventory`);
  await saveShot(page, "regression/production-inventory-route.png");
});
