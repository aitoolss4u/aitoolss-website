import { expect, test } from "@playwright/test";

test("homepage renders the brand and tool discovery UI", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("link", { name: /AIToolss home/i })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
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
