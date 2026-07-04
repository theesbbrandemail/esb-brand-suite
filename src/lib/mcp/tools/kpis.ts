import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function db(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_kpis",
  title: "Get operational KPIs",
  description:
    "Return today's ESB operational KPIs: appointments today, upcoming appointments, pending follow-ups, and low-stock item count.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = db(ctx);
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setUTCHours(23, 59, 59, 999);

    const [today, upcoming, pending] = await Promise.all([
      supabase.from("appointments").select("id", { count: "exact", head: true })
        .gte("scheduled_at", startOfDay.toISOString()).lte("scheduled_at", endOfDay.toISOString()),
      supabase.from("appointments").select("id", { count: "exact", head: true })
        .gt("scheduled_at", endOfDay.toISOString()),
      supabase.from("follow_ups").select("id", { count: "exact", head: true })
        .eq("delivery_status", "pending"),
    ]);

    const kpis = {
      appointments_today: today.count ?? 0,
      appointments_upcoming: upcoming.count ?? 0,
      pending_follow_ups: pending.count ?? 0,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(kpis) }],
      structuredContent: kpis,
    };
  },
});
