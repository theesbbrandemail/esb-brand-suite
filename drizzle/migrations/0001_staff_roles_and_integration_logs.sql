ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

CREATE TABLE IF NOT EXISTS public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration text NOT NULL,
  action text NOT NULL,
  status integer,
  message text,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_logs TO authenticated;
GRANT ALL ON public.integration_logs TO service_role;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read integration logs" ON public.integration_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
