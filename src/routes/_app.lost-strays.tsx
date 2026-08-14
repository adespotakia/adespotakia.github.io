import { createFileRoute } from "@tanstack/react-router";
import LostStrays from "@/screens/LostStrays";

export const Route = createFileRoute("/_app/lost-strays")({
  component: LostStrays,
});
