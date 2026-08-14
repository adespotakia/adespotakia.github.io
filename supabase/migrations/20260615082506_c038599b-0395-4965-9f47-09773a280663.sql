-- Role helper functions
CREATE OR REPLACE FUNCTION public.is_supervisor(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role = 'supervisor'); $$;

CREATE OR REPLACE FUNCTION public.is_moderator(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role IN ('admin','supervisor')); $$;

-- Ban fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS banned_by uuid;

CREATE OR REPLACE FUNCTION public.is_banned(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT is_banned FROM public.profiles WHERE id = check_user_id), false); $$;

-- Moderators can update any profile (for banning)
CREATE POLICY "Moderators can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_moderator(auth.uid()))
WITH CHECK (public.is_moderator(auth.uid()));

-- Threads: moderators edit/delete any; banned users cannot create
DROP POLICY IF EXISTS "Users create own threads" ON public.forum_threads;
CREATE POLICY "Users create own threads" ON public.forum_threads
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

DROP POLICY IF EXISTS "Users update own threads" ON public.forum_threads;
CREATE POLICY "Users update own threads" ON public.forum_threads
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "Users delete own threads" ON public.forum_threads;
CREATE POLICY "Users delete own threads" ON public.forum_threads
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

-- Comments: moderators edit/delete any; banned users cannot create
DROP POLICY IF EXISTS "Users create own comments" ON public.forum_comments;
CREATE POLICY "Users create own comments" ON public.forum_comments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND NOT public.is_banned(auth.uid()));

DROP POLICY IF EXISTS "Users update own comments" ON public.forum_comments;
CREATE POLICY "Users update own comments" ON public.forum_comments
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

DROP POLICY IF EXISTS "Users delete own comments" ON public.forum_comments;
CREATE POLICY "Users delete own comments" ON public.forum_comments
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.is_moderator(auth.uid()));

-- Categories table (admin managed)
CREATE TABLE public.forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'bg-gray-100 text-gray-800',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.forum_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.forum_categories TO authenticated;
GRANT ALL ON public.forum_categories TO service_role;

ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON public.forum_categories
FOR SELECT USING (true);

CREATE POLICY "Admins manage categories" ON public.forum_categories
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER trg_forum_categories_updated
BEFORE UPDATE ON public.forum_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.forum_categories (slug, name, color) VALUES
  ('general', 'Γενικά', 'bg-blue-100 text-blue-800'),
  ('help', 'Βοήθεια', 'bg-red-100 text-red-800'),
  ('suggestions', 'Προτάσεις', 'bg-green-100 text-green-800')
ON CONFLICT (slug) DO NOTHING;