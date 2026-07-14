
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can update by id" ON public.registrations;

-- Revoke direct table write access from anon/authenticated (admins still read/delete via existing policies)
REVOKE INSERT, UPDATE ON public.registrations FROM anon, authenticated;

-- Register helper: SECURITY DEFINER so anon can insert & receive their entry number
CREATE OR REPLACE FUNCTION public.register_entry(
  _full_name text,
  _phone text,
  _whatsapp text,
  _is_cloud9 boolean
)
RETURNS TABLE (
  id uuid,
  entry_number text,
  full_name text,
  phone text,
  whatsapp text,
  is_cloud9 boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF _full_name IS NULL OR length(btrim(_full_name)) < 2 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF _phone IS NULL OR length(btrim(_phone)) < 7 THEN
    RAISE EXCEPTION 'Invalid phone';
  END IF;
  IF _whatsapp IS NULL OR length(btrim(_whatsapp)) < 7 THEN
    RAISE EXCEPTION 'Invalid whatsapp';
  END IF;

  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9)
  VALUES (btrim(_full_name), btrim(_phone), btrim(_whatsapp), COALESCE(_is_cloud9, false))
  RETURNING registrations.id INTO new_id;

  RETURN QUERY
  SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9
  FROM public.registrations r
  WHERE r.id = new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_entry(text,text,text,boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.register_entry(text,text,text,boolean) TO anon, authenticated;

-- Engagement step helper: updates only allowed flag columns for a specific id
CREATE OR REPLACE FUNCTION public.mark_engagement_step(_id uuid, _step text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _step NOT IN ('whatsapp','instagram1','instagram2','youtube') THEN
    RAISE EXCEPTION 'Invalid step';
  END IF;

  IF _step = 'whatsapp' THEN
    UPDATE public.registrations SET whatsapp_done = true WHERE id = _id;
  ELSIF _step = 'instagram1' THEN
    UPDATE public.registrations SET instagram1_done = true WHERE id = _id;
  ELSIF _step = 'instagram2' THEN
    UPDATE public.registrations SET instagram2_done = true WHERE id = _id;
  ELSIF _step = 'youtube' THEN
    UPDATE public.registrations SET youtube_done = true WHERE id = _id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_engagement_step(uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.mark_engagement_step(uuid,text) TO anon, authenticated;

-- Tighten has_role: only usable from policies (definer) — revoke from anon/authenticated direct calls
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
