// One-shot script: load the SPA, interact, then close so web-vitals
// beacons flush to /api/telemetry.
import { chromium } from "playwright";

const BASE = process.env.AUTOCHART_E2E_BASE_URL || "http://127.0.0.1:8000";

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const responses = [];
page.on("response", (r) => {
  if (r.url().endsWith("/api/telemetry")) responses.push(r.status());
});
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("browser error:", msg.text());
});

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForSelector('button:has-text("Ask")');
// Click something to trigger INP
await page.getByRole("button", { name: /ask/i }).click();
await page.waitForTimeout(500);

// Navigate away so onLCP/onCLS finalize + beacons fire.
await page.goto(`${BASE}/livez`, { waitUntil: "load" });
// Give sendBeacon time to flush.
await page.waitForTimeout(2000);

await browser.close();
console.log("telemetry_posts:", responses);
