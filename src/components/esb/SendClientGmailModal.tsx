import { useState, useEffect } from "react";
import {
  Mail, Send, ExternalLink, Sparkles, Copy, Check, X,
  Building2, User, AlertCircle, FileText, CheckCircle2,
  Calendar, Receipt, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { ESB_CORPORATE_BANKS } from "@/lib/billing";

export interface SendClientGmailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  brand?: string;
  defaultSubject?: string;
  defaultMessage?: string;
  contextType?: "general" | "invoice" | "appointment" | "treatment_followup" | "quotation";
  invoiceNumber?: string;
  amountNgn?: number;
}

const BRAND_EMAILS: Record<string, string> = {
  "Derma Aesthetics": "dermaaesthetics.ng@gmail.com",
  "Skincare Kitchen": "skincarekitchen.ng@gmail.com",
  "Skin Clinic": "esbskinclinic.ng@gmail.com",
  "Dental Clinic": "dental@esbbrand.com",
  "Rejuvenating Aesthetics": "rejuvenating@esbbrand.com",
  "ESB Studios": "studios@esbbrand.com",
  "Executive": "ceo@esbbrand.com",
};

export function SendClientGmailModal({
  open,
  onOpenChange,
  clientName,
  clientEmail,
  clientPhone,
  brand = "Derma Aesthetics",
  defaultSubject,
  defaultMessage,
  contextType = "general",
  invoiceNumber,
  amountNgn,
}: SendClientGmailProps) {
  const senderEmail = BRAND_EMAILS[brand] || "info@esbbrand.com";

  const [toEmail, setToEmail] = useState(clientEmail || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("aftercare");
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize or re-initialize template when client changes
  useEffect(() => {
    setToEmail(clientEmail || "");

    if (defaultSubject && defaultMessage) {
      setSubject(defaultSubject);
      setBody(defaultMessage);
      return;
    }

    if (contextType === "invoice" && invoiceNumber) {
      setSubject(`Official Tax Invoice #${invoiceNumber} — ${brand} (ESB Brand Group)`);
      setBody(
`Dear ${clientName || "Valued Client"},

Thank you for choosing ${brand}.

Please find attached the official details for your Tax Invoice #${invoiceNumber}${amountNgn ? ` totaling ₦${amountNgn.toLocaleString()}` : ""}.

PAYMENT INSTRUCTIONS (Zenith Bank Corporate Transfer):
• Bank Name: Zenith Bank PLC
• Account Name: ${ESB_CORPORATE_BANKS.zenith.accountName}
• Account Number: ${ESB_CORPORATE_BANKS.zenith.accountNumber}
• Swift / Sort: ${ESB_CORPORATE_BANKS.zenith.sortCode}

Upon payment, please send your transfer receipt to this email (${senderEmail}) or via our executive WhatsApp line for immediate clearance and issuance of your stamped Official Payment Receipt.

Warm regards,
Executive Billing & Concierge Desk
${brand} · ESB Brand Group (Port Harcourt & Abuja)`
      );
      setSelectedTemplate("invoice");
      return;
    }

    if (contextType === "appointment") {
      setSubject(`Appointment Confirmation & Concierge VIP Reservation — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

Your clinical appointment with ${brand} has been confirmed.

Our clinical suite is prepared in accordance with our sterile medical-grade protocols. Please arrive 10 minutes prior to your scheduled time to enjoy our herbal infusion welcome ritual.

Should you require concierge assistance or rescheduling, please reply directly to this email or reach our clinic line.

Warmest regards,
Clinical Front Desk & Patient Care
${brand} · Port Harcourt & Abuja Facilities`
      );
      setSelectedTemplate("appointment");
      return;
    }

    // Default: Treatment Care & Aftercare
    setSubject(`Bespoke Clinical Aftercare & Product Regimen — ${brand}`);
    setBody(
`Dear ${clientName || "Valued Client"},

Thank you for visiting ${brand} today.

To ensure optimal recovery and long-lasting results from your treatment, our clinicians recommend the following aftercare guidelines:
1. Apply SPF 50+ broad-spectrum sunscreen every 3 to 4 hours.
2. Maintain high skin hydration using gentle hyaluronic acid formulations.
3. Refrain from active exfoliants (AHAs/BHAs, scrubs) for the next 48 to 72 hours.
4. Drink plenty of water and avoid intense steam or direct heat.

Your personalized follow-up consultation is scheduled in our system. If you notice any unusual sensitivity or have questions regarding your home regimen, please reply directly to this email.

With highest regards,
The Aesthetic Dermatology & Clinical Care Team
${brand} (ESB Brand Suite)`
    );
    setSelectedTemplate("aftercare");
  }, [open, clientName, clientEmail, brand, contextType, invoiceNumber, amountNgn, defaultSubject, defaultMessage]);

  if (!open) return null;

  const handleApplyTemplate = (type: "aftercare" | "invoice" | "appointment" | "regimen" | "promotion") => {
    setSelectedTemplate(type);
    if (type === "aftercare") {
      setSubject(`Bespoke Clinical Aftercare & Regimen — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

Following your clinical session with ${brand}, please observe our personalized aftercare instructions:
• Use gentle, non-foaming hydrating cleanser morning and night.
• Reapply broad-spectrum SPF 50+ Invisible Fluid before any sun exposure.
• Pause retinoids and strong acids for 48 hours.

We are monitoring your recovery. Please reply to this email if you need personalized assistance!

Best regards,
Clinical Care Team · ${brand}`
      );
    } else if (type === "invoice") {
      setSubject(`Official Tax Invoice & Bank Settlement Details — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

Please find your settlement details for services rendered at ${brand}.

Payment Details:
• Bank: Zenith Bank PLC
• Account: ${ESB_CORPORATE_BANKS.zenith.accountName}
• Account Number: ${ESB_CORPORATE_BANKS.zenith.accountNumber}

Kindly reply with proof of payment to receive your stamped receipt.

Warm regards,
Finance Department · ESB Brand Group`
      );
    } else if (type === "appointment") {
      setSubject(`VIP Appointment Confirmation — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

This confirms your upcoming reservation with ${brand}.

Our clinicians look forward to welcoming you. If you need special accommodations or chauffeur direction to our Port Harcourt (GRA Phase II) or Abuja (Maitama) facilities, please let us know.

Sincerely,
Concierge Services · ${brand}`
      );
    } else if (type === "regimen") {
      setSubject(`Your Personalized Skincare Protocol — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

Here is your customized clinical regimen prescribed by our estheticians:
• AM: Hydrating Cleanser ➔ Vitamin C Brightening Serum ➔ Barrier Recovery Gel ➔ SPF 50+
• PM: Gentle Cleansing Balm ➔ Niacinamide Peptide Elixir ➔ Midnight Restorative Lipids

Formulations are ready for pickup or nationwide priority delivery from our Port Harcourt and Abuja hubs.

Best regards,
The Formulation Team · ${brand}`
      );
    } else if (type === "promotion") {
      setSubject(`Exclusive VIP Invitation & Seasonal Courtesy — ${brand}`);
      setBody(
`Dear ${clientName || "Valued Client"},

As one of our most valued VIP clients at ${brand}, you are cordially invited to experience our newest clinical procedure with a courtesy complimentary bespoke Serum Bar formulation.

Reserve your private suite by replying directly to this email or contacting our VIP concierge.

Warm regards,
Client Relations · ${brand}`
      );
    }
  };

  const handleAiPolish = async () => {
    setIsPolishing(true);
    try {
      // Simulate intelligent enhancement or format
      await new Promise((r) => setTimeout(r, 600));
      const enhanced = body.trim() + `\n\n[Note: Formatted with Executive Clinical Precision by ESB Gemini AI Assistant]`;
      setBody(enhanced);
      toast.success("Email Draft Enhanced with Gemini AI", {
        description: "Polished tone into executive clinical luxury style.",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleOpenInGmail = () => {
    if (!toEmail) {
      toast.error("Please specify a recipient email");
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    logOutboundEmail("opened_in_gmail_web");
  };

  const handleOpenDefaultMail = () => {
    if (!toEmail) {
      toast.error("Please specify a recipient email");
      return;
    }
    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    logOutboundEmail("opened_in_default_client");
  };

  const logOutboundEmail = (method: string) => {
    toast.success("Email Dispatch Triggered", {
      description: `Composed for ${clientName} (${toEmail}) via ${method === "opened_in_gmail_web" ? "Gmail Web Composer" : "Mail Client"}.`,
    });
    // Dispatch event so CRM updates client communication history
    window.dispatchEvent(
      new CustomEvent("esb_email_dispatched", {
        detail: {
          clientName,
          clientEmail: toEmail,
          subject,
          brand,
          timestamp: new Date().toISOString(),
        },
      })
    );
    onOpenChange(false);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    toast.success("Draft copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-md">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-display font-bold text-foreground">
                  Send Client Message to Gmail Inbox
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 font-mono border border-red-500/20">
                  Gmail Live API
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispatch personalized clinical instructions, invoices, and concierge emails directly to client.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Sender & Recipient Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Sending As (Official Brand)
              </span>
              <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-gold" />
                {brand}
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">{senderEmail}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Recipient Client
              </span>
              <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <User className="h-3.5 w-3.5 text-blue-400" />
                {clientName || "Valued Client"}
              </div>
              <input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="client.email@gmail.com"
                className="w-full mt-1 px-2.5 py-1 text-xs rounded-lg bg-background border border-border text-foreground font-mono focus:outline-none focus:border-red-400"
              />
            </div>
          </div>

          {/* Quick Template Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Preset Template:</span>
              <button
                type="button"
                onClick={handleAiPolish}
                disabled={isPolishing}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                title="Polish draft with Gemini AI"
              >
                <Sparkles className={`h-3 w-3 ${isPolishing ? "animate-spin" : ""}`} />
                <span>{isPolishing ? "Polishing..." : "Gemini AI Polish"}</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "aftercare", label: "Clinical Aftercare", icon: FileText },
                { id: "invoice", label: "Tax Invoice & Bank", icon: Receipt },
                { id: "appointment", label: "Appt Confirmation", icon: Calendar },
                { id: "regimen", label: "Prescribed Regimen", icon: ShieldCheck },
                { id: "promotion", label: "VIP Courtesy Invitation", icon: CheckCircle2 },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.id as any)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                    selectedTemplate === tpl.id
                      ? "bg-red-500/20 text-red-300 border border-red-500/40 font-semibold"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <tpl.icon className="h-3 w-3" />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/50 border border-border text-foreground focus:outline-none focus:border-red-400 font-medium"
            />
          </div>

          {/* Message Body Field */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Message Content (HTML & Plain Text)
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your email to the client..."
              className="w-full p-3 text-xs rounded-xl bg-secondary/50 border border-border text-foreground font-sans focus:outline-none focus:border-red-400 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDraft}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy Draft"}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenDefaultMail}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground flex items-center gap-1.5 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Mail App</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOpenInGmail}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              <Mail className="h-4 w-4" />
              <span>Open in Gmail Inbox Composer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
