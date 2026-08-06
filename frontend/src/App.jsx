import { lazy, Suspense, useState } from "react";

const MapView = lazy(() => import("./MapView.jsx"));

const LOOKUP_MODES = [
  { value: "chart_number", label: "Chart number" },
  { value: "chart_name", label: "Chart name" },
  { value: "chart_title", label: "Chart title" },
  { value: "panel_id", label: "Panel ID" },
];

const MAX_SCALE = 30000;

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
        <div className="reply" role="status" aria-live="polite">
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
            <span className="chat-role">Agent</span>
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
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <header className="page-header">
        <div className="page-header-inner">
          <a
            className="brand-lockup"
            href="https://www.admiralty.co.uk/"
            rel="noopener noreferrer"
            aria-label="UK Hydrographic Office — Admiralty"
          >
            <img src="./ukho-logo.svg" alt="" aria-hidden="true" />
            <span className="brand-lockup-text">AutoChart</span>
          </a>
          <nav className="topnav" aria-label="Primary">
            <button
              type="button"
              className={view === "home" ? "nav-link active" : "nav-link"}
              aria-current={view === "home" ? "page" : undefined}
              onClick={() => setView("home")}
            >
              Home
            </button>
            <button
              type="button"
              className={view === "mcp" ? "nav-link active" : "nav-link"}
              aria-current={view === "mcp" ? "page" : undefined}
              onClick={() => setView("mcp")}
            >
              Agent Chatbot
            </button>
          </nav>
        </div>
      </header>
      <main id="main" className="page" tabIndex={-1}>
        {view === "home" ? (
          <>
            <section className="hero">
              <p className="eyebrow">AutoChart</p>
              <h1>Chart comparison — chatbot and map</h1>
              <p>
                Backend at <strong>/api</strong>, MCP at <strong>/mcp</strong>. Map is limited to
                Scale ≤ {MAX_SCALE.toLocaleString()}. Submit a lookup to zoom the map and show the
                old ∩ new overlap.
              </p>
            </section>
            <ChatBot onLookup={setLookup} />
            <Suspense fallback={<p aria-live="polite">Loading map…</p>}>
              <MapView focus={lookup} />
            </Suspense>
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
    </>
  );
}
