import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/sales-dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/sales" });
  },
});
