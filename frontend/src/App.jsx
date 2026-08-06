import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LOOKUP_MODES = [
  { value: "chart_number", label: "Chart number" },
  { value: "chart_name", label: "Chart name" },
  { value: "chart_title", label: "Chart title" },
  { value: "panel_id", label: "Panel ID" },
];

const MAX_SCALE = 30000;

function collectNames(lookup) {
  if (!lookup) return [];
  const set = new Set();
  for (const m of lookup.old_matches || []) {
    if (m.PANEL_MAIN) set.add(String(m.PANEL_MAIN).trim());
  }
  for (const m of lookup.new_matches || []) {
    if (m.Panel_Name) set.add(String(m.Panel_Name).trim());
  }
  return [...set].filter(Boolean);
}

export function ChatBot({ onLookup } = {}) {
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
      if (onLookup) onLookup(data.lookup ?? null);
    } catch (e) {
      setReply(e instanceof Error ? e.message : "Unknown error");
      if (onLookup) onLookup(null);
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
      {(reply || details) && (
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
      )}
    </section>
  );
}

function FocusController({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 12 });
  }, [bounds, map]);
  return null;
}

export function MapView({ focus } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [overlap, setOverlap] = useState(null);
  const [overlapError, setOverlapError] = useState(null);
  const overlapReqIdRef = useRef(0);

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

  const focusNames = useMemo(() => collectNames(focus), [focus]);
  const focusKey = useMemo(() => focusNames.slice().sort().join("|"), [focusNames]);

  useEffect(() => {
    const reqId = ++overlapReqIdRef.current;
    const promise =
      focusNames.length === 0
        ? Promise.resolve(null)
        : fetch("api/overlap-geojson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ panel_names: focusNames, max_scale: MAX_SCALE }),
          }).then(async (r) => {
            if (!r.ok) {
              const detail = await r.json().catch(() => ({}));
              throw new Error(detail.detail || `API error: ${r.status}`);
            }
            return r.json();
          });
    promise
      .then((body) => {
        if (overlapReqIdRef.current !== reqId) return;
        setOverlap(body);
        setOverlapError(null);
      })
      .catch((e) => {
        if (overlapReqIdRef.current !== reqId) return;
        setOverlap(null);
        setOverlapError(e instanceof Error ? e.message : "Unknown error");
      });
    // focusKey stringifies focusNames so the effect only re-runs on a real change.
  }, [focusKey, focusNames]);

  const defaultBounds = useMemo(() => {
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

  const focusBounds = useMemo(() => {
    if (!overlap?.bounds_4326) return null;
    const [minx, miny, maxx, maxy] = overlap.bounds_4326;
    return [
      [miny, minx],
      [maxy, maxx],
    ];
  }, [overlap]);

  const focusNameSet = useMemo(() => new Set(focusNames.map((n) => n.toLowerCase())), [focusNames]);

  const oldStyle = (feature) => {
    const name = String(feature?.properties?.PANEL_MAIN ?? "")
      .trim()
      .toLowerCase();
    const highlighted = focusNameSet.size > 0 && focusNameSet.has(name);
    return highlighted
      ? { color: "#1e3a8a", weight: 3, fillOpacity: 0.25 }
      : { color: "#1e3a8a", weight: 1, fillOpacity: focusNameSet.size > 0 ? 0.03 : 0.1 };
  };

  const newStyle = (feature) => {
    const name = String(feature?.properties?.Panel_Name ?? "")
      .trim()
      .toLowerCase();
    const highlighted = focusNameSet.size > 0 && focusNameSet.has(name);
    return highlighted
      ? { color: "#ea580c", weight: 3, fillOpacity: 0.3 }
      : { color: "#ea580c", weight: 1, fillOpacity: focusNameSet.size > 0 ? 0.05 : 0.15 };
  };

  const overlapStyle = () => ({
    color: "#16a34a",
    weight: 2,
    fillOpacity: 0.45,
    fillColor: "#22c55e",
  });

  return (
    <section className="panel">
      <h2>Map — panels (Scale ≤ {MAX_SCALE.toLocaleString()})</h2>
      {error && <p className="error">Failed: {error}</p>}
      {overlapError && <p className="error">Overlap: {overlapError}</p>}
      {!data && !error && <p>Loading data...</p>}
      {data && (
        <div className="map-wrap">
          <MapContainer
            bounds={defaultBounds ?? undefined}
            center={defaultBounds ? undefined : [51, -3]}
            zoom={defaultBounds ? undefined : 6}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FocusController bounds={focusBounds} />
            <LayersControl position="topright">
              <LayersControl.Overlay checked name={`Old panels (${data.old.features.length})`}>
                <GeoJSON
                  key={`old-${focusKey}`}
                  data={data.old}
                  style={oldStyle}
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
                  key={`new-${focusKey}`}
                  data={data.new}
                  style={newStyle}
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties || {};
                    const el = document.createElement("pre");
                    el.textContent = `New\nChart: ${p.Chart ?? ""}\nPanel_ID: ${p.Panel_ID ?? ""}\nPanel_Name: ${p.Panel_Name ?? ""}\nPan_Scale: ${p.Pan_Scale ?? ""}`;
                    layer.bindPopup(el);
                  }}
                />
              </LayersControl.Overlay>
              {overlap && overlap.features && overlap.features.length > 0 && (
                <LayersControl.Overlay checked name="Old ∩ New overlap">
                  <GeoJSON key={`overlap-${focusKey}`} data={overlap} style={overlapStyle} />
                </LayersControl.Overlay>
              )}
            </LayersControl>
          </MapContainer>
        </div>
      )}
    </section>
  );
}

