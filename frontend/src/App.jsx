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

function sampleArgsFor(tool) {
  if (!tool?.inputSchema?.properties) return "{}";
  const sample = {};
  for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
    if (schema?.default !== undefined) {
      sample[key] = schema.default;
    } else if (
      Array.isArray(schema?.type) ? schema.type.includes("string") : schema?.type === "string"
    ) {
      sample[key] = "";
    } else if (schema?.type === "array") {
      sample[key] = [];
    } else if (schema?.type === "integer" || schema?.type === "number") {
      sample[key] = 0;
    } else {
      sample[key] = null;
    }
  }
  return JSON.stringify(sample, null, 2);
}

export function MCPChat() {
  const [tools, setTools] = useState([]);
  const [toolsError, setToolsError] = useState(null);
  const [selected, setSelected] = useState("");
  const [argsText, setArgsText] = useState("{}");
  const [result, setResult] = useState(null);
  const [callError, setCallError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    mcpCall("tools/list")
      .then((r) => {
        if (!alive) return;
        const list = r?.tools ?? [];
        setTools(list);
        if (list.length > 0) {
          setSelected(list[0].name);
          setArgsText(sampleArgsFor(list[0]));
        }
      })
      .catch((e) => alive && setToolsError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  const selectedTool = useMemo(
    () => tools.find((t) => t.name === selected) ?? null,
    [tools, selected],
  );

  const changeTool = (name) => {
    setSelected(name);
    const tool = tools.find((t) => t.name === name) ?? null;
    setArgsText(sampleArgsFor(tool));
    setResult(null);
    setCallError(null);
  };

  const submit = async () => {
    setLoading(true);
    setCallError(null);
    setResult(null);
    let parsed;
    try {
      parsed = argsText.trim() === "" ? {} : JSON.parse(argsText);
    } catch (e) {
      setCallError(`Invalid JSON: ${e.message}`);
      setLoading(false);
      return;
    }
    try {
      const r = await mcpCall("tools/call", { name: selected, arguments: parsed });
      setResult(r);
    } catch (e) {
      setCallError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2>MCP chatbot — direct tool call</h2>
      <p className="muted">
        Issues JSON-RPC calls against <strong>/mcp</strong>. Pick a tool, edit the arguments, and
        submit. Response is shown raw; images are rendered inline.
      </p>
      {toolsError && <p className="error">Failed to load tools: {toolsError}</p>}
      <div className="row">
        <label htmlFor="mcp-tool">Tool</label>
        <select id="mcp-tool" value={selected} onChange={(e) => changeTool(e.target.value)}>
          {tools.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {selectedTool?.description && <p className="muted">{selectedTool.description}</p>}
      <div className="row">
        <label htmlFor="mcp-args">Arguments (JSON)</label>
      </div>
      <textarea
        id="mcp-args"
        rows={8}
        value={argsText}
        onChange={(e) => setArgsText(e.target.value)}
        spellCheck={false}
      />
      <button type="button" onClick={submit} disabled={loading || !selected}>
        {loading ? "Calling..." : "Call tool"}
      </button>
      {callError && <p className="error">{callError}</p>}
      {result && (
        <div className="reply">
          {(result.content || []).map((c, i) => {
            if (c.type === "text") {
              let pretty = c.text;
              try {
                pretty = JSON.stringify(JSON.parse(c.text), null, 2);
              } catch {
                /* leave as-is */
              }
              return <pre key={`c${i}`}>{pretty}</pre>;
            }
            if (c.type === "image" && c.data) {
              return (
                <img
                  key={`c${i}`}
                  src={`data:${c.mimeType || "image/png"};base64,${c.data}`}
                  alt={`MCP result ${i}`}
                />
              );
            }
            return <pre key={`c${i}`}>{JSON.stringify(c, null, 2)}</pre>;
          })}
        </div>
      )}
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
          MCP chatbot
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
            <p className="eyebrow">AutoChart / MCP</p>
            <h1>MCP chatbot</h1>
            <p>Direct JSON-RPC access to the same tool catalogue used by the AI agent flow.</p>
          </section>
          <MCPChat />
        </>
      )}
    </main>
  );
}
