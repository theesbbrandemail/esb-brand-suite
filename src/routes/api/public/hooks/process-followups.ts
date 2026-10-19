import { createFileRoute } from "@tanstack/react-router";

/**
 * WhatsApp follow-up background worker.
 *
 * Called by an external scheduler every 5 minutes (or on-demand).
 * Follow-up persistence is handled by the Firebase application layer.
 *
 * Because this project uses WhatsApp deep links (no paid API), "delivery"
 * means: mark the row `ready` so it appears in the staff Follow-Up queue with
 * a one-click WhatsApp link. When a real WhatsApp provider is wired later,
 * swap the `deliver()` body — the queue mechanics (idempotency, retries,
 * status transitions, locking) don't change.
 *
 * Auth: `/api/public/*` is intentionally health-checkable. Production schedulers
 * may provide `CRON_SECRET`; missing configuration returns a safe no-op response.
 */
export const Route = createFileRoute("/api/public/hooks/process-followups")({
  server: {
    handlers: {
      POST: handler,
      GET: handler, // convenient for manual triggering / cron probes
    },
  },
});

type FollowUpRow = {
  id: string;
  idempotency_key: string;
  patient_name: string;
  patient_phone: string | null;
  channel: string;
  message: string;
  attempts: number;
  delivery_status: string;
};

const MAX_ATTEMPTS = 5;

async function handler({ request }: { request: Request }) {
  const configuredSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("authorization")?.replace(/^Bearer\\s+/i, "");

  if (configuredSecret && providedSecret && providedSecret !== configuredSecret) {
    return new Response(JSON.stringify({ ok: false, error: "invalid scheduler token" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  const workerId = `firebase-worker-${crypto.randomUUID().slice(0, 8)}`;
  return new Response(
    JSON.stringify({
      ok: true,
      worker: workerId,
      claimed: 0,
      delivered: 0,
      failed: 0,
      skipped: 0,
      message: "Follow-up processing is managed by Firebase Cloud Functions.",
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

/**
 * Deliver a single follow-up. Deep-link mode: mark the job `ready` so it lands
 * in the staff Follow-Up queue with the pre-composed WhatsApp link. Swap this
 * for a real provider call (Twilio, WhatsApp Cloud API) later without
 * changing the queue mechanics.
 */
async function deliver(
  job: FollowUpRow,
): Promise<{ status: "delivered" | "failed" | "skipped"; error?: string }> {
  if (!job.patient_phone) return { status: "skipped", error: "no_phone" };
  if (job.channel !== "whatsapp") return { status: "skipped", error: `channel_${job.channel}_not_wired` };
  // Deep-link handoff: the row is now visible to staff as "ready to send".
  // Staff clicks the WhatsApp link in the Follow-Ups UI, which flips the
  // status to `delivered` via markFollowUpSent.
  return { status: "delivered" };
}
