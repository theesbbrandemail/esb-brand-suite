import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/nurse")({
  beforeLoad: () => {
    throw redirect({ to: "/clinical" });
  },
});
