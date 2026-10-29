import { expect, test } from "@playwright/test";

test("homepage reflects the refined discovery layout", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Your Entire AI Universe." })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.locator(".category-sidebar").getByRole("button", { name: /All tools/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Creations Gallery." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your next shortcut." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Better tools. More room to create." })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Supporting pages" }).getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("navigation", { name: "Top categories" }).getByRole("button")).toHaveCount(6);
  await expect(page.getByRole("button", { name: /Writing/ }).first()).toBeVisible();
  await expect(page.locator(".hero-shortcuts button")).toHaveCount(8);
  const desktopColumns = await page.locator(".hero-shortcuts").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  if (await page.evaluate(() => window.innerWidth > 760)) expect(desktopColumns).toBe(8);
  await expect(page.locator(".category-sidebar").getByRole("link", { name: "AIToolss home" })).toBeVisible();
  await expect(page.locator(".category-sidebar").getByRole("link", { name: /Home/ })).toBeVisible();
  const searchBorder = page.locator(".light-search-wrap");
  const reducedMotion = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reducedMotion) {
    await expect(searchBorder).toHaveCSS("animation-name", "none");
  } else {
    await expect(searchBorder).toHaveCSS("animation-name", "search-orbit");
    const firstAngle = await searchBorder.evaluate((element) => getComputedStyle(element).getPropertyValue("--search-angle"));
    await page.waitForTimeout(400);
    const nextAngle = await searchBorder.evaluate((element) => getComputedStyle(element).getPropertyValue("--search-angle"));
    expect(nextAngle).not.toBe(firstAngle);
  }
});

test("all catalog tool links open a successful tool page", async ({ page }) => {
  test.setTimeout(120_000);
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const hrefs = await page.locator('a[href^="/tools/"]').evaluateAll((links) =>
    [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute("href")).filter((href): href is string => Boolean(href)).map((href) => href.split("?")[0]))],
  );
  expect(hrefs.length).toBeGreaterThanOrEqual(60);
  for (const href of hrefs) {
    const toolResponse = await page.goto(href);
    expect(toolResponse?.status(), `Expected ${href} to return HTTP 200`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("word counter updates its metrics as the user types", async ({ page }) => {
  const response = await page.goto("/tools/word-counter");
  expect(response?.status()).toBe(200);
  const editor = page.getByLabel("Your text");
  await expect(editor).toBeVisible();
  await editor.fill("Browser tests check useful tools.");
  const wordMetric = page.locator(".ds-panel").filter({ hasText: "Words" }).first();
  await expect(wordMetric.getByText("5", { exact: true })).toBeVisible();
  await expect(wordMetric.getByText("Words", { exact: true })).toBeVisible();
});

test("tool pages share the sidebar, footer and light page surface", async ({ page }) => {
  const response = await page.goto("/tools/word-counter");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".category-sidebar").getByRole("link", { name: "AIToolss home" })).toBeVisible();
  await expect(page.locator("main.tool-page-shell")).toBeVisible();
  await expect(page.locator("main.tool-page-shell")).toHaveCSS("background-color", "rgb(250, 249, 255)");
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("clicking the body of a directory card navigates to that tool", async ({ page }) => {
  await page.goto("/");
  const card = page.locator(".light-tool-card").filter({ hasText: "Word Counter" }).first();
  await expect(card).toBeVisible();
  await card.locator("h3").click();
  await expect(page).toHaveURL(/\/tools\/word-counter$/);
  await expect(page.getByRole("heading", { level: 1, name: "Word Counter." })).toBeVisible();
});

test("search and category filters update the actual tool catalog", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search AI tools" });
  await search.fill("word counter");
  await expect(page.getByRole("link", { name: "Open Word Counter" })).toBeVisible();
  await search.fill("this-tool-does-not-exist-123");
  await expect(page.getByRole("heading", { name: "No tools found for that search" })).toBeVisible();
  await page.getByRole("button", { name: "Clear search and filters" }).first().click();
  await expect(page.getByText(/60 tools found/)).toBeVisible();
});

test("homepage remains within the viewport at supported widths", async ({ page }) => {
  for (const width of [375, 430, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `Unexpected horizontal overflow at ${width}px`).toBe(false);
  }
});

test("gallery image and video cards expose full-card links without blocking video controls", async ({ page }) => {
  await page.route("**/api/gallery", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      columns: 4,
      rows: 4,
      items: [
        { id: "image-fixture", type: "image", title: "Gallery image test", description: "Image preview", url: "https://gallery.test/image.jpg", thumbnail_url: null, creator: null },
        { id: "video-fixture", type: "video", title: "Gallery video test", description: "Video preview", url: "https://gallery.test/video.mp4", thumbnail_url: null, creator: null }
      ]
    })
  }));
  await page.goto("/");
  const imageCard = page.locator(".ai-gallery-card-linked").filter({ hasText: "Gallery image test" });
  await expect(imageCard).toBeVisible();
  await expect(imageCard).toHaveAttribute("href", "https://gallery.test/image.jpg");
  const videoCard = page.locator(".ai-gallery-video-card");
  await expect(videoCard).toBeVisible();
  await expect(videoCard.getByRole("link", { name: "Open video: Gallery video test" })).toBeVisible();
  await expect(videoCard.locator("video")).toHaveJSProperty("controls", true);
});

test("gallery API has safe default grid settings when no media is configured", async ({ request }) => {
  const response = await request.get("/api/gallery");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.columns).toBe(4);
  expect(body.rows).toBe(4);
  expect(Array.isArray(body.items)).toBe(true);
});
