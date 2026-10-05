import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Some OAuth providers / Lovable auth flows redirect to /auth/callback
 * instead of /auth. This route forwards the full query + hash to /auth
 * so the existing OAuth completion logic can run without a 404.
 */
export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const search = location.searchStr || "";
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    throw redirect({
      to: "/auth",
      // Preserve search params (code, state, error, next, etc.)
      search: (prev: Record<string, unknown>) => {
        const params = new URLSearchParams(
          search.startsWith("?") ? search.slice(1) : search,
        );
        const out: Record<string, string> = {};
        params.forEach((v, k) => {
          out[k] = v;
        });
        return out as typeof prev;
      },
      hash: hash || undefined,
      replace: true,
    });
  },
  component: () => null,
});
