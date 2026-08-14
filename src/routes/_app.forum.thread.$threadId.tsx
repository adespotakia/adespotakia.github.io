import { createFileRoute } from "@tanstack/react-router";
import ForumThread from "@/screens/ForumThread";

export const Route = createFileRoute("/_app/forum/thread/$threadId")({
  component: ForumThread,
});
