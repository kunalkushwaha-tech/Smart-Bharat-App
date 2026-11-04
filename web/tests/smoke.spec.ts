import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";

const routes = ["/", "/security-tools", "/privacy", "/terms", "/about", "/share"];

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
  await expect(page.getByRole("heading", { name: "Spot the Scam Simulator" })).toBeVisible();
  await page.getByRole("button", { name: "Start simulation" }).click();
  await expect(page.getByText("Scenario 1 of 10")).toBeVisible();
  await page.getByRole("button", { name: "Scam", exact: true }).click();
  await expect(page.getByText("SIMULATION")).toBeVisible();

  const shareResponse = await page.goto("/share?text=Urgent%20OTP%20request", { waitUntil: "domcontentloaded" });
  expect(shareResponse?.status()).toBe(200);
  await expect(page.getByText("Urgent OTP request")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Message Analyzer" })).toHaveAttribute("href", /security-tools\?message=/);
  await page.goto("/", { waitUntil: "domcontentloaded" });

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

test("fraud evidence vault stores and exports a local case", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByText("Fraud Evidence Vault", { exact: true }).click();
  await page.getByRole("button", { name: "Add case" }).click();
  await page.getByLabel("What happened").fill("A suspicious UPI request arrived.");
  await page.getByRole("button", { name: "Add timeline row" }).click();
  await page.getByLabel("Timeline what happened").fill("Received suspicious request");
  await page.getByLabel("Attach evidence images").setInputFiles({
    name: "evidence.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.getByAltText("evidence.png")).toBeVisible();
  const textDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download text summary (.txt)" }).click();
  expect((await textDownload).suggestedFilename()).toBe("bharat-fraud-evidence-summary.txt");
  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF summary" }).click();
  expect((await pdfDownload).suggestedFilename()).toBe("bharat-fraud-evidence-summary.pdf");
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Delete everything" }).click();
});
