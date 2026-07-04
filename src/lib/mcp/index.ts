import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listAppointmentsTool from "./tools/list-appointments";
import createAppointmentTool from "./tools/create-appointment";
import listFollowUpsTool from "./tools/list-follow-ups";
import kpisTool from "./tools/kpis";
import whatsappLinkTool from "./tools/whatsapp-link";

// See app-mcp-server-authoring: use direct Supabase host, never the .lovable.cloud proxy.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "esb-brand-mcp",
  title: "ESB Brand MCP",
  version: "0.1.0",
  instructions:
    "Tools for ESB Brand's operations suite: browse and book appointments across branches, inspect WhatsApp follow-ups, read live KPIs, and build wa.me deep links. All tools run as the signed-in ESB user (RLS enforced).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listAppointmentsTool,
    createAppointmentTool,
    listFollowUpsTool,
    kpisTool,
    whatsappLinkTool,
  ],
});
