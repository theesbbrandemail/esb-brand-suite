import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function db(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_follow_ups",
  title: "List WhatsApp follow-ups",
  description: "List queued WhatsApp follow-ups, filterable by delivery status.",
  inputSchema: {
    status: z
      .enum(["pending", "ready", "delivered", "failed", "skipped"])
      .optional(),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = db(ctx)
      .from("follow_ups")
      .select("id, appointment_id, phone, message, delivery_status, attempts, scheduled_at, last_error")
      .order("scheduled_at", { ascending: true })
      .limit(limit);
    if (status) q = q.eq("delivery_status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} follow-up(s)` }],
      structuredContent: { follow_ups: data ?? [] },
    };
  },
});
