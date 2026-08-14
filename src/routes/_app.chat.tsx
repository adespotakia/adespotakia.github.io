import { createFileRoute } from "@tanstack/react-router";
import Chat from "@/screens/Chat";

export const Route = createFileRoute("/_app/chat")({
  component: Chat,
});
