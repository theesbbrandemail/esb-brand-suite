DROP POLICY IF EXISTS "inventory readable" ON public.inventory;

CREATE POLICY "inventory staff read"
ON public.inventory
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_allowlist TO authenticated;
GRANT ALL ON public.staff_allowlist TO service_role;

CREATE POLICY "staff allowlist admin manage"
ON public.staff_allowlist
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));