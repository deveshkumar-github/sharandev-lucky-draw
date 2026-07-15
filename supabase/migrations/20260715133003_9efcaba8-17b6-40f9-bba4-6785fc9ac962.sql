-- Change entry number format from LD-00001 to SD1001 (starts at 1001)
ALTER SEQUENCE entry_seq RESTART WITH 1001;
ALTER TABLE public.registrations
  ALTER COLUMN entry_number SET DEFAULT ('SD' || nextval('entry_seq'::regclass)::text);

-- Update existing rows to new format (best-effort renumber preserving order)
DO $$
DECLARE
  r record;
  n int := 1001;
BEGIN
  FOR r IN SELECT id FROM public.registrations ORDER BY created_at ASC LOOP
    UPDATE public.registrations SET entry_number = 'SD' || n::text WHERE id = r.id;
    n := n + 1;
  END LOOP;
  PERFORM setval('entry_seq', GREATEST(n, 1001), false);
END $$;

-- Admin server-fn helper: add registration bypassing anon rules
CREATE OR REPLACE FUNCTION public.admin_add_registration(
  _full_name text, _phone text, _whatsapp text, _is_cloud9 boolean
) RETURNS TABLE(id uuid, entry_number text, full_name text, phone text, whatsapp text, is_cloud9 boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9)
  VALUES (btrim(_full_name), btrim(_phone), btrim(_whatsapp), COALESCE(_is_cloud9, false))
  RETURNING registrations.id INTO new_id;
  RETURN QUERY SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9, r.created_at
    FROM public.registrations r WHERE r.id = new_id;
END $$;

REVOKE ALL ON FUNCTION public.admin_add_registration(text,text,text,boolean) FROM PUBLIC, anon, authenticated;