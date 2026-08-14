import { createFileRoute } from "@tanstack/react-router";
import Index from "@/screens/Index";

export const Route = createFileRoute("/_app/")({
  component: Index,
});
