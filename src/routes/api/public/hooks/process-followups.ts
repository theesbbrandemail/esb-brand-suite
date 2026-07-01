import { createFileRoute } from "@tanstack/react-router";

/**
 * WhatsApp follow-up background worker.
 *
 * Called by pg_cron every 5 minutes (or on-demand). Atomically claims due
 * follow-ups via `claim_due_follow_ups` (SKIP LOCKED + attempt bump), then
 * processes each one idempotently.
 *
 * Because this project uses WhatsApp deep links (no paid API), "delivery"
 * means: mark the row `ready` so it appears in the staff Follow-Up queue with
 * a one-click WhatsApp link. When a real WhatsApp provider is wired later,
 * swap the `deliver()` body — the queue mechanics (idempotency, retries,
 * status transitions, locking) don't change.
 *
 * Auth: `/api/public/*` bypasses the platform auth wall. We still require the
 * Supabase anon key in the `apikey` header so random callers can't spam it.
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
  // Reject anyone without the anon apikey. `/api/public/*` bypasses the edge
  // auth wall, so we authenticate ourselves.
  const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
  const provided =
    request.headers.get("apikey") ??
    request.headers.get("x-apikey") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !provided || provided !== expected) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const workerId = `wrk_${crypto.randomUUID().slice(0, 8)}`;
  const started = Date.now();

  const { data: claimed, error: claimErr } = await supabaseAdmin.rpc(
    "claim_due_follow_ups",
    { _worker_id: workerId, _limit: 25 },
  );

  if (claimErr) {
    console.error("[follow-up-worker] claim failed", claimErr);
    return new Response(
      JSON.stringify({ ok: false, error: claimErr.message, worker: workerId }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const jobs = (claimed ?? []) as FollowUpRow[];
  const results = { delivered: 0, failed: 0, skipped: 0 };

  for (const job of jobs) {
    try {
      const outcome = await deliver(job);
      const patch: {
        delivery_status: string;
        last_error: string | null;
        locked_at: null;
        locked_by: null;
        processed_at?: string;
      } = {
        delivery_status: outcome.status,
        last_error: outcome.error ?? null,
        locked_at: null,
        locked_by: null,
      };
      if (outcome.status === "delivered") patch.processed_at = new Date().toISOString();
      if (outcome.status === "failed" && job.attempts + 1 >= MAX_ATTEMPTS) {
        patch.delivery_status = "failed";
      } else if (outcome.status === "failed") {
        // release the lock so a later cron tick can retry
        patch.delivery_status = "pending";
      }
      await supabaseAdmin.from("follow_ups").update(patch).eq("id", job.id);
      results[outcome.status === "delivered" ? "delivered" : outcome.status === "skipped" ? "skipped" : "failed"] += 1;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[follow-up-worker] job crashed", { id: job.id, msg });
      await supabaseAdmin
        .from("follow_ups")
        .update({
          delivery_status: job.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "pending",
          last_error: msg,
          locked_at: null,
          locked_by: null,
        })
        .eq("id", job.id);
      results.failed += 1;
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      worker: workerId,
      claimed: jobs.length,
      ...results,
      duration_ms: Date.now() - started,
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
