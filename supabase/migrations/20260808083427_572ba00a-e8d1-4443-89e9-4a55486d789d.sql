CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  contact_app text NOT NULL DEFAULT 'none',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.access_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an access request"
  ON public.access_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view access requests"
  ON public.access_requests FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete access requests"
  ON public.access_requests FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_access_requests_updated
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.adoption_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stray_id uuid REFERENCES public.strays(id) ON DELETE SET NULL,
  stray_name text,
  owner_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.adoption_interests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.adoption_interests TO authenticated;
GRANT ALL ON public.adoption_interests TO service_role;

ALTER TABLE public.adoption_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can express adoption interest"
  ON public.adoption_interests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins and owners can view adoption interests"
  ON public.adoption_interests FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR owner_id = auth.uid());

CREATE POLICY "Admins can update adoption interests"
  ON public.adoption_interests FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete adoption interests"
  ON public.adoption_interests FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_adoption_interests_updated
  BEFORE UPDATE ON public.adoption_interests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();