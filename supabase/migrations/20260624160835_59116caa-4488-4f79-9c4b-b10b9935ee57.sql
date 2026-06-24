
-- branches
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  country text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO authenticated, anon;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches readable" ON public.branches FOR SELECT USING (true);
CREATE POLICY "branches staff manage" ON public.branches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER branches_touch BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE,
  name text NOT NULL,
  brand text,
  description text,
  category text,
  price numeric(10,2),
  image_url text,
  recommended_for text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO authenticated, anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products readable" ON public.products FOR SELECT USING (active OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products staff manage" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- inventory
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, product_id)
);
GRANT SELECT ON public.inventory TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.inventory TO authenticated;
GRANT ALL ON public.inventory TO service_role;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory readable" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "inventory staff manage" ON public.inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER inventory_touch BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- appointments
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_phone text,
  patient_email text,
  service text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "appts staff all" ON public.appointments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "appts patient view" ON public.appointments FOR SELECT TO authenticated USING (patient_user_id = auth.uid());
CREATE TRIGGER appointments_touch BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- follow_ups
CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  patient_phone text,
  patient_email text,
  channel text NOT NULL DEFAULT 'in_app',
  message text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fu staff all" ON public.follow_ups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "fu patient view" ON public.follow_ups FOR SELECT TO authenticated USING (patient_user_id = auth.uid());
CREATE TRIGGER follow_ups_touch BEFORE UPDATE ON public.follow_ups FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ceo_reminders
CREATE TABLE public.ceo_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  category text DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  due_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ceo_reminders TO authenticated;
GRANT ALL ON public.ceo_reminders TO service_role;
ALTER TABLE public.ceo_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminders own" ON public.ceo_reminders FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER ceo_reminders_touch BEFORE UPDATE ON public.ceo_reminders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- product_recommendations
CREATE TABLE public.product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skin_analysis_id uuid NOT NULL REFERENCES public.skin_analyses(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reason text,
  rank integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.product_recommendations TO authenticated;
GRANT ALL ON public.product_recommendations TO service_role;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reco owner select" ON public.product_recommendations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.skin_analyses sa WHERE sa.id = skin_analysis_id AND sa.user_id = auth.uid())
         OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reco owner write" ON public.product_recommendations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.skin_analyses sa WHERE sa.id = skin_analysis_id AND sa.user_id = auth.uid()));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;

-- Seed branches & demo products
INSERT INTO public.branches (name, city, country, phone) VALUES
  ('ESB Lagos Flagship', 'Lagos', 'Nigeria', '+234 800 000 0001'),
  ('ESB Abuja', 'Abuja', 'Nigeria', '+234 800 000 0002'),
  ('ESB Port Harcourt', 'Port Harcourt', 'Nigeria', '+234 800 000 0003');

INSERT INTO public.products (sku, name, brand, description, category, price, recommended_for) VALUES
  ('ESB-HC-01', 'Hydra Cream Rich', 'Skincare Kitchen', 'Deep hydration moisturizer with hyaluronic acid.', 'moisturizer', 38.00, ARRAY['dryness','dehydration','sensitivity']),
  ('ESB-VC-02', 'Vitamin C Serum 15%', 'Skincare Kitchen', 'Brightening antioxidant serum.', 'serum', 52.00, ARRAY['pigmentation','dullness','uneven_tone']),
  ('ESB-NB-03', 'Niacinamide 10%', 'Skincare Kitchen', 'Pore-refining oil-balancing serum.', 'serum', 28.00, ARRAY['oiliness','enlarged_pores','redness']),
  ('ESB-RT-04', 'Retinol 0.3% Night', 'Derma Aesthetics', 'Cell-turnover renewal night serum.', 'serum', 64.00, ARRAY['texture','fine_lines','pigmentation']),
  ('ESB-SPF-05','Mineral SPF 50',   'Skincare Kitchen', 'Broad-spectrum daily mineral sunscreen.', 'sunscreen', 34.00, ARRAY['pigmentation','sensitivity','redness','sun_damage']),
  ('ESB-SAL-06','Salicylic 2% Cleanser','Skincare Kitchen','Gentle exfoliating BHA cleanser.','cleanser',24.00, ARRAY['acne','blackheads','oiliness','enlarged_pores']),
  ('ESB-CRM-07','Ceramide Barrier Repair','Derma Aesthetics','Restores damaged moisture barrier.','moisturizer',46.00, ARRAY['sensitivity','redness','dryness','rosacea']),
  ('ESB-EYE-08','Peptide Eye Cream','Derma Aesthetics','Firms and brightens eye area.','eye-care',58.00, ARRAY['dark_circles','fine_lines','puffiness']);

-- Seed inventory for each branch (using deterministic stock levels)
INSERT INTO public.inventory (branch_id, product_id, qty, low_stock_threshold)
SELECT b.id, p.id,
       ((abs(hashtext(b.name || p.sku)) % 40) + 2)::int,
       6
FROM public.branches b CROSS JOIN public.products p;