let mcpIdCounter = 0;
function nextMcpId() {
  mcpIdCounter += 1;
  return mcpIdCounter;
}

async function mcpCall(method, params) {
  const res = await fetch("mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextMcpId(), method, params }),
  });
  if (!res.ok) throw new Error(`MCP error: ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${body.error.code}: ${body.error.message}`);
  return body.result;
}

function extractText(result) {
  const chunks = result?.content ?? [];
  return chunks
    .filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("\n");
}

export function MCPChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const query = input.trim();
    if (!query || loading) return;
    setInput("");
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const result = await mcpCall("tools/call", {
        name: "chart.answer",
        arguments: { query },
      });
      const text = extractText(result) || "(no response)";
      setMessages((prev) => [...prev, { role: "assistant", text }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Sorry — ${e instanceof Error ? e.message : "unknown error"}.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className="panel">
      <h2>Agent Chat</h2>
      <p className="muted">
        Ask about a chart by number, name, title, or panel id — e.g. <em>2345</em>, <em>Looe</em>,
        or <em>panel 0147_6</em>. Answers are provided by Agent.
      </p>
      <div className="chat-thread" role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className="muted chat-empty">Start the conversation with a chart reference.</p>
        )}
        {messages.map((m, i) => (
          <div key={`m${i}`} className={`chat-msg chat-${m.role}`}>
            <span className="chat-role">{m.role === "user" ? "You" : "Agent"}</span>
            <p>{m.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-assistant">
            <span className="chat-role">MCP</span>
            <p className="muted">Thinking...</p>
          </div>
        )}
      </div>
      <div className="row">
        <label htmlFor="mcp-query" className="sr-only">
          Your message
        </label>
        <input
          id="mcp-query"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. 2345, Looe, panel 0147_6"
        />
      </div>
      <button type="button" onClick={submit} disabled={loading || !input.trim()}>
        {loading ? "Sending..." : "Send"}
      </button>
    </section>
  );
}

export default function App() {
  const [lookup, setLookup] = useState(null);
  const [view, setView] = useState("home");
  return (
    <main className="page">
      <nav className="topnav" aria-label="Main">
        <button
          type="button"
          className={view === "home" ? "nav-link active" : "nav-link"}
          onClick={() => setView("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={view === "mcp" ? "nav-link active" : "nav-link"}
          onClick={() => setView("mcp")}
        >
          Agent Chatbot
        </button>
      </nav>
      {view === "home" ? (
        <>
          <section className="hero">
            <p className="eyebrow">AutoChart</p>
            <h1>Chart comparison — chatbot and map</h1>
            <p>
              Backend at <strong>/api</strong>, MCP at <strong>/mcp</strong>. Map is limited to
              Scale ≤ {MAX_SCALE.toLocaleString()}. Submit a lookup to zoom the map and show the old
              ∩ new overlap.
            </p>
          </section>
          <ChatBot onLookup={setLookup} />
          <MapView focus={lookup} />
        </>
      ) : (
        <>
          <section className="hero">
            <p className="eyebrow">AutoChart / Agent</p>
            <h1>Agent Chatbot</h1>
          </section>
          <MCPChat />
        </>
      )}
    </main>
  );
}
