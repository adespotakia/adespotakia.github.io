import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "@/components/news/NewsCard";

export interface NewsArticleRow {
  id: string;
  title: string;
  content: string;
  image: string | null;
  source: string | null;
  published_date: string;
}

export const mapToNewsItem = (row: NewsArticleRow): NewsItem => ({
  id: row.id,
  title: row.title,
  content: row.content,
  image: row.image || "",
  date: row.published_date,
  source: row.source || undefined,
});

export const useNews = () => {
  return useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      return (data as NewsArticleRow[]).map(mapToNewsItem);
    },
  });
};
