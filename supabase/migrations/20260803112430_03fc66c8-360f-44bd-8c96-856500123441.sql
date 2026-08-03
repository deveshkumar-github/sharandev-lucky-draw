ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS flat_no text;

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (key, value) VALUES
('wa_register_template', E'Hello Sharandev Fashions! 👋\nI have registered for the Cloud9 Saree Exhibition Lucky Draw.\n\nName: {name}\nPhone: {phone}\nWhatsApp: {whatsapp}\nCloud9 Resident: {cloud9}\nFlat No: {flat}\n\nThank you! 🎁'),
('wa_customer_template', E'Hi {name}! 🎁\n\nThank you for registering for the Sharandev Fashions Cloud9 Saree Exhibition Lucky Draw.\n\nYour Entry Number: {entry}\n\nWinners will be announced soon — stay tuned!'),
('wa_winner_template', E'Congratulations {name}! 🏆\n\nYou have WON in the Sharandev Fashions Cloud9 Saree Exhibition Lucky Draw!\n\nEntry Number: {entry}\nPrize: {prize}\n\nPlease visit our stall to collect your prize. 🎉')
ON CONFLICT (key) DO NOTHING;

DROP FUNCTION IF EXISTS public.register_entry(text, text, text, boolean);
CREATE OR REPLACE FUNCTION public.register_entry(_full_name text, _phone text, _whatsapp text, _is_cloud9 boolean, _flat_no text DEFAULT NULL)
RETURNS TABLE(id uuid, entry_number text, full_name text, phone text, whatsapp text, is_cloud9 boolean, flat_no text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.registrations%ROWTYPE;
BEGIN
  IF length(trim(_full_name)) < 2 OR length(trim(_phone)) < 7 OR length(trim(_whatsapp)) < 7 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9, flat_no)
  VALUES (trim(_full_name), trim(_phone), trim(_whatsapp), coalesce(_is_cloud9,false), nullif(trim(coalesce(_flat_no,'')),''))
  RETURNING * INTO r;
  RETURN QUERY SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9, r.flat_no;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_entry(text, text, text, boolean, text) TO anon, authenticated;
