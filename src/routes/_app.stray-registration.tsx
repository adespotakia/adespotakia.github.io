import { createFileRoute } from "@tanstack/react-router";
import StrayRegistration from "@/screens/StrayRegistration";

export const Route = createFileRoute("/_app/stray-registration")({
  component: StrayRegistration,
});
