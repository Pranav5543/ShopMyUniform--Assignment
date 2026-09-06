import { useState, useRef, useEffect } from "react";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import api from "../api/axios";
import ChatMessageContent from "./ChatMessageContent";

const STARTER_PROMPTS = [
  "Do you have white shirts for grade 7?",
  "What sizes are available for the Green Valley shirt?",
  "How long will delivery take?",
  "Where is my order?",
  "How do I exchange a shirt?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the ShopMyUniform support assistant. I can check real product availability, sizes, delivery timelines, your orders, and returns. What can I help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { message: trimmed, history });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I ran into an error reaching the support service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <strong>ShopMyUniform Assistant</strong>
            <button className="chat-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-body" ref={scrollRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role}`}>
                {m.role === "assistant" ? <ChatMessageContent content={m.content} /> : m.content}
              </div>
            ))}
            {loading && <div className="chat-bubble assistant chat-typing">Checking our database...</div>}
          </div>

          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {STARTER_PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, sizes, delivery, orders..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen((o) => !o)} style={{ padding: open ? undefined : "0" }}>
        {open ? (
          "✕"
        ) : (
          <div style={{ width: "66px", height: "66px", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <DotLottiePlayer
              src="/assets/Ai%20Robot%20Vector%20Art.lottie"
              autoplay
              loop
              style={{ width: "56px", height: "56px" }}
            />
          </div>
        )}
      </button>
    </div>
  );
}
