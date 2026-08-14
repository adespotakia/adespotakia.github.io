import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/screens/Profile";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});
