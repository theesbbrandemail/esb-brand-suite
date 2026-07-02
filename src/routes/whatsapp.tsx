import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { useServerFn } from "@tanstack/react-start";
import { whatsappChat } from "@/lib/whatsapp.functions";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageCircle, Phone, Video, MoreVertical, Check, CheckCheck, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: "WhatsApp Concierge — ESB Brand" },
      { name: "description", content: "Chat with the ESB assistant on WhatsApp-style to discover features" },
      { property: "og:title", content: "WhatsApp Concierge — ESB Brand" },
      { property: "og:description", content: "Chat with the ESB assistant to discover features" },
    ],
  }),
  component: Page,
});

// Configure the business WhatsApp number (E.164 without +). Fallback demo number.
const WA_NUMBER = "2348000000000";

type Msg = { id: string; role: "user" | "assistant"; content: string; ts: number };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const GREETING =
  "Hi 👋 I'm the ESB Concierge. Ask me about skin analysis, booking a clinic, our brands, products or anything ESB — I'll point you to the right feature.";

function parseSuggestions(text: string): { body: string; suggestions: { label: string; to: string }[] } {
  const lines = text.split(/\r?\n/);
  const suggestions: { label: string; to: string }[] = [];
  const bodyLines: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*•]\s*(.+?)\s+[—–-]\s+(\/[\w\-/]+)\s*$/);
    if (m) suggestions.push({ label: m[1].trim(), to: m[2].trim() });
    else bodyLines.push(line);
  }
  return { body: bodyLines.join("\n").trim(), suggestions };
}

function Page() {
  const send = useServerFn(whatsappChat);
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: uid(), role: "assistant", content: GREETING, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const waLink = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "Hi ESB, I'd like more info.";
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(last)}`;
  }, [messages]);

  async function submit() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    const userMsg: Msg = { id: uid(), role: "user", content: text, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const payload = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await send({ data: { messages: payload } });
      if (res.ok) {
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: res.content || "…", ts: Date.now() }]);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Network problem. Please retry.");
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl">WhatsApp Concierge</h1>
            <p className="text-sm text-muted-foreground">Chat with ESB · discover features · get instant suggestions</p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] text-white text-xs font-medium px-3 py-1.5 hover:brightness-105"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open in WhatsApp
          </a>
        </div>

        <div className="rounded-3xl overflow-hidden border border-border shadow-xl bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><rect fill=%22%23ece5dd%22 width=%22120%22 height=%22120%22/><circle cx=%2260%22 cy=%2260%22 r=%221.2%22 fill=%22%23d9d1c1%22/></svg>')] bg-repeat">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54] text-white">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">ESB</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">ESB Concierge</div>
              <div className="text-[11px] text-white/70">online · AI-powered</div>
            </div>
            <Video className="h-5 w-5 opacity-80" />
            <Phone className="h-5 w-5 opacity-80" />
            <MoreVertical className="h-5 w-5 opacity-80" />
          </div>

          <div ref={scrollRef} className="h-[480px] overflow-y-auto px-3 py-4 space-y-2">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white shadow px-3 py-2 text-xs text-muted-foreground">
                  typing…
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 text-red-700 text-[11px] px-3 py-1">{error}</div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-end gap-2 p-2 bg-[#f0f0f0] border-t border-black/5"
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Type a message"
              className="flex-1 resize-none rounded-3xl bg-white px-4 py-2 text-sm text-black outline-none max-h-32"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="h-10 w-10 rounded-full bg-[#25D366] text-white flex items-center justify-center disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" /> Suggestions link directly to the matching feature inside the app.
        </div>
      </div>
    </Shell>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  const { body, suggestions } = isUser
    ? { body: msg.content, suggestions: [] as { label: string; to: string }[] }
    : parseSuggestions(msg.content);
  const time = new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 shadow text-sm whitespace-pre-wrap ${
          isUser ? "bg-[#dcf8c6] rounded-tr-sm text-black" : "bg-white rounded-tl-sm text-black"
        }`}
      >
        {body}
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <Link
                key={s.to + s.label}
                to={s.to}
                className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 text-[#075E54] text-[11px] px-2.5 py-1 hover:bg-[#25D366]/25"
              >
                {s.label} <ExternalLink className="h-3 w-3" />
              </Link>
            ))}
          </div>
        )}
        <div className={`mt-1 flex items-center gap-1 text-[10px] ${isUser ? "text-black/50 justify-end" : "text-black/40"}`}>
          {time}
          {isUser && <CheckCheck className="h-3 w-3 text-[#34B7F1]" />}
          {!isUser && <Check className="h-3 w-3 opacity-0" />}
        </div>
      </div>
    </div>
  );
}
