import { createFileRoute } from "@tanstack/react-router";
import Forum from "@/screens/Forum";

export const Route = createFileRoute("/_app/forum/")({
  component: Forum,
});
