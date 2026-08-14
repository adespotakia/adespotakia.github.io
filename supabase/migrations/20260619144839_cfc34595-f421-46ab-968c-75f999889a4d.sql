CREATE TABLE public.lost_strays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registerer_name text NOT NULL,
  name text NOT NULL,
  animal_type text NOT NULL,
  image_url text,
  locations text,
  is_urgent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lost_strays TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lost_strays TO authenticated;
GRANT ALL ON public.lost_strays TO service_role;

ALTER TABLE public.lost_strays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lost strays"
  ON public.lost_strays FOR SELECT
  USING (true);

CREATE POLICY "Members can create lost strays"
  ON public.lost_strays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

CREATE POLICY "Owners or moderators can update lost strays"
  ON public.lost_strays FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE POLICY "Owners or moderators can delete lost strays"
  ON public.lost_strays FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

CREATE TRIGGER set_lost_strays_updated_at
  BEFORE UPDATE ON public.lost_strays
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();