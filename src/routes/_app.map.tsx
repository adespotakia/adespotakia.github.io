import { createFileRoute } from "@tanstack/react-router";
import AdespolisMap from "@/screens/AdespolisMap";

export const Route = createFileRoute("/_app/map")({
  ssr: false,
  component: AdespolisMap,
});
