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
  name: "list_appointments",
  title: "List appointments",
  description:
    "List ESB appointments visible to the signed-in staff member, optionally filtered by branch or by an upcoming window in days.",
  inputSchema: {
    branch: z.string().optional().describe("Optional branch name filter (e.g. Lagos, Abuja, Port Harcourt)."),
    upcomingDays: z
      .number()
      .int()
      .min(0)
      .max(90)
      .optional()
      .describe("If set, only return appointments scheduled within the next N days."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ branch, upcomingDays, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let q = db(ctx)
      .from("appointments")
      .select("id, patient_name, patient_phone, service, branch, scheduled_at, status")
      .order("scheduled_at", { ascending: true })
      .limit(limit);
    if (branch) q = q.ilike("branch", `%${branch}%`);
    if (typeof upcomingDays === "number") {
      const now = new Date();
      const end = new Date(now.getTime() + upcomingDays * 86400_000);
      q = q.gte("scheduled_at", now.toISOString()).lte("scheduled_at", end.toISOString());
    }
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.length ?? 0} appointment(s)` }],
      structuredContent: { appointments: data ?? [] },
    };
  },
});
