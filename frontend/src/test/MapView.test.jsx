import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Stub react-leaflet with lightweight replacements so tests can run without
// a Leaflet-capable DOM (canvas, sizing, event bindings).
vi.mock("react-leaflet", () => {
  const passthrough = (name) => (props) => <div data-testid={name}>{props.children}</div>;
  const Overlay = (props) => (
    <div data-testid="LayersControl.Overlay" data-name={props.name}>
      {props.children}
    </div>
  );
  const LayersControl = passthrough("LayersControl");
  LayersControl.Overlay = Overlay;
  return {
    MapContainer: passthrough("MapContainer"),
    TileLayer: () => <div data-testid="TileLayer" />,
    GeoJSON: (props) => (
      <div data-testid="GeoJSON" data-feature-count={props.data?.features?.length ?? 0} />
    ),
    LayersControl,
    useMap: () => ({ fitBounds: () => {} }),
  };
});

// Import AFTER the mock so MapView.jsx picks up the stubbed react-leaflet.
const { MapView } = await import("../MapView.jsx");

const FC = (features = []) => ({ type: "FeatureCollection", features });

describe("MapView", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state before /api/data resolves", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    render(<MapView />);
    expect(screen.getByText(/loading data/i)).toBeInTheDocument();
  });

  it("renders old + new GeoJSON layers once data loads", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        old: FC([
          {
            geometry: {
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
            properties: {},
          },
        ]),
        new: FC([
          {
            geometry: {
              coordinates: [
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                  [0, 1],
                  [0, 0],
                ],
              ],
            },
            properties: {},
          },
        ]),
        max_scale: 30000,
      }),
    });

    render(<MapView />);

    await waitFor(() => {
      expect(screen.getByTestId("MapContainer")).toBeInTheDocument();
    });

    const geoLayers = screen.getAllByTestId("GeoJSON");
    expect(geoLayers).toHaveLength(2);
    for (const layer of geoLayers) {
      expect(layer.dataset.featureCount).toBe("1");
    }

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("api/data?max_scale=30000"));
  });

  it("fetches overlap GeoJSON when focus is provided", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          old: FC([
            {
              geometry: {
                coordinates: [
                  [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                  ],
                ],
              },
              properties: { PANEL_MAIN: "F Looe" },
            },
          ]),
          new: FC([
            {
              geometry: {
                coordinates: [
                  [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                  ],
                ],
              },
              properties: { Panel_Name: "Looe" },
            },
          ]),
          max_scale: 30000,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [0, 0],
                  ],
                ],
              },
            },
          ],
          bounds_4326: [0, 0, 1, 1],
        }),
      });

    const focus = {
      mode: "chart_name",
      value: "Looe",
      old_matches: [{ PANEL_MAIN: "F Looe" }],
      new_matches: [{ Panel_Name: "Looe" }],
      new_chart_available: true,
    };

    render(<MapView focus={focus} />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    const [, overlapInit] = fetch.mock.calls[1];
    expect(fetch.mock.calls[1][0]).toBe("api/overlap-geojson");
    const body = JSON.parse(overlapInit.body);
    expect(body.panel_names).toEqual(expect.arrayContaining(["F Looe", "Looe"]));
    expect(body.max_scale).toBe(30000);
  });

  it("surfaces an error banner on non-2xx", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    render(<MapView />);
    await waitFor(() => {
      expect(screen.getByText(/failed: api error: 500/i)).toBeInTheDocument();
    });
  });
});
