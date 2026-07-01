
ALTER TABLE public.follow_ups
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS attempts int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_by text,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- Backfill idempotency for any pre-existing rows
UPDATE public.follow_ups
   SET idempotency_key = COALESCE(idempotency_key,
        encode(digest(id::text || COALESCE(appointment_id::text,'') || scheduled_at::text, 'sha256'), 'hex'))
 WHERE idempotency_key IS NULL;

ALTER TABLE public.follow_ups
  ALTER COLUMN idempotency_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS follow_ups_idempotency_key_uidx
  ON public.follow_ups(idempotency_key);

CREATE INDEX IF NOT EXISTS follow_ups_worker_pick_idx
  ON public.follow_ups(delivery_status, scheduled_at)
  WHERE delivery_status IN ('pending','ready');

-- Sync legacy `status` values into `delivery_status` on the initial run
UPDATE public.follow_ups
   SET delivery_status = CASE
     WHEN status = 'sent' THEN 'delivered'
     ELSE 'pending'
   END
 WHERE delivery_status = 'pending' AND status IS NOT NULL;

-- Trigger: keep delivery_status/legacy status in sync when either is written
CREATE OR REPLACE FUNCTION public.sync_followup_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.delivery_status = 'delivered' AND NEW.status IS DISTINCT FROM 'sent' THEN
    NEW.status := 'sent';
    IF NEW.sent_at IS NULL THEN NEW.sent_at := now(); END IF;
  END IF;
  IF NEW.status = 'sent' AND NEW.delivery_status NOT IN ('delivered','failed','skipped') THEN
    NEW.delivery_status := 'delivered';
    IF NEW.sent_at IS NULL THEN NEW.sent_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS follow_ups_sync_status ON public.follow_ups;
CREATE TRIGGER follow_ups_sync_status
  BEFORE INSERT OR UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.sync_followup_status();

-- Worker RPC: atomically claim up to N due follow-ups.
-- Locks skip rows that another worker already holds. Stale locks (>5 min) are
-- automatically reclaimed so a crashed worker never blocks the queue.
CREATE OR REPLACE FUNCTION public.claim_due_follow_ups(_worker_id text, _limit int DEFAULT 25)
RETURNS SETOF public.follow_ups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
      FROM public.follow_ups
     WHERE delivery_status IN ('pending','ready')
       AND scheduled_at <= now()
       AND (locked_at IS NULL OR locked_at < now() - interval '5 minutes')
     ORDER BY scheduled_at ASC
     LIMIT _limit
     FOR UPDATE SKIP LOCKED
  )
  UPDATE public.follow_ups f
     SET locked_at = now(),
         locked_by = _worker_id,
         attempts = f.attempts + 1,
         last_attempt_at = now()
    FROM due
   WHERE f.id = due.id
  RETURNING f.*;
END $$;

REVOKE ALL ON FUNCTION public.claim_due_follow_ups(text, int) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_due_follow_ups(text, int) TO service_role;
