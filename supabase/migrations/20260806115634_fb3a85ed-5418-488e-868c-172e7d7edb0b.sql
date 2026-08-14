ALTER TABLE public.strays ADD COLUMN IF NOT EXISTS birth_month integer;

ALTER TABLE public.lost_strays
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS details text,
  ADD COLUMN IF NOT EXISTS image_urls text[],
  ADD COLUMN IF NOT EXISTS voice_url text;

CREATE TABLE IF NOT EXISTS public.neighborhood_strays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registerer_name text,
  name text,
  animal_type text NOT NULL DEFAULT 'dog',
  description text,
  location_description text,
  latitude double precision,
  longitude double precision,
  image_urls text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.neighborhood_strays TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.neighborhood_strays TO authenticated;
GRANT ALL ON public.neighborhood_strays TO service_role;

ALTER TABLE public.neighborhood_strays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view neighborhood strays"
  ON public.neighborhood_strays FOR SELECT USING (true);

CREATE POLICY "Members can add neighborhood strays"
  ON public.neighborhood_strays FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

CREATE POLICY "Owners or moderators can update neighborhood strays"
  ON public.neighborhood_strays FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE POLICY "Owners or moderators can delete neighborhood strays"
  ON public.neighborhood_strays FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE TRIGGER trg_neighborhood_strays_updated
  BEFORE UPDATE ON public.neighborhood_strays
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();