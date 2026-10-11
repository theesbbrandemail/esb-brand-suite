import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, Loader2, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Markdown } from "@/components/esb/ToolWorkspace";
import { askAssistant } from "@/lib/assistant.functions";

type Msg = { role: "user" | "assistant"; text: string; error?: boolean };

const QUICK = ["What are today's appointments?", "Which stock items are running low?", "Draft a treatment plan for my next patient today"];

export function CommandAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const ask = useServerFn(askAssistant);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { if (open && !busy) setTimeout(() => inputRef.current?.focus(), 50); }, [open, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history = msgs.filter((m) => !m.error).slice(-10).map(({ role, text }) => ({ role, text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await ask({ data: { question, history } });
      setMsgs((m) => [...m, res.error ? { role: "assistant", text: res.error, error: true } : { role: "assistant", text: res.text }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Couldn't reach the assistant. Check your connection and try again.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        className="h-9 flex items-center gap-1.5 px-3 rounded-full border border-gold/40 bg-gold/10 text-xs text-gold hover:bg-gold/20 transition"
      >
        <Bot className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2 font-display">
              <Bot className="h-4 w-4 text-gold" /> ESB Command Assistant
            </SheetTitle>
            <SheetDescription className="text-xs">Answers from your live bookings, stock and services.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                {QUICK.map((s) => (
                  <button key={s} onClick={() => send(s)} className="w-full text-left text-sm px-3 py-2 rounded-xl border border-border hover:border-gold/40 hover:bg-gold/5 transition">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl bg-gold text-gold-foreground px-3 py-2 text-sm">{m.text}</div>
              ) : (
                <div key={i} className={`text-sm ${m.error ? "text-destructive" : ""}`}>
                  {m.error ? m.text : <Markdown text={m.text} />}
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking the records…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(q); }}
            className="p-3 border-t border-border flex items-end gap-2"
          >
            {msgs.length > 0 && (
              <button type="button" onClick={() => setMsgs([])} aria-label="Clear conversation" className="h-10 w-10 shrink-0 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <textarea
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(q); } }}
              rows={1}
              placeholder="Ask about appointments, stock, treatments…"
              className="flex-1 resize-none max-h-32 rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-gold/50"
            />
            <button type="submit" disabled={busy || !q.trim()} aria-label="Send" className="h-10 w-10 shrink-0 rounded-xl bg-gold text-gold-foreground flex items-center justify-center disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
