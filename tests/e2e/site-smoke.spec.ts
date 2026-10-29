import { expect, test } from "@playwright/test";

test("homepage reflects the refined discovery layout", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Your Entire AI Universe." })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByRole("button", { name: /All tools/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI Creations Gallery." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your next shortcut." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Better tools. More room to create." })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Supporting pages" }).getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("navigation", { name: "Top categories" }).getByRole("button")).toHaveCount(6);
  await expect(page.getByRole("button", { name: /Writing/ }).first()).toBeVisible();
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

test("word counter accepts text and produces a result", async ({ page }) => {
  const response = await page.goto("/tools/word-counter");
  expect(response?.status()).toBe(200);
  const editor = page.locator("textarea").first();
  await expect(editor).toBeVisible();
  await editor.fill("Browser tests check useful tools.");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.getByText(/words/i).last()).toBeVisible();
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
