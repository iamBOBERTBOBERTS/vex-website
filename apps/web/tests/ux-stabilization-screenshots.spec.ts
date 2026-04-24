import { test, expect, devices, type Locator, type Page } from "@playwright/test";
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

async function saveLocatorShot(page: Page, relativePath: string, locator: Locator) {
  const outputPath = path.join(screenshotRoot, relativePath);
  await ensureScreenshotDir(path.dirname(relativePath));
  await locator.screenshot({ path: outputPath });
}

async function stabilizePage(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
}

test("capture desktop route audit screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });

  await stabilizePage(page, "/");
  await expect(page.getByRole("heading", { name: /private exotic vehicle operating environment/i })).toBeVisible();
  await saveLocatorShot(page, "homepage/homepage-hero-desktop.png", page.locator("#universe"));

  await page.mouse.wheel(0, 1800);
  await page.waitForTimeout(700);
  await saveShot(page, "homepage/homepage-mid-scroll-desktop.png");

  const collectionHeading = page.getByRole("heading", { name: /private vault, not a listing grid/i });
  await collectionHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveLocatorShot(
    page,
    "homepage/homepage-collection-desktop.png",
    page.locator("section").filter({ has: collectionHeading }).first()
  );

  const ctaHeading = page.getByRole("heading", { name: /ready to open a discreet acquisition channel/i });
  await ctaHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveLocatorShot(
    page,
    "homepage/homepage-cta-desktop.png",
    page.locator("section").filter({ has: ctaHeading }).first()
  );

  await stabilizePage(page, "/inventory");
  await saveShot(page, "inventory/inventory-top-desktop.png");

  await page.getByText("Filter the collection").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/inventory-filters-desktop.png");
  await saveShot(page, "inventory/filters-open-desktop.png");

  await page.getByText("Showing", { exact: false }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/inventory-cards-desktop.png");
  await saveLocatorShot(page, "inventory/vehicle-card-closeup-desktop.png", page.locator("article").first());
  await saveLocatorShot(page, "inventory/bugatti-listing-desktop.png", page.locator("article").filter({ hasText: /bugatti chiron/i }).first());
  await saveLocatorShot(page, "inventory/lamborghini-listing-desktop.png", page.locator("article").filter({ hasText: /lamborghini huracan/i }).first());

  await stabilizePage(page, "/inventory/bugatti-chiron-sport-2023");
  await saveShot(page, "inventory/detail-hero-desktop.png");
  await page.getByText("Key specs").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/detail-specs-desktop.png");
  await page.getByRole("link", { name: /request private access/i }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/inquiry-cta-desktop.png");

  await stabilizePage(page, "/appraisal");
  await expect(page.getByRole("heading", { name: /premium appraisal flow/i })).toBeVisible();
  await saveShot(page, "appraisal/appraisal-desktop.png");

  await stabilizePage(page, "/contact");
  await expect(page.getByRole("heading", { name: /bring the right context/i })).toBeVisible();
  await saveShot(page, "contact/contact-desktop.png");

  await stabilizePage(page, "/configure");
  await saveShot(page, "homepage/configure-desktop.png");

  await stabilizePage(page, "/login");
  await expect(page.getByRole("heading", { name: /return to your private garage/i })).toBeVisible();
  await saveShot(page, "regression/login-desktop.png");

  await stabilizePage(page, "/register");
  await expect(page.getByRole("heading", { name: /create your vex registry/i })).toBeVisible();
  await saveShot(page, "regression/register-desktop.png");
});

test("capture mobile route audit screenshots", async ({ browser }) => {
  const context = await browser.newContext({
    ...devices["iPhone 13"],
  });
  const page = await context.newPage();

  await stabilizePage(page, "/");
  await expect(page.getByRole("heading", { name: /private exotic vehicle operating environment/i })).toBeVisible();
  await saveShot(page, "mobile/homepage-hero-mobile.png");

  await page.getByRole("button", { name: /open menu/i }).click();
  await page.waitForTimeout(400);
  await saveShot(page, "mobile/mobile-nav.png");
  await page.getByRole("button", { name: /close menu/i }).first().click({ force: true });

  await stabilizePage(page, "/inventory");
  await saveShot(page, "mobile/inventory-mobile.png");
  await saveShot(page, "inventory/mobile-inventory-top.png");

  await page.getByText("Filter the collection").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveShot(page, "inventory/mobile-filters.png");

  await saveLocatorShot(page, "inventory/mobile-vehicle-card.png", page.locator("article").first());

  await stabilizePage(page, "/inventory/bugatti-chiron-sport-2023");
  await saveShot(page, "inventory/mobile-detail-hero.png");
  await saveShot(page, "inventory/mobile-sticky-cta.png");

  await stabilizePage(page, "/appraisal");
  await saveShot(page, "mobile/appraisal-mobile.png");

  await stabilizePage(page, "/contact");
  await saveShot(page, "mobile/contact-mobile.png");

  await stabilizePage(page, "/register");
  await saveShot(page, "mobile/register-mobile.png");

  await stabilizePage(page, "/");
  const mobileCtaHeading = page.getByRole("heading", { name: /ready to open a discreet acquisition channel/i });
  await mobileCtaHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await saveLocatorShot(
    page,
    "mobile/cta-mobile.png",
    page.locator("section").filter({ has: mobileCtaHeading }).first()
  );

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
