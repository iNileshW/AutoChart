import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON, LayersControl, MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MAX_SCALE = 30000;

// eslint-disable-next-line react-refresh/only-export-components
export function collectNames(lookup) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  const defaultBounds = useMemo(() => {
    if (!data) return null;
    let minLon = Infinity;
    let minLat = Infinity;
    let maxLon = -Infinity;
    let maxLat = -Infinity;
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
    <section className="panel" aria-labelledby="map-heading">
      <h2 id="map-heading">Map — panels (Scale ≤ {MAX_SCALE.toLocaleString()})</h2>
      {error && (
        <p className="error" role="alert">
          Failed: {error}
        </p>
      )}
      {overlapError && (
        <p className="error" role="alert">
          Overlap: {overlapError}
        </p>
      )}
      {!data && !error && <p aria-live="polite">Loading data...</p>}
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

export default MapView;
