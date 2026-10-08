const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

/** Streams a Responses API call server-side and returns the final text (no retries; safe error messages). */
export async function streamResponsesText(opts: { instructions: string; input: string }): Promise<{ text: string; error?: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { text: "", error: "AI is not configured." };

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: opts.instructions,
      input: opts.input,
      reasoning: { effort: "low" },
      store: false,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    console.error(`[ai] responses ${res.status}: ${body.slice(0, 500)}`);
    if (res.status === 402) return { text: "", error: "AI credits are used up. Add credits in workspace billing to keep using AI tools." };
    if (res.status === 429) return { text: "", error: "The AI is busy right now. Please wait a minute and try again." };
    if (res.status === 403) return { text: "", error: "AI access is blocked for this workspace. A workspace admin needs to check AI settings." };
    return { text: "", error: "The AI couldn't respond. Please try again shortly." };
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let failed: string | undefined;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string; response?: { error?: { message?: string } } };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") failed = ev.response?.error?.message ?? "AI request failed.";
          if (ev.type === "response.refusal.delta") failed = "The AI declined this request.";
        } catch {
          /* ignore partial */
        }
      }
    }
  }
  if (failed) return { text: "", error: failed };
  if (!text.trim()) return { text: "", error: "The AI returned an empty answer. Please try again." };
  return { text: text.trim() };
}
