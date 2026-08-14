import { createFileRoute, redirect } from "@tanstack/react-router";
import Register from "@/screens/Register";

export const Route = createFileRoute("/_app/register")({
  beforeLoad: () => {
    throw redirect({ to: "/signups-closed" });
  },
  component: Register,
});
