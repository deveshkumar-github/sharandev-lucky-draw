ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS bill_no text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.register_entry(_full_name text, _phone text, _whatsapp text, _is_cloud9 boolean, _total_bill numeric DEFAULT 0, _total_paid numeric DEFAULT 0, _fully_paid boolean DEFAULT false, _bill_no text DEFAULT '')
 RETURNS TABLE(id uuid, entry_number text, full_name text, phone text, whatsapp text, is_cloud9 boolean, total_bill numeric, total_paid numeric, fully_paid boolean, bill_no text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.registrations%ROWTYPE;
DECLARE bill numeric := GREATEST(COALESCE(_total_bill,0),0);
DECLARE paid numeric := GREATEST(COALESCE(_total_paid,0),0);
BEGIN
  IF length(trim(_full_name)) < 2 OR length(trim(_phone)) < 7 OR length(trim(_whatsapp)) < 7 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF COALESCE(_fully_paid,false) THEN paid := bill; END IF;
  IF paid > bill THEN paid := bill; END IF;
  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9, total_bill, total_paid, fully_paid, bill_no)
  VALUES (trim(_full_name), trim(_phone), trim(_whatsapp), coalesce(_is_cloud9,false), bill, paid, (bill > 0 AND paid >= bill), left(trim(coalesce(_bill_no,'')), 40))
  RETURNING * INTO r;
  RETURN QUERY SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9, r.total_bill, r.total_paid, r.fully_paid, r.bill_no;
END;
$function$;