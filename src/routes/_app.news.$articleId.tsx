import { createFileRoute } from "@tanstack/react-router";
import NewsArticle from "@/screens/NewsArticle";

export const Route = createFileRoute("/_app/news/$articleId")({
  component: NewsArticle,
});
