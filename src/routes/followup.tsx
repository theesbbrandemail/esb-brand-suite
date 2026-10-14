import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/followup")({
  beforeLoad: () => {
    throw redirect({ to: "/followups" });
  },
});
