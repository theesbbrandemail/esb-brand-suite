CREATE TABLE public.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price numeric NOT NULL DEFAULT 0,
  cost numeric NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_catalog TO authenticated;
GRANT ALL ON public.service_catalog TO service_role;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service catalog readable auth" ON public.service_catalog FOR SELECT TO authenticated USING (true);
CREATE POLICY "service catalog staff manage" ON public.service_catalog FOR ALL TO authenticated
  USING (has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER service_catalog_touch BEFORE UPDATE ON public.service_catalog FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS cost numeric;

CREATE TABLE public.appointment_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointment_feedback_created ON public.appointment_feedback(created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_feedback TO authenticated;
GRANT ALL ON public.appointment_feedback TO service_role;
ALTER TABLE public.appointment_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback staff read" ON public.appointment_feedback FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role) OR patient_user_id = auth.uid());
CREATE POLICY "feedback patient insert" ON public.appointment_feedback FOR INSERT TO authenticated
  WITH CHECK (patient_user_id = auth.uid() OR has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "feedback staff manage" ON public.appointment_feedback FOR ALL TO authenticated
  USING (has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'staff'::app_role) OR has_role(auth.uid(),'admin'::app_role));

INSERT INTO public.service_catalog (name, price, cost) VALUES
  ('Skin Consult', 120, 42),
  ('Facial', 180, 63),
  ('Chemical Peel', 260, 98),
  ('Laser Treatment', 420, 165),
  ('Dental Cleaning', 150, 48),
  ('Dental Consult', 90, 25),
  ('Rejuvenating Therapy', 340, 130),
  ('Microneedling', 300, 115),
  ('Acne Treatment', 200, 70),
  ('Follow-up Review', 60, 15)
ON CONFLICT (name) DO NOTHING;

UPDATE public.appointments a
   SET price = COALESCE(a.price, s.price),
       cost  = COALESCE(a.cost, s.cost)
  FROM public.service_catalog s
 WHERE lower(trim(a.service)) = lower(s.name);

UPDATE public.appointments
   SET price = COALESCE(price, 184),
       cost  = COALESCE(cost, 66)
 WHERE price IS NULL OR cost IS NULL;