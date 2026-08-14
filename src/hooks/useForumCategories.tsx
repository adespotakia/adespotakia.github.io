import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  color: string;
}

export const useForumCategories = () => {
  return useQuery<ForumCategory[]>({
    queryKey: ["forum-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("id, slug, name, color")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching forum categories:", error);
        return [];
      }
      return data || [];
    },
  });
};
