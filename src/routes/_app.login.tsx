import { createFileRoute } from "@tanstack/react-router";
import Login from "@/screens/Login";

export const Route = createFileRoute("/_app/login")({
  component: Login,
});
