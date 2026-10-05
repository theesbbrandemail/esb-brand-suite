import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Some OAuth providers / Lovable auth flows redirect to /auth/callback
 * instead of /auth. Forward everything to /auth so OAuth can complete.
 */
export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const search = location.searchStr || "";
    // Prefer client hash when available (implicit flow tokens live in hash)
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash
        : location.hash || "";
    const target = `/auth${search}${hash}`;
    throw redirect({ href: target });
  },
  component: () => null,
});
