import { createFileRoute } from "@tanstack/react-router";
import StraysMap from "@/screens/StraysMap";

export const Route = createFileRoute("/_app/strays-map")({
  ssr: false,
  component: StraysMap,
});
