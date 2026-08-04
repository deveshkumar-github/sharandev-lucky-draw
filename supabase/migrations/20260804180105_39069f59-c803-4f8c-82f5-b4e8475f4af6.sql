ALTER TABLE public.registrations DROP COLUMN IF EXISTS flat_no;
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS total_bill numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_paid numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fully_paid boolean NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS public.register_entry(text, text, text, boolean, text);
DROP FUNCTION IF EXISTS public.register_entry(text, text, text, boolean);
CREATE OR REPLACE FUNCTION public.register_entry(
  _full_name text,
  _phone text,
  _whatsapp text,
  _is_cloud9 boolean,
  _total_bill numeric DEFAULT 0,
  _total_paid numeric DEFAULT 0,
  _fully_paid boolean DEFAULT false
)
RETURNS TABLE(id uuid, entry_number text, full_name text, phone text, whatsapp text, is_cloud9 boolean, total_bill numeric, total_paid numeric, fully_paid boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.registrations%ROWTYPE;
DECLARE bill numeric := GREATEST(COALESCE(_total_bill,0),0);
DECLARE paid numeric := GREATEST(COALESCE(_total_paid,0),0);
BEGIN
  IF length(trim(_full_name)) < 2 OR length(trim(_phone)) < 7 OR length(trim(_whatsapp)) < 7 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF COALESCE(_fully_paid,false) THEN paid := bill; END IF;
  IF paid > bill THEN paid := bill; END IF;
  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9, total_bill, total_paid, fully_paid)
  VALUES (trim(_full_name), trim(_phone), trim(_whatsapp), coalesce(_is_cloud9,false), bill, paid, (bill > 0 AND paid >= bill))
  RETURNING * INTO r;
  RETURN QUERY SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9, r.total_bill, r.total_paid, r.fully_paid;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_add_registration(text, text, text, boolean);

INSERT INTO public.app_settings (key, value)
VALUES ('coupon_title', 'Sharandev Fashions SAREE EXHIBITION')
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.app_settings (key, value)
VALUES ('coupon_subtitle', 'Lucky Draw Entry')
ON CONFLICT (key) DO NOTHING;