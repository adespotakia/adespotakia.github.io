import { createFileRoute } from "@tanstack/react-router";
import Report from "@/screens/Report";

export const Route = createFileRoute("/_app/report")({
  component: Report,
});
