import { expect, test } from "@playwright/test";

test("homepage reflects discovery UI, moving border and looping featured row", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Your Entire AI Universe." })).toBeVisible();
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByText("All tools", { exact: true })).toHaveCount(0);
  await expect(page.locator(".light-tools-section")).toHaveCount(0);
  await expect(page.locator('a[href="#tools"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "AI Creations Gallery." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Find your next shortcut." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Better tools. More room to create." })).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Supporting pages" }).getByRole("link")).toHaveCount(5);
  await expect(page.getByRole("navigation", { name: "Top categories" }).getByRole("button")).toHaveCount(6);
  await expect(page.locator(".hero-shortcuts button")).toHaveCount(8);
  const desktopColumns = await page.locator(".hero-shortcuts").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
  if (await page.evaluate(() => window.innerWidth > 760)) expect(desktopColumns).toBe(8);
  await expect(page.locator(".category-sidebar").getByRole("link", { name: "AIToolss home" })).toBeVisible();
  await expect(page.locator(".category-sidebar").getByRole("link", { name: /Home/ })).toBeVisible();

  const reducedMotion = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const searchBorder = page.locator(".light-search-wrap");
  const borderStreak = () => searchBorder.evaluate((element) => ({
    animation: getComputedStyle(element, "::before").animationName,
    angle: getComputedStyle(element, "::before").getPropertyValue("--search-angle"),
  }));
  if (reducedMotion) {
    expect((await borderStreak()).animation).toBe("none");
  } else {
    expect((await borderStreak()).animation).toBe("search-orbit");
    const firstAngle = (await borderStreak()).angle;
    await page.waitForTimeout(450);
    expect((await borderStreak()).angle).not.toBe(firstAngle);
  }

  const featuredWindow = page.locator(".featured-window");
  await featuredWindow.scrollIntoViewIfNeeded();
  const track = page.locator(".featured-track");
  await expect(track).toHaveClass(/featured-track-active/);
  await expect(track.locator(".featured-marquee-group")).toHaveCount(2);
  await expect(track.locator(".featured-marquee-group").nth(1)).toHaveAttribute("aria-hidden", "true");
  if (reducedMotion) {
    expect(await track.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  } else {
    expect(await track.evaluate((element) => getComputedStyle(element).animationName)).toBe("featured-marquee");
    const firstTransform = await track.evaluate((element) => getComputedStyle(element).transform);
    await page.waitForTimeout(350);
    expect(await track.evaluate((element) => getComputedStyle(element).transform)).not.toBe(firstTransform);
  }
});

test("autocomplete returns ranked real tools after one and two characters", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const search = page.getByRole("searchbox", { name: "Search AI tools" });
  const listbox = page.getByRole("listbox", { name: "Tool suggestions" });

  await search.fill("i");
  await expect(listbox).toBeVisible();
  const options = listbox.getByRole("option");
  expect(await options.count()).toBeGreaterThan(0);
  expect(await options.count()).toBeLessThanOrEqual(8);

  await search.fill("im");
  await expect(listbox).toBeVisible();
  expect(await options.count()).toBeGreaterThan(0);
  expect(await options.count()).toBeLessThanOrEqual(8);
  await expect(options.first()).toContainText(/image/i);

  await search.fill("vid");
  await expect(options.first()).toContainText(/video/i);
  await search.fill("zzq-no-matching-tool-999");
  await expect(page.getByText("No matching tools found")).toBeVisible();

  await search.fill("Word Counter");
  await expect(options.first()).toContainText("Word Counter");
  await options.first().click();
  await expect(page).toHaveURL(/\\/tools\\/word-counter$/);
  await expect(page.getByRole("heading", { level: 1, name: "Word Counter." })).toBeVisible();
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

test("featured cards remain clickable while the marquee moves", async ({ page }) => {
  await page.goto("/");
  await page.locator(".featured-window").scrollIntoViewIfNeeded();
  const firstCard = page.locator(".featured-marquee-group").first().locator(".featured-card").first();
  await expect(firstCard).toBeVisible();
  await firstCard.locator("strong").click();
  await expect(page).toHaveURL(/\\/tools\\/prompt-generator$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("autocomplete supports keyboard selection, Escape and clearing", async ({ page }) => {
  await page.goto("/");
  const search = page.getByRole("searchbox", { name: "Search AI tools" });
  const listbox = page.getByRole("listbox", { name: "Tool suggestions" });

  await search.fill("im");
  await expect(listbox).toBeVisible();
  await search.press("Escape");
  await expect(listbox).toBeHidden();
  await search.press("ArrowDown");
  await expect(listbox).toBeVisible();
  await search.press("Enter");
  await expect(page).toHaveURL(/\\/tools\\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/");
  const freshSearch = page.getByRole("searchbox", { name: "Search AI tools" });
  await freshSearch.fill("image");
  await expect(listbox).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(freshSearch).toHaveValue("");
  await expect(listbox).toBeHidden();
});

test("selecting a category opens only its capped suggestions", async ({ page }) => {
  await page.goto("/");
  await page.locator(".hero-shortcuts").getByRole("button", { name: /Images/ }).click();
  const listbox = page.getByRole("listbox", { name: "Tool suggestions" });
  await expect(listbox).toBeVisible();
  const options = listbox.getByRole("option");
  expect(await options.count()).toBeGreaterThan(0);
  expect(await options.count()).toBeLessThanOrEqual(8);
  await expect(listbox).toContainText("Explore Images tools");
  await expect(page.getByText("All tools", { exact: true })).toHaveCount(0);
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
