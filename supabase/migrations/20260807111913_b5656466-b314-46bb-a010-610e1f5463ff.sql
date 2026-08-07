CREATE UNIQUE INDEX IF NOT EXISTS registrations_bill_no_unique
  ON public.registrations (lower(btrim(bill_no)))
  WHERE btrim(bill_no) <> '';

CREATE OR REPLACE FUNCTION public.register_entry(_full_name text, _phone text, _whatsapp text, _is_cloud9 boolean, _total_bill numeric DEFAULT 0, _total_paid numeric DEFAULT 0, _fully_paid boolean DEFAULT false, _bill_no text DEFAULT ''::text)
 RETURNS TABLE(id uuid, entry_number text, full_name text, phone text, whatsapp text, is_cloud9 boolean, total_bill numeric, total_paid numeric, fully_paid boolean, bill_no text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.registrations%ROWTYPE;
DECLARE bill numeric := GREATEST(COALESCE(_total_bill,0),0);
DECLARE paid numeric := GREATEST(COALESCE(_total_paid,0),0);
DECLARE bno text := left(btrim(coalesce(_bill_no,'')), 40);
BEGIN
  IF length(trim(_full_name)) < 2 OR length(trim(_phone)) < 7 OR length(trim(_whatsapp)) < 7 THEN
    RAISE EXCEPTION 'Invalid input';
  END IF;
  IF COALESCE(_fully_paid,false) THEN paid := bill; END IF;
  IF paid > bill THEN paid := bill; END IF;
  IF bno <> '' AND EXISTS (SELECT 1 FROM public.registrations x WHERE lower(btrim(x.bill_no)) = lower(bno)) THEN
    RAISE EXCEPTION 'Bill No % is already registered', bno;
  END IF;
  INSERT INTO public.registrations (full_name, phone, whatsapp, is_cloud9, total_bill, total_paid, fully_paid, bill_no)
  VALUES (trim(_full_name), trim(_phone), trim(_whatsapp), coalesce(_is_cloud9,false), bill, paid, (bill > 0 AND paid >= bill), bno)
  RETURNING * INTO r;
  RETURN QUERY SELECT r.id, r.entry_number, r.full_name, r.phone, r.whatsapp, r.is_cloud9, r.total_bill, r.total_paid, r.fully_paid, r.bill_no;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Bill No % is already registered', bno;
END;
$function$;