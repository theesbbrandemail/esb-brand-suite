ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS reschedule_reason text,
  ADD COLUMN IF NOT EXISTS previous_scheduled_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamp with time zone;