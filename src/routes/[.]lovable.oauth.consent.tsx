import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck } from "lucide-react";

// Typed wrapper for the beta supabase.auth.oauth namespace
type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};
function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card-elevated p-6 max-w-md text-sm">
        Could not load this authorization request: {String((error as Error)?.message ?? error)}
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState<false | "approve" | "deny">(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an external app";

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card-elevated p-8 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <span className="chip-violet flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Authorize
          </span>
        </div>
        <h1 className="text-2xl font-display font-semibold tracking-tight">
          Connect <span className="gold-text">{clientName}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {clientName} is requesting access to act on your ESB Brand account through the AI agent integration.
          It will use tools as you, respecting your permissions.
        </p>
        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => decide(true)}
            disabled={!!busy}
            className="flex-1 h-11 rounded-xl bg-gold text-gold-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy === "approve" && <Loader2 className="h-4 w-4 animate-spin" />} Approve
          </button>
          <button
            onClick={() => decide(false)}
            disabled={!!busy}
            className="flex-1 h-11 rounded-xl border border-border font-medium flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy === "deny" && <Loader2 className="h-4 w-4 animate-spin" />} Deny
          </button>
        </div>
      </div>
    </main>
  );
}
