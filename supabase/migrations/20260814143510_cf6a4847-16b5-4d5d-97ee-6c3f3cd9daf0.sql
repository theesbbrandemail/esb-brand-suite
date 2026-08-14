
DROP POLICY IF EXISTS "branches readable" ON public.branches;
CREATE POLICY "branches readable auth" ON public.branches FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.branches FROM anon;

DROP POLICY IF EXISTS "products readable" ON public.products;
CREATE POLICY "products readable auth" ON public.products FOR SELECT TO authenticated
USING (active OR has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
REVOKE ALL ON public.products FROM anon;

DROP POLICY IF EXISTS "appts patient insert" ON public.appointments;
CREATE POLICY "appts patient insert" ON public.appointments FOR INSERT TO authenticated
WITH CHECK (patient_user_id = auth.uid());
REVOKE ALL ON public.appointments FROM anon;
