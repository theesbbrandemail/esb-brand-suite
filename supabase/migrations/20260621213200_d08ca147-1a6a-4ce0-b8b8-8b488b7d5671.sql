-- CEO biometric credentials (WebAuthn)
CREATE TABLE public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT,
  transports TEXT[],
  device_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webauthn_credentials TO authenticated;
GRANT ALL ON public.webauthn_credentials TO service_role;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads creds" ON public.webauthn_credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner inserts creds" ON public.webauthn_credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates creds" ON public.webauthn_credentials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes creds" ON public.webauthn_credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AI automation tasks with approval queue
CREATE TYPE public.ai_task_status AS ENUM ('pending', 'approved', 'rejected', 'executed', 'failed');
CREATE TYPE public.ai_task_risk AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE public.ai_automation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  risk public.ai_task_risk NOT NULL DEFAULT 'low',
  status public.ai_task_status NOT NULL DEFAULT 'pending',
  payload JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  impact_estimate TEXT,
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_automation_tasks TO authenticated;
GRANT ALL ON public.ai_automation_tasks TO service_role;
ALTER TABLE public.ai_automation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read tasks" ON public.ai_automation_tasks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff insert tasks" ON public.ai_automation_tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin updates tasks" ON public.ai_automation_tasks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin deletes tasks" ON public.ai_automation_tasks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ai_tasks_updated BEFORE UPDATE ON public.ai_automation_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Skin analyses (customer)
CREATE TABLE public.skin_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT,
  skin_type TEXT,
  concerns JSONB DEFAULT '[]'::jsonb,
  scores JSONB DEFAULT '{}'::jsonb,
  routine JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.skin_analyses TO authenticated;
GRANT ALL ON public.skin_analyses TO service_role;
ALTER TABLE public.skin_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user reads own analyses" ON public.skin_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user inserts own analyses" ON public.skin_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user deletes own analyses" ON public.skin_analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Seed a few demo AI automation tasks
INSERT INTO public.ai_automation_tasks (title, description, category, risk, impact_estimate) VALUES
  ('Reallocate $2.4K marketing spend', 'Move budget from display ads into retention email flows based on last 30d ROAS.', 'Marketing', 'medium', '+$8.1K projected revenue / 30d'),
  ('Auto-restock 14 low SKUs', 'Place purchase orders for stock below safety threshold across both brands.', 'Inventory', 'high', '-$0 stockout risk on 14 SKUs'),
  ('Send loyalty offer to 312 dormant clients', 'Personalized 15% comeback offer for clients inactive 60+ days.', 'CRM', 'low', '+62 projected bookings'),
  ('Roll out dynamic pricing on 8 treatments', 'Adjust pricing ±12% based on demand windows.', 'Pricing', 'critical', '+$14.2K monthly margin'),
  ('Auto-publish 6 IG carousels', 'Generated content reviewed and ready for posting.', 'Content', 'low', '+est 4.8K reach');