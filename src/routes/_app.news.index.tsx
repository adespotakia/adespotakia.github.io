import { createFileRoute } from "@tanstack/react-router";
import AllNews from "@/screens/AllNews";

export const Route = createFileRoute("/_app/news/")({
  component: AllNews,
});
