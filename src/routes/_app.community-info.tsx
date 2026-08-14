import { createFileRoute } from "@tanstack/react-router";
import CommunityInfo from "@/screens/CommunityInfo";

export const Route = createFileRoute("/_app/community-info")({
  component: CommunityInfo,
});
