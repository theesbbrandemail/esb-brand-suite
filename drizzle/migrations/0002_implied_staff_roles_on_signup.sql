CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _email TEXT := lower(NEW.email);
  _domain TEXT := split_part(_email, '@', 2);
  _assigned public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'))
  ON CONFLICT (id) DO NOTHING;

  SELECT role INTO _assigned FROM public.staff_allowlist
   WHERE email = _email OR email = '@' || _domain
   ORDER BY length(email) DESC LIMIT 1;
  IF _assigned IS NULL THEN _assigned := 'public'; END IF;

  -- Higher roles automatically include the access of the roles below them
  INSERT INTO public.user_roles (user_id, role)
  SELECT NEW.id, r FROM unnest(CASE _assigned
    WHEN 'super_admin' THEN ARRAY['super_admin','admin','staff']::public.app_role[]
    WHEN 'admin' THEN ARRAY['admin','staff']::public.app_role[]
    WHEN 'manager' THEN ARRAY['manager','staff']::public.app_role[]
    ELSE ARRAY[_assigned] END) AS r
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;