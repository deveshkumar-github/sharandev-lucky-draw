
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Registrations
CREATE SEQUENCE public.entry_seq START 1001;

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text NOT NULL UNIQUE DEFAULT ('LD-' || lpad(nextval('public.entry_seq')::text, 5, '0')),
  full_name text NOT NULL,
  phone text NOT NULL,
  whatsapp text NOT NULL,
  is_cloud9 boolean NOT NULL DEFAULT false,
  whatsapp_done boolean NOT NULL DEFAULT false,
  instagram1_done boolean NOT NULL DEFAULT false,
  instagram2_done boolean NOT NULL DEFAULT false,
  youtube_done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT USAGE, SELECT ON SEQUENCE public.entry_seq TO anon, authenticated;
GRANT INSERT, SELECT, UPDATE ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a registration
CREATE POLICY "Anyone can register"
ON public.registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can update their just-created row (to mark actions completed) - identified by id
CREATE POLICY "Anyone can update by id"
ON public.registrations FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view all registrations"
ON public.registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete registrations"
ON public.registrations FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
