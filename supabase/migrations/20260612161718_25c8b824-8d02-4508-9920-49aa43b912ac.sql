CREATE OR REPLACE FUNCTION public.add_user_points(
  user_id uuid, activity_type text, points_to_add integer, reference_id text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_total integer; new_rank integer; target uuid;
BEGIN
  -- Only allow acting on the caller's own account (service_role has no auth.uid()).
  target := COALESCE(auth.uid(), add_user_points.user_id);
  IF auth.uid() IS NOT NULL AND auth.uid() <> add_user_points.user_id THEN
    RAISE EXCEPTION 'Cannot add points for another user';
  END IF;

  INSERT INTO public.point_activities (user_id, activity_type, points, reference_id)
  VALUES (target, add_user_points.activity_type, add_user_points.points_to_add, add_user_points.reference_id);

  INSERT INTO public.user_ranks (id, points, reports_count)
  VALUES (target, add_user_points.points_to_add,
          CASE WHEN add_user_points.activity_type = 'report' THEN 1 ELSE 0 END)
  ON CONFLICT (id) DO UPDATE
    SET points = public.user_ranks.points + add_user_points.points_to_add,
        reports_count = public.user_ranks.reports_count + CASE WHEN add_user_points.activity_type = 'report' THEN 1 ELSE 0 END,
        updated_at = now()
  RETURNING points INTO new_total;

  SELECT id INTO new_rank FROM public.rank_levels WHERE min_points <= new_total ORDER BY min_points DESC LIMIT 1;
  UPDATE public.user_ranks SET current_rank_id = new_rank WHERE id = target;
END; $$;
REVOKE EXECUTE ON FUNCTION public.add_user_points(uuid, text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_user_points(uuid, text, integer, text) TO authenticated;