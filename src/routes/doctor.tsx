import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/doctor")({
  beforeLoad: () => {
    throw redirect({ to: "/clinical" });
  },
});
