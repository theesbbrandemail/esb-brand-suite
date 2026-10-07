import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/suite")({
  beforeLoad: () => {
    throw redirect({ to: "/ceo", replace: true });
  },
});
