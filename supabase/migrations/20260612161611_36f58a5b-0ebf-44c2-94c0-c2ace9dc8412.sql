-- Helper: updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- profiles
-- =========================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  bio text,
  avatar_url text,
  phone text,
  phone_verified boolean DEFAULT false,
  address_verified boolean DEFAULT false,
  address_verification_status text DEFAULT 'none',
  address_verification_document_url text,
  verification_submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- user_roles
-- =========================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated, anon;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roles are viewable by everyone" ON public.user_roles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = check_user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'moderator' THEN 2 WHEN 'user' THEN 3 ELSE 4 END
  LIMIT 1;
$$;
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = check_user_id AND role = 'admin');
$$;

-- Admins can manage roles
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- rank_levels
-- =========================================================
CREATE TABLE public.rank_levels (
  id serial PRIMARY KEY,
  name text NOT NULL,
  min_points integer NOT NULL,
  badge_color text NOT NULL,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.rank_levels TO authenticated, anon;
GRANT ALL ON public.rank_levels TO service_role;
ALTER TABLE public.rank_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rank levels viewable by everyone" ON public.rank_levels FOR SELECT USING (true);
INSERT INTO public.rank_levels (name, min_points, badge_color) VALUES
  ('Newcomer', 0, '#9ca3af'),
  ('Helper', 50, '#22c55e'),
  ('Advocate', 150, '#3b82f6'),
  ('Guardian', 400, '#a855f7'),
  ('Champion', 1000, '#f59e0b');

-- =========================================================
-- user_ranks
-- =========================================================
CREATE TABLE public.user_ranks (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  reports_count integer NOT NULL DEFAULT 0,
  current_rank_id integer REFERENCES public.rank_levels(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_ranks TO authenticated;
GRANT SELECT ON public.user_ranks TO anon;
GRANT ALL ON public.user_ranks TO service_role;
ALTER TABLE public.user_ranks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User ranks viewable by everyone" ON public.user_ranks FOR SELECT USING (true);
CREATE POLICY "Users insert own rank" ON public.user_ranks FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own rank" ON public.user_ranks FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =========================================================
-- point_activities
-- =========================================================
CREATE TABLE public.point_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  points integer NOT NULL,
  reference_id text,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.point_activities TO authenticated;
GRANT SELECT ON public.point_activities TO anon;
GRANT ALL ON public.point_activities TO service_role;
ALTER TABLE public.point_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Point activities viewable by everyone" ON public.point_activities FOR SELECT USING (true);
CREATE POLICY "Users insert own point activities" ON public.point_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- add_user_points RPC
CREATE OR REPLACE FUNCTION public.add_user_points(
  user_id uuid, activity_type text, points_to_add integer, reference_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_total integer; new_rank integer;
BEGIN
  INSERT INTO public.point_activities (user_id, activity_type, points, reference_id)
  VALUES (add_user_points.user_id, add_user_points.activity_type, add_user_points.points_to_add, add_user_points.reference_id);

  INSERT INTO public.user_ranks (id, points, reports_count)
  VALUES (add_user_points.user_id, add_user_points.points_to_add,
          CASE WHEN add_user_points.activity_type = 'report' THEN 1 ELSE 0 END)
  ON CONFLICT (id) DO UPDATE
    SET points = public.user_ranks.points + add_user_points.points_to_add,
        reports_count = public.user_ranks.reports_count + CASE WHEN add_user_points.activity_type = 'report' THEN 1 ELSE 0 END,
        updated_at = now()
  RETURNING points INTO new_total;

  SELECT id INTO new_rank FROM public.rank_levels WHERE min_points <= new_total ORDER BY min_points DESC LIMIT 1;
  UPDATE public.user_ranks SET current_rank_id = new_rank WHERE id = add_user_points.user_id;
END; $$;

-- =========================================================
-- forum_threads
-- =========================================================
CREATE TABLE public.forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_threads TO authenticated;
GRANT SELECT ON public.forum_threads TO anon;
GRANT ALL ON public.forum_threads TO service_role;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Threads viewable by everyone" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "Users create own threads" ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own threads" ON public.forum_threads FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own threads" ON public.forum_threads FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- forum_comments
-- =========================================================
CREATE TABLE public.forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_comments TO authenticated;
GRANT SELECT ON public.forum_comments TO anon;
GRANT ALL ON public.forum_comments TO service_role;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Users create own comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON public.forum_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own comments" ON public.forum_comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.forum_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- reports
-- =========================================================
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_type text NOT NULL,
  condition text NOT NULL,
  description text NOT NULL,
  location_description text,
  location_lat double precision,
  location_lng double precision,
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT ON public.reports TO anon;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Users create own reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reports" ON public.reports FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own reports" ON public.reports FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- strays
-- =========================================================
CREATE TABLE public.strays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registered_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registerer_username text,
  name text NOT NULL,
  animal_type text NOT NULL DEFAULT 'dog',
  gender text,
  age integer,
  birth_year integer,
  fur_colors text,
  coat_colors_tags text[],
  characteristics text[],
  relative_animals_tags text[],
  possible_relatives text,
  story text,
  location_description text,
  is_neutered boolean DEFAULT false,
  neutering_date date,
  neutering_vet text,
  expenses_paid_by text,
  available_for_adoption boolean DEFAULT false,
  image_url text,
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strays TO authenticated;
GRANT SELECT ON public.strays TO anon;
GRANT ALL ON public.strays TO service_role;
ALTER TABLE public.strays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Strays viewable by everyone" ON public.strays FOR SELECT USING (true);
CREATE POLICY "Users register strays" ON public.strays FOR INSERT TO authenticated WITH CHECK (auth.uid() = registered_by);
CREATE POLICY "Users update own strays" ON public.strays FOR UPDATE TO authenticated USING (auth.uid() = registered_by OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own strays" ON public.strays FOR DELETE TO authenticated USING (auth.uid() = registered_by OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_strays_updated BEFORE UPDATE ON public.strays FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- stray_actions
-- =========================================================
CREATE TABLE public.stray_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stray_id uuid NOT NULL REFERENCES public.strays(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_description text NOT NULL,
  action_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stray_actions TO authenticated;
GRANT SELECT ON public.stray_actions TO anon;
GRANT ALL ON public.stray_actions TO service_role;
ALTER TABLE public.stray_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stray actions viewable by everyone" ON public.stray_actions FOR SELECT USING (true);
CREATE POLICY "Users create own stray actions" ON public.stray_actions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stray actions" ON public.stray_actions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own stray actions" ON public.stray_actions FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- =========================================================
-- stray_activities
-- =========================================================
CREATE TABLE public.stray_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stray_id uuid NOT NULL REFERENCES public.strays(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  activity_description text NOT NULL,
  activity_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  cost numeric,
  quantity numeric,
  unit text,
  location_lat double precision,
  location_lng double precision,
  image_urls text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stray_activities TO authenticated;
GRANT SELECT ON public.stray_activities TO anon;
GRANT ALL ON public.stray_activities TO service_role;
ALTER TABLE public.stray_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Stray activities viewable by everyone" ON public.stray_activities FOR SELECT USING (true);
CREATE POLICY "Users create own stray activities" ON public.stray_activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own stray activities" ON public.stray_activities FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users delete own stray activities" ON public.stray_activities FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_stray_activities_updated BEFORE UPDATE ON public.stray_activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- stray_products
-- =========================================================
CREATE TABLE public.stray_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  image_urls text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stray_products TO authenticated;
GRANT SELECT ON public.stray_products TO anon;
GRANT ALL ON public.stray_products TO service_role;
ALTER TABLE public.stray_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.stray_products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.stray_products FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.stray_products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- team_badges
-- =========================================================
CREATE TABLE public.team_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name text NOT NULL,
  badge_color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_badges TO authenticated;
GRANT SELECT ON public.team_badges TO anon;
GRANT ALL ON public.team_badges TO service_role;
ALTER TABLE public.team_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges viewable by everyone" ON public.team_badges FOR SELECT USING (true);
CREATE POLICY "Admins manage badges" ON public.team_badges FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =========================================================
-- friendships
-- =========================================================
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users create friend requests" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users update own friendships" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users delete own friendships" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE TRIGGER trg_friendships_updated BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- New user trigger: create profile, rank row, default role
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_ranks (id, points, reports_count) VALUES (NEW.id, 0, 0);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();