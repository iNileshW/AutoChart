import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("Can you compare latest chart updates?");
  const [reply, setReply] = useState("-");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setReply(data.reply);
    } catch (error) {
      setReply(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AutoChart</p>
        <h1>React + Vite UI with FastAPI backend and MCP endpoint</h1>
        <p>
          This starter connects the chatbot UI to the backend at <strong>/api</strong>
          and reserves <strong>/mcp</strong> for MCP JSON-RPC calls.
        </p>
      </section>

      <section className="panel">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
        />
        <button type="button" onClick={sendMessage} disabled={loading}>
          {loading ? "Sending..." : "Send to backend"}
        </button>
        <div className="reply">
          <h2>Backend reply</h2>
          <pre>{reply}</pre>
        </div>
      </section>
    </main>
  );
}
