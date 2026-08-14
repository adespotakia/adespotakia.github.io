import { createFileRoute } from "@tanstack/react-router";
import StrayActivities from "@/screens/StrayActivities";

export const Route = createFileRoute("/_app/stray-activities")({
  component: StrayActivities,
});
