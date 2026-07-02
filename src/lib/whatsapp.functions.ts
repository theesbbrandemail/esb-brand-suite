import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { lovableChat, AIGatewayError } from "./ai-gateway.server";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(30),
});

const SYSTEM_PROMPT = `You are the ESB Brand WhatsApp Concierge — a warm, concise assistant for customers and staff of ESB (Skincare Kitchen, Derma Aesthetics, Skin Clinic, Dental Clinic, Rejuvenating Aesthetics, Global Skin Tech, Logistics, ESB Studios).

You help users discover and use the app's features. When relevant, suggest 1-3 in-app actions with short labels and route paths from this list:
- /skin-analysis — AI Skin Analysis (upload/snap face, get concerns + product routine)
- /appointments — Book or view clinic appointments (Lagos, Abuja, Port Harcourt)
- /inventory — Live stock across branches (staff)
- /suite — CEO/Manager AI command center (staff)
- /content — Content pipeline (staff)
- /brands/skincare-kitchen — Skincare production & R&D
- /brands/derma — Derma products & preorders
- /brands/skinclinic — Aesthetics procedures
- /brands/dental — Dental products & services
- /brands/rejuvenating — Wellness & anti-aging procedures
- /brands/studios — ESB Studios (photo/video/campaigns)
- /ai/customer — Client AI suite (WhatsApp-ready)

Format suggestions as a bullet list at the end when useful:
- Label — /route

Keep replies under 120 words. Be friendly, on-brand, and never invent routes not listed above.`;

export const whatsappChat = createServerFn({ method: "POST" })
  .inputValidator((d) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const res = await lovableChat(
        {
          model: "google/gemini-2.5-flash",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
          temperature: 0.6,
        },
        { fallbackModels: ["google/gemini-2.5-flash-lite"], maxRetries: 2, timeoutMs: 30000 },
      );
      const content: string = res?.choices?.[0]?.message?.content ?? "";
      return { ok: true as const, content };
    } catch (e) {
      if (e instanceof AIGatewayError) {
        return { ok: false as const, code: e.code, message: e.userMessage };
      }
      return { ok: false as const, code: "unknown", message: "Something went wrong. Please retry." };
    }
  });
