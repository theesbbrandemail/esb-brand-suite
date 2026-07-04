import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "whatsapp_deeplink",
  title: "Build WhatsApp deep link",
  description:
    "Build a wa.me deep link for a phone number with a pre-filled message. Useful for staff to hand off a follow-up to WhatsApp.",
  inputSchema: {
    phone: z.string().describe("E.164 phone, digits only (leading + optional)."),
    message: z.string().min(1),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ phone, message }) => {
    const digits = phone.replace(/[^\d]/g, "");
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    return {
      content: [{ type: "text", text: url }],
      structuredContent: { url },
    };
  },
});
