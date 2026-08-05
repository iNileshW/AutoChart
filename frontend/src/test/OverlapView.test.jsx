import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverlapView } from "../App.jsx";

const PANEL = "Isles of Scilly Northern Part";

describe("OverlapView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads panels on mount and renders them in the dropdown", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { panel_main: PANEL, panel_iden: "1046_1", scale: 15000 },
        { panel_main: "Another", panel_iden: "2345_2", scale: 25000 },
      ],
    });

    render(<OverlapView />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("api/panels?max_scale=30000"));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: /Isles of Scilly Northern Part/i }),
      ).toBeInTheDocument();
    });
  });

  it("posts the selected panel to /api/overlap and renders the returned PNG + metrics", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ panel_main: PANEL, panel_iden: "1046_1", scale: 15000 }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          panel_main: PANEL,
          max_scale: 30000,
          png_base64: "iVBORw0KGgoAAA",
          metrics: {
            old_area_m2: 100000,
            new_overlap_area_m2: 90000,
            overlap_pct_old: 90.0,
            new_polygons_intersecting: 2,
          },
        }),
      });

    const user = userEvent.setup();
    render(<OverlapView />);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: new RegExp(PANEL, "i") })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /show overlap/i }));

    await waitFor(() => {
      const img = screen.getByRole("img", { name: new RegExp(`Overlap for ${PANEL}`, "i") });
      expect(img).toHaveAttribute("src", expect.stringContaining("iVBORw0KGgoAAA"));
    });

    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/90.00%/)).toBeInTheDocument();

    const overlapCall = fetch.mock.calls[1];
    expect(overlapCall[0]).toBe("api/overlap");
    const body = JSON.parse(overlapCall[1].body);
    expect(body.panel_main).toBe(PANEL);
    expect(body.max_scale).toBe(30000);
  });

  it("shows error text if /api/overlap fails", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ panel_main: PANEL, panel_iden: "1046_1", scale: 15000 }],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: "No old polygons found" }),
      });

    const user = userEvent.setup();
    render(<OverlapView />);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: new RegExp(PANEL, "i") })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /show overlap/i }));
    await waitFor(() => {
      expect(screen.getByText(/no old polygons found/i)).toBeInTheDocument();
    });
  });
});
