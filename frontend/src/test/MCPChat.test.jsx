import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MCPChat } from "../App.jsx";

const ANSWER =
  "Yes — a new chart is available for chart 1013. New chart identifier(s): GB1013. New panel(s): Helford River. Scale(s): 12500.";

describe("MCPChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an empty chat thread on mount without hitting the network", () => {
    render(<MCPChat />);
    expect(screen.getByText(/start the conversation/i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls chart.answer with the typed query and renders the prose reply", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: { content: [{ type: "text", text: ANSWER }] },
      }),
    });

    const user = userEvent.setup();
    render(<MCPChat />);

    const input = screen.getByPlaceholderText(/2345, looe/i);
    await user.type(input, "chart 1013");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(ANSWER)).toBeInTheDocument();
    });

    // User bubble echo
    expect(screen.getByText("chart 1013")).toBeInTheDocument();

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("mcp");
    const body = JSON.parse(init.body);
    expect(body.method).toBe("tools/call");
    expect(body.params.name).toBe("chart.answer");
    expect(body.params.arguments).toEqual({ query: "chart 1013" });
  });

  it("submits on Enter", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: { content: [{ type: "text", text: "OK." }] },
      }),
    });

    const user = userEvent.setup();
    render(<MCPChat />);

    const input = screen.getByPlaceholderText(/2345, looe/i);
    await user.type(input, "2345{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("OK.")).toBeInTheDocument();
  });

  it("shows a friendly error when the MCP call fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "boom" },
      }),
    });

    const user = userEvent.setup();
    render(<MCPChat />);
    await user.type(screen.getByPlaceholderText(/2345, looe/i), "hi");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/sorry —.*boom/i)).toBeInTheDocument();
    });
  });

  it("does not submit when the input is empty", async () => {
    const user = userEvent.setup();
    render(<MCPChat />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(fetch).not.toHaveBeenCalled();
  });
});
