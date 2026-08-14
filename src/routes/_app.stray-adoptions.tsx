import { createFileRoute } from "@tanstack/react-router";
import StrayAdoptions from "@/screens/StrayAdoptions";

export const Route = createFileRoute("/_app/stray-adoptions")({
  component: StrayAdoptions,
});
