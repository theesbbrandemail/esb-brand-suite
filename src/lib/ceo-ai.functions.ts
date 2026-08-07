import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AIGatewayError, lovableChat } from "@/lib/ai-gateway.server";

const Msg = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  messages: z.array(Msg).min(1).max(24),
  /** Compact JSON snapshot of KPIs / inventory / appointments from the dashboard. */
  snapshot: z.string().max(12000).default("{}"),
});

export type CeoAiReply = { text: string; error?: string };

const SYSTEM = `You are "ESB Command Intelligence", the CEO's executive AI analyst for the ESB Brand group
(Skincare Kitchen, Derma Aesthetics, SkinClinic, Rejuvenating Aesthetics, Dental Clinic, ESB Studios).

You answer questions about operational KPIs, inventory health, appointments, follow-ups and next best actions.
Rules:
- Ground every number in the DASHBOARD SNAPSHOT provided. Never invent figures; if a number is absent, say so and suggest how to get it.
- Be decisive and brief: 2-5 short bullet points or a tight paragraph. Executive tone, no filler.
- Always end with a bolded "Next action:" line naming one concrete, doable step.
- Format with markdown-lite (bullets, bold). No headings, no code blocks.`;

export const askCeoAi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<CeoAiReply> => {
    try {
      const json = await lovableChat(
        {
          model: "google/gemini-3.6-flash",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "system", content: `DASHBOARD SNAPSHOT (live/demo data):\n${data.snapshot}` },
            ...data.messages,
          ],
          temperature: 0.4,
          max_tokens: 2000,
        },
        { fallbackModels: ["google/gemini-2.5-flash"], timeoutMs: 40000 },
      );
      const text =
        (json?.choices?.[0]?.message?.content as string | undefined)?.trim() ??
        "";
      if (!text) return { text: "", error: "The AI returned an empty response. Please try again." };
      return { text };
    } catch (e) {
      const err = e as AIGatewayError;
      return { text: "", error: err?.userMessage ?? "The AI assistant is unavailable right now." };
    }
  });
