import { createFileRoute } from "@tanstack/react-router";
import { CEO_AI_SYSTEM } from "@/lib/ceo-ai.prompt";

type Turn = { role: "user" | "assistant"; content: string };

/**
 * Streaming endpoint for the CEO assistant.
 * Proxies the Lovable AI Gateway SSE stream and re-emits plain text deltas
 * so the client can render the answer progressively.
 */
export const Route = createFileRoute("/api/ceo-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("AI is not configured on this project yet.", { status: 500 });
        }

        let body: { messages?: Turn[]; snapshot?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const messages = Array.isArray(body.messages) ? body.messages.slice(-24) : [];
        if (messages.length === 0) return new Response("Messages are required", { status: 400 });
        const snapshot = (body.snapshot ?? "{}").slice(0, 12000);

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "raw-fetch",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            temperature: 0.4,
            max_tokens: 2000,
            messages: [
              { role: "system", content: CEO_AI_SYSTEM },
              { role: "system", content: `DASHBOARD SNAPSHOT (live/demo data):\n${snapshot}` },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "The AI is busy right now. Please try again in a few seconds."
              : upstream.status === 402
                ? "AI credits have been exhausted on this workspace. Please add credits in Lovable to continue."
                : upstream.status >= 500
                  ? "The AI service is temporarily unavailable. Please retry shortly."
                  : `The AI request was rejected. ${detail.slice(0, 200)}`;
          return new Response(message, { status: upstream.status || 500 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const payload = trimmed.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const json = JSON.parse(payload) as {
                      choices?: Array<{ delta?: { content?: string } }>;
                    };
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(encoder.encode(delta));
                  } catch {
                    // ignore partial/non-JSON keepalive frames
                  }
                }
              }
            } catch {
              controller.enqueue(encoder.encode("\n\n_Stream interrupted. Please retry._"));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
