import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LOOKUP_MODES = [
  { value: "chart_number", label: "Chart number" },
  { value: "chart_name", label: "Chart name" },
  { value: "chart_title", label: "Chart title" },
  { value: "panel_id", label: "Panel ID" },
];

const MAX_SCALE = 30000;

export function ChatBot() {
  const [mode, setMode] = useState("chart_name");
  const [value, setValue] = useState("Looe");
  const [reply, setReply] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setDetails(null);
    try {
      const message = `${mode.replace("_", " ")} ${value}`;
      const res = await fetch("api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode, value }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setReply(data.reply);
      setDetails(data.lookup);
    } catch (e) {
      setReply(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>Chatbot — new chart lookup</h2>
      <div className="row">
        <label htmlFor="mode">Lookup by</label>
        <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          {LOOKUP_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="row">
        <label htmlFor="value">Value</label>
        <input
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. 1013, Looe, 0147_6"
        />
      </div>
      <button type="button" onClick={submit} disabled={loading || !value.trim()}>
        {loading ? "Searching..." : "Ask"}
      </button>
      <div className="reply">
        {reply && <pre>{reply}</pre>}
        {details && (
          <div className="details">
            <p>
              <strong>Old matches:</strong> {details.old_matches.length} —{" "}
              <strong>New matches:</strong> {details.new_matches.length}
            </p>
            <div className="match-cols">
              <div>
                <h4>Old</h4>
                <ul>
                  {details.old_matches.slice(0, 10).map((m, i) => (
                    <li key={`o${i}`}>
                      {m.PANEL_IDEN} — {m.PANEL_MAIN} (scale {m.SCALE ?? "n/a"})
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>New</h4>
                <ul>
                  {details.new_matches.slice(0, 10).map((m, i) => (
                    <li key={`n${i}`}>
                      {m.Chart} / {m.Panel_ID} — {m.Panel_Name} (scale {m.Pan_Scale ?? "n/a"})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function MapView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`api/data?max_scale=${MAX_SCALE}`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const bounds = useMemo(() => {
    if (!data) return null;
    let minLon = Infinity,
      minLat = Infinity,
      maxLon = -Infinity,
      maxLat = -Infinity;
    const visit = (coords) => {
      if (typeof coords[0] === "number") {
        const [lon, lat] = coords;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      } else {
        coords.forEach(visit);
      }
    };
    for (const collection of [data.old, data.new]) {
      for (const f of collection.features || []) {
        if (f.geometry) visit(f.geometry.coordinates);
      }
    }
    if (!Number.isFinite(minLon)) return null;
    return [
      [minLat, minLon],
      [maxLat, maxLon],
    ];
  }, [data]);

  return (
    <section className="panel">
      <h2>Map — panels (Scale ≤ {MAX_SCALE.toLocaleString()})</h2>
      {error && <p className="error">Failed: {error}</p>}
      {!data && !error && <p>Loading data...</p>}
      {data && (
        <div className="map-wrap">
          <MapContainer
            bounds={bounds ?? undefined}
            center={bounds ? undefined : [51, -3]}
            zoom={bounds ? undefined : 6}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LayersControl position="topright">
              <LayersControl.Overlay checked name={`Old panels (${data.old.features.length})`}>
                <GeoJSON
                  data={data.old}
                  style={() => ({ color: "#1e3a8a", weight: 1, fillOpacity: 0.1 })}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties || {};
                    const el = document.createElement("pre");
                    el.textContent = `Old\nPANEL_IDEN: ${p.PANEL_IDEN ?? ""}\nPANEL_MAIN: ${p.PANEL_MAIN ?? ""}\nSCALE: ${p.SCALE ?? ""}`;
                    layer.bindPopup(el);
                  }}
                />
              </LayersControl.Overlay>
              <LayersControl.Overlay checked name={`New panels (${data.new.features.length})`}>
                <GeoJSON
                  data={data.new}
                  style={() => ({ color: "#ea580c", weight: 1, fillOpacity: 0.15 })}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties || {};
                    layer.bindPopup(
                      `<b>New</b><br/>Chart: ${p.Chart ?? ""}<br/>Panel_ID: ${p.Panel_ID ?? ""}<br/>Panel_Name: ${p.Panel_Name ?? ""}<br/>Pan_Scale: ${p.Pan_Scale ?? ""}`,
                    );
                  }}
                />
              </LayersControl.Overlay>
            </LayersControl>
          </MapContainer>
        </div>
      )}
    </section>
  );
}

export default function App() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AutoChart</p>
        <h1>Chart comparison — chatbot and map</h1>
        <p>
          Backend at <strong>/api</strong>, MCP at <strong>/mcp</strong>. Map is limited to Scale ≤{" "}
          {MAX_SCALE.toLocaleString()}.
        </p>
      </section>
      <ChatBot />
      <MapView />
    </main>
  );
}
