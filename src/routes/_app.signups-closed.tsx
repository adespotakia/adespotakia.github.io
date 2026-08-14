import { createFileRoute } from "@tanstack/react-router";
import SignupsClosed from "@/screens/SignupsClosed";

export const Route = createFileRoute("/_app/signups-closed")({
  component: SignupsClosed,
});
