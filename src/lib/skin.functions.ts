import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const SKIN_MODELS = {
  fast: "google/gemini-2.5-flash",
  balanced: "google/gemini-3-flash-preview",
  precise: "google/gemini-2.5-pro",
} as const;
export type SkinModelTier = keyof typeof SKIN_MODELS;

const Input = z.object({
  imageDataUrl: z
    .string()
    .min(50)
    .refine((s) => s.startsWith("data:image/"), "Must be an image data URL"),
  tier: z.enum(["fast", "balanced", "precise"]).optional(),
});

export type SkinAnalysis = {
  skin_type: string;
  summary: string;
  concerns: { name: string; severity: "low" | "moderate" | "high"; note: string }[];
  scores: Record<string, number>;
  routine: { step: string; product_type: string; ingredient_focus: string; when: "AM" | "PM" | "Both" }[];
  model_used?: string;
};

export type SkinAnalysisError = {
  ok: false;
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
};
export type SkinAnalysisResult = ({ ok: true } & SkinAnalysis) | SkinAnalysisError;

const SYSTEM = `You are a clinical-grade cosmetic dermatology AI. Analyze the uploaded selfie and return a precise, non-diagnostic skin assessment. Never provide medical diagnoses. If the photo is unclear or not a face, set skin_type to "unclear" and explain in summary. Output ONLY valid JSON matching the requested schema.`;

const SCHEMA_PROMPT = `Return JSON with this exact shape:
{
  "skin_type": "oily" | "dry" | "combination" | "normal" | "sensitive" | "unclear",
  "summary": string (2-3 sentences),
  "concerns": [{ "name": string, "severity": "low"|"moderate"|"high", "note": string }],
  "scores": { "hydration": 0-100, "oiliness": 0-100, "redness": 0-100, "texture": 0-100, "pigmentation": 0-100, "pores": 0-100, "elasticity": 0-100 },
  "routine": [{ "step": string, "product_type": string, "ingredient_focus": string, "when": "AM"|"PM"|"Both" }]
}
Be specific and actionable. 4-7 concerns. 5-7 routine steps.`;

export const analyzeSkin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }): Promise<SkinAnalysisResult> => {
    const { lovableChat, AIGatewayError } = await import("./ai-gateway.server");

    const tier: SkinModelTier = data.tier ?? "fast";
    const primary = SKIN_MODELS[tier];
    const fallbacks = Object.values(SKIN_MODELS).filter((m) => m !== primary);

    try {
      const result = await lovableChat(
        {
          model: primary,
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                { type: "text", text: SCHEMA_PROMPT },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        },
        { maxRetries: 3, timeoutMs: 45000, fallbackModels: fallbacks },
      );

      const raw = result?.choices?.[0]?.message?.content ?? "{}";
      const modelUsed: string = result?.model ?? primary;
      let parsed: SkinAnalysis;
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          return {
            ok: false,
            code: "parse_error",
            message:
              "The AI response could not be read. Please try again with a clearer, well-lit selfie.",
            retryable: true,
          };
        }
        parsed = JSON.parse(match[0]);
      }
      parsed.model_used = modelUsed;

      try {
        await context.supabase.from("skin_analyses").insert({
          user_id: context.userId,
          skin_type: parsed.skin_type,
          summary: parsed.summary,
          concerns: parsed.concerns ?? [],
          scores: parsed.scores ?? {},
          routine: parsed.routine ?? [],
          model: modelUsed,
        });
      } catch (e) {
        console.error("skin_analyses insert failed", e);
      }

      return { ok: true, ...parsed };
    } catch (e) {
      if (e instanceof AIGatewayError) {
        return {
          ok: false,
          code: e.code,
          message: e.userMessage,
          retryable: ["rate_limited", "server_error", "timeout", "network"].includes(e.code),
          retryAfterMs: e.retryAfterMs,
        };
      }
      console.error("analyzeSkin unexpected error", e);
      return {
        ok: false,
        code: "unknown",
        message: "Unexpected error during analysis. Please try again.",
        retryable: true,
      };
    }
  });
