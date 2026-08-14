ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS temp_password text;

CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  email text,
  kind text NOT NULL DEFAULT 'idea',
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_submissions TO authenticated;
GRANT ALL ON public.feedback_submissions TO service_role;

ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback" ON public.feedback_submissions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own feedback" ON public.feedback_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins update feedback" ON public.feedback_submissions
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Owners or admins delete feedback" ON public.feedback_submissions
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE TRIGGER feedback_submissions_updated_at BEFORE UPDATE ON public.feedback_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();