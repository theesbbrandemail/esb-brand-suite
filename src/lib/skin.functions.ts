import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  imageDataUrl: z
    .string()
    .min(50)
    .refine((s) => s.startsWith("data:image/"), "Must be an image data URL"),
});

export type SkinAnalysis = {
  skin_type: string;
  summary: string;
  concerns: { name: string; severity: "low" | "moderate" | "high"; note: string }[];
  scores: Record<string, number>;
  routine: { step: string; product_type: string; ingredient_focus: string; when: "AM" | "PM" | "Both" }[];
};

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
  .handler(async ({ data, context }) => {
    const { lovableChat } = await import("./ai-gateway.server");

    const result = await lovableChat({
      model: "google/gemini-2.5-flash",
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
    });

    const raw = result?.choices?.[0]?.message?.content ?? "{}";
    let parsed: SkinAnalysis;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : ({} as SkinAnalysis);
    }

    // Persist (best effort, ignore errors)
    try {
      await context.supabase.from("skin_analyses").insert({
        user_id: context.userId,
        skin_type: parsed.skin_type,
        summary: parsed.summary,
        concerns: parsed.concerns ?? [],
        scores: parsed.scores ?? {},
        routine: parsed.routine ?? [],
        model: "google/gemini-2.5-flash",
      });
    } catch (e) {
      console.error("skin_analyses insert failed", e);
    }

    return parsed;
  });
