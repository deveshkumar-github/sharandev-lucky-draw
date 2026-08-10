ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS saved_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS followup_done boolean NOT NULL DEFAULT false;

INSERT INTO public.app_settings (key, value)
VALUES ('bill_target', '120')
ON CONFLICT (key) DO NOTHING;