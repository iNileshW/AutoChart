import { expect, test } from "@playwright/test";

test.describe("AutoChart smoke", () => {
  test("home renders and Agent chat returns a prose reply", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Chart comparison/i })).toBeVisible();

    await page.getByRole("button", { name: /agent chatbot/i }).click();
    await expect(page.getByRole("heading", { name: /agent chatbot/i })).toBeVisible();

    await page.getByPlaceholder(/2345, looe/i).fill("2345");
    await page.getByRole("button", { name: /^send$/i }).click();

    await expect(page.getByText(/chart 2345/i)).toBeVisible({ timeout: 10_000 });
  });

  test("REST + MCP health endpoints respond", async ({ request }) => {
    const rest = await request.get("/api/v1/health");
    expect(rest.status()).toBe(200);
    expect(await rest.json()).toEqual({ status: "ok" });

    const mcp = await request.post("/mcp", {
      data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    });
    expect(mcp.status()).toBe(200);
    const body = await mcp.json();
    const names = body.result.tools.map((t) => t.name);
    expect(names).toContain("chart.answer");
  });
});
