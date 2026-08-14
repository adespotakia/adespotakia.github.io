import { createFileRoute } from "@tanstack/react-router";
import Feedback from "@/screens/Feedback";

export const Route = createFileRoute("/_app/feedback")({
  component: Feedback,
  head: () => ({
    meta: [
      { title: "Προτάσεις & Σφάλματα | Αδέσπολις" },
      {
        name: "description",
        content: "Στείλτε ιδέες βελτιστοποίησης ή αναφέρετε σφάλματα της πλατφόρμας Αδέσπολις.",
      },
      { property: "og:title", content: "Προτάσεις & Σφάλματα | Αδέσπολις" },
      {
        property: "og:description",
        content: "Στείλτε ιδέες βελτιστοποίησης ή αναφέρετε σφάλματα της πλατφόρμας Αδέσπολις.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
