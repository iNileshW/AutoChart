import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatBot } from "../App.jsx";

describe("ChatBot", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders mode selector, value input, and Ask button", () => {
    render(<ChatBot />);
    expect(screen.getByLabelText(/lookup by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^value$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ask/i })).toBeInTheDocument();
  });

  it("posts the selected mode+value to /api/chat and renders the reply", async () => {
    const responsePayload = {
      reply: "Yes — new chart available.",
      lookup: {
        mode: "chart_name",
        value: "Looe",
        old_matches: [{ PANEL_IDEN: "0147_6", PANEL_MAIN: "F Looe", SCALE: 5000 }],
        new_matches: [
          { Chart: "GB1013", Panel_ID: 0, Panel_Name: "Helford River", Pan_Scale: 12500 },
        ],
        new_chart_available: true,
      },
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responsePayload,
    });

    const user = userEvent.setup();
    render(<ChatBot />);

    await user.click(screen.getByRole("button", { name: /ask/i }));

    await waitFor(() => {
      expect(screen.getByText(responsePayload.reply)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("api/chat");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.mode).toBe("chart_name");
    expect(body.value).toBe("Looe");

    expect(screen.getByText(/0147_6/)).toBeInTheDocument();
    expect(screen.getByText(/GB1013/)).toBeInTheDocument();
  });

  it("shows API error text on non-2xx response", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const user = userEvent.setup();
    render(<ChatBot />);
    await user.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => {
      expect(screen.getByText(/api error: 500/i)).toBeInTheDocument();
    });
  });

  it("invokes onLookup with the returned lookup payload", async () => {
    const lookup = {
      mode: "chart_name",
      value: "Looe",
      old_matches: [],
      new_matches: [],
      new_chart_available: false,
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "No new chart available.", lookup }),
    });
    const onLookup = vi.fn();
    const user = userEvent.setup();
    render(<ChatBot onLookup={onLookup} />);
    await user.click(screen.getByRole("button", { name: /ask/i }));
    await waitFor(() => {
      expect(onLookup).toHaveBeenCalledWith(lookup);
    });
  });

  it("disables the Ask button when the value is blank", async () => {
    const user = userEvent.setup();
    render(<ChatBot />);
    const input = screen.getByLabelText(/^value$/i);
    await user.clear(input);
    expect(screen.getByRole("button", { name: /ask/i })).toBeDisabled();
  });
});
