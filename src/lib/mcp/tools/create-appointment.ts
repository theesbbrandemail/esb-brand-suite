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
  name: "create_appointment",
  title: "Create appointment",
  description: "Book an ESB appointment for a patient at a specific branch and time.",
  inputSchema: {
    patient_name: z.string().min(1),
    patient_phone: z.string().min(5),
    service: z.string().min(1).describe("Service name, e.g. 'Skin Consult', 'Facial', 'Dental Cleaning'."),
    branch: z.string().min(1).describe("Branch name, e.g. Lagos, Abuja, Port Harcourt."),
    scheduled_at: z.string().datetime().describe("ISO 8601 UTC datetime."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await db(ctx)
      .from("appointments")
      .insert({ ...input, status: "scheduled" })
      .select("id, patient_name, service, branch, scheduled_at, status")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Booked ${data.service} for ${data.patient_name} at ${data.branch}.` }],
      structuredContent: { appointment: data },
    };
  },
});
