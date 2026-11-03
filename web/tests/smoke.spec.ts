import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

const routes = ["/", "/security-tools", "/privacy", "/terms", "/about"];

test("public routes load without browser errors", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(`pageerror: ${error.message}`));

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
  }
  expect(browserErrors, browserErrors.join("\n")).toEqual([]);
});

test("home smoke checks and accessibility report", async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  expect(await page.locator("#emergency .hover-lift").count()).toBe(7);
  expect(await page.locator("footer").count()).toBe(1);
  expect(await page.locator('select').filter({ hasText: "All States & UTs" }).count()).toBe(1);
  expect(await page.locator('a[href^="tel:"]').count()).toBeGreaterThanOrEqual(11);
  expect(await page.locator('#emergency a[href^="tel:"]').evaluateAll((links) => links.every((link) => link.getAttribute("href")?.startsWith("tel:")))).toBe(true);

  await page.getByRole("button", { name: "Start Quiz" }).click();
  for (let question = 1; question <= 10; question += 1) {
    await expect(page.getByText(`Question ${question} of 10`)).toBeVisible();
    await page.locator("#academy button[aria-pressed]").first().click();
    await page.getByRole("button", { name: question === 10 ? "See Results" : "Next Question" }).click();
  }

  const axeReports: Array<{ route: string; mode: string; violations: unknown[] }> = [];
  for (const mode of ["dark", "light", "high-contrast"]) {
    if (mode === "light") await page.getByRole("button", { name: "Toggle dark mode" }).click();
    if (mode === "high-contrast") await page.getByRole("button", { name: "Toggle high contrast and large text mode" }).click();
    const results = await new AxeBuilder({ page }).analyze();
    axeReports.push({ route: "/", mode, violations: results.violations });
    const critical = results.violations.filter((violation) => violation.impact === "critical");
    expect(critical, `${mode} critical axe violations`).toEqual([]);
    for (const violation of results.violations.filter((item) => item.impact === "serious")) {
      console.warn(`serious axe violation [${mode}] ${violation.id}: ${violation.description}`);
    }
  }
  await fs.mkdir("test-results", { recursive: true });
  await fs.writeFile("test-results/axe-report.json", JSON.stringify(axeReports, null, 2));
});
