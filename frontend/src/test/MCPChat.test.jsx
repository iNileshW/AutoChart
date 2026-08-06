import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MCPChat } from "../App.jsx";

const TOOLS = [
  {
    name: "chart.lookup",
    description: "Look up old/new chart panels.",
    inputSchema: {
      type: "object",
      required: ["mode", "value"],
      properties: {
        mode: { type: "string" },
        value: { type: "string" },
      },
    },
  },
  {
    name: "chart.overlap_geojson",
    description: "Intersection polygons.",
    inputSchema: {
      type: "object",
      properties: {
        panel_names: { type: "array" },
        max_scale: { type: ["integer", "null"], default: 30000 },
      },
    },
  },
];

describe("MCPChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the MCP tool catalogue and lists tools in the selector", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jsonrpc: "2.0", id: 1, result: { tools: TOOLS } }),
    });
    render(<MCPChat />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "chart.lookup" })).toBeInTheDocument();
    });
    expect(screen.getByRole("option", { name: "chart.overlap_geojson" })).toBeInTheDocument();

    const [firstUrl, firstInit] = fetch.mock.calls[0];
    expect(firstUrl).toBe("mcp");
    const body = JSON.parse(firstInit.body);
    expect(body.method).toBe("tools/list");
  });

  it("issues tools/call with the parsed arguments and renders text content", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", id: 1, result: { tools: TOOLS } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 2,
          result: {
            content: [{ type: "text", text: JSON.stringify({ status: "ok", matches: 3 }) }],
          },
        }),
      });

    const user = userEvent.setup();
    render(<MCPChat />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "chart.lookup" })).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/arguments/i);
    await user.clear(textarea);
    await user.click(textarea);
    await user.paste('{"mode": "chart_name", "value": "Looe"}');

    await user.click(screen.getByRole("button", { name: /call tool/i }));

    await waitFor(() => {
      expect(screen.getByText(/"matches": 3/)).toBeInTheDocument();
    });

    const call2 = fetch.mock.calls[1];
    expect(call2[0]).toBe("mcp");
    const body = JSON.parse(call2[1].body);
    expect(body.method).toBe("tools/call");
    expect(body.params.name).toBe("chart.lookup");
    expect(body.params.arguments).toEqual({ mode: "chart_name", value: "Looe" });
  });

  it("reports invalid JSON without issuing a request", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jsonrpc: "2.0", id: 1, result: { tools: TOOLS } }),
    });

    const user = userEvent.setup();
    render(<MCPChat />);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "chart.lookup" })).toBeInTheDocument();
    });

    const textarea = screen.getByLabelText(/arguments/i);
    await user.clear(textarea);
    await user.type(textarea, "not json");

    await user.click(screen.getByRole("button", { name: /call tool/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid json/i)).toBeInTheDocument();
    });
    // Still only the tools/list call
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("surfaces JSON-RPC errors", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", id: 1, result: { tools: TOOLS } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: "2.0",
          id: 2,
          error: { code: -32602, message: "chart.lookup requires 'mode' and 'value'" },
        }),
      });

    const user = userEvent.setup();
    render(<MCPChat />);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "chart.lookup" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /call tool/i }));
    await waitFor(() => {
      expect(screen.getByText(/chart.lookup requires/i)).toBeInTheDocument();
    });
  });
});
