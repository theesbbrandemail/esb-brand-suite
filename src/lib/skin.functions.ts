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

export type SkinProductRec = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  image_url: string | null;
  description: string | null;
  reason: string;
};

export type SkinAnalysis = {
  analysis_id?: string;
  skin_type: string;
  summary: string;
  concerns: { name: string; severity: "low" | "moderate" | "high"; note: string }[];
  scores: Record<string, number>;
  routine: { step: string; product_type: string; ingredient_focus: string; when: "AM" | "PM" | "Both" }[];
  recommendations?: SkinProductRec[];
  whatsapp_summary?: string;
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

/** Map free-form concern names from the AI to product tag tokens. */
function concernKey(name: string): string[] {
  const n = name.toLowerCase();
  const tags: string[] = [];
  if (/(acne|pimple|breakout|whitehead|blackhead)/.test(n)) tags.push("acne", "blackheads");
  if (/(oil|sebum|shine)/.test(n)) tags.push("oiliness");
  if (/(dry|dehydr|flak)/.test(n)) tags.push("dryness", "dehydration");
  if (/(pigment|dark spot|melasma|hyperpig|uneven)/.test(n)) tags.push("pigmentation", "uneven_tone");
  if (/(redness|rosacea|irritat)/.test(n)) tags.push("redness", "rosacea");
  if (/(sensitiv)/.test(n)) tags.push("sensitivity");
  if (/(pore)/.test(n)) tags.push("enlarged_pores");
  if (/(wrinkle|fine line|aging|elastic)/.test(n)) tags.push("fine_lines", "texture");
  if (/(dull|glow|radian)/.test(n)) tags.push("dullness");
  if (/(dark circle|under.?eye|puffy|puffiness)/.test(n)) tags.push("dark_circles", "puffiness");
  if (/(sun|uv)/.test(n)) tags.push("sun_damage");
  if (/(texture|rough|bumpy)/.test(n)) tags.push("texture");
  return tags.length ? tags : [n.replace(/[^a-z]+/g, "_")];
}

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

      // Persist analysis + match product recommendations
      let analysisId: string | undefined;
      const sb = context.supabase as any;
      try {
        const { data: row } = await sb
          .from("skin_analyses")
          .insert({
            user_id: context.userId,
            skin_type: parsed.skin_type,
            summary: parsed.summary,
            concerns: parsed.concerns ?? [],
            scores: parsed.scores ?? {},
            routine: parsed.routine ?? [],
            model: modelUsed,
          })
          .select("id")
          .single();
        analysisId = row?.id;
      } catch (e) {
        console.error("skin_analyses insert failed", e);
      }

      // Build recommendation tag set from AI concerns
      const tags = new Set<string>();
      for (const c of parsed.concerns ?? []) for (const t of concernKey(c.name)) tags.add(t);
      if (parsed.skin_type) tags.add(parsed.skin_type.toLowerCase());

      let recs: SkinProductRec[] = [];
      try {
        const { data: products } = await sb
          .from("products")
          .select("id,name,brand,category,price,image_url,description,recommended_for")
          .eq("active", true);
        const scored = (products ?? []).map((p: any) => {
          const hits = (p.recommended_for ?? []).filter((tag: string) => tags.has(tag));
          return { p, score: hits.length, hits };
        });
        recs = scored
          .filter((s: any) => s.score > 0)
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, 6)
          .map((s: any) => ({
            id: s.p.id,
            name: s.p.name,
            brand: s.p.brand,
            category: s.p.category,
            price: s.p.price ? Number(s.p.price) : null,
            image_url: s.p.image_url,
            description: s.p.description,
            reason: `Targets: ${s.hits.slice(0, 3).join(", ").replace(/_/g, " ")}`,
          }));

        if (analysisId && recs.length) {
          await sb.from("product_recommendations").insert(
            recs.map((r, i) => ({
              skin_analysis_id: analysisId,
              product_id: r.id,
              reason: r.reason,
              rank: i,
            })),
          );
        }
      } catch (e) {
        console.error("recommendation matching failed", e);
      }

      // WhatsApp-ready text summary
      const topConcerns = (parsed.concerns ?? []).slice(0, 3).map((c) => `• ${c.name} (${c.severity})`).join("\n");
      const topRecs = recs.slice(0, 3).map((r) => `• ${r.name}${r.brand ? ` — ${r.brand}` : ""}`).join("\n");
      const whatsapp_summary =
        `✨ *ESB Skin Report*\n` +
        `Type: *${parsed.skin_type}*\n\n` +
        (topConcerns ? `Concerns:\n${topConcerns}\n\n` : "") +
        (topRecs ? `Recommended:\n${topRecs}\n\n` : "") +
        `Summary: ${parsed.summary}\n\n` +
        `_AI guidance only — not a medical diagnosis._`;

      return { ok: true, ...parsed, analysis_id: analysisId, recommendations: recs, whatsapp_summary };
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
