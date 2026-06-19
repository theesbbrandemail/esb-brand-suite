import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Sparkles, Smartphone, Bell, Package, Calendar, Image as ImageIcon, ScanFace, ClipboardList, LogOut, Lock } from "lucide-react";
import { EsbLogo } from "./Logo";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

type Tab = { to: string; label: string; icon: typeof LayoutGrid; staff?: boolean };

const tabs: readonly Tab[] = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/suite", label: "AI Suite", icon: Sparkles, staff: true },
  { to: "/mobile", label: "Mobile", icon: Smartphone },
  { to: "/inventory", label: "Inventory", icon: Package, staff: true },
  { to: "/appointments", label: "Appts", icon: Calendar },
  { to: "/content", label: "Content", icon: ImageIcon, staff: true },
  { to: "/skin-analysis", label: "Skin AI", icon: ScanFace },
  { to: "/manager", label: "Manager", icon: ClipboardList, staff: true },
];

export function Shell({ children, requireStaff = false }: { children: ReactNode; requireStaff?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, session, role, isStaff, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  if (requireStaff && !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card-elevated p-8 max-w-md text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-violet/15 flex items-center justify-center mb-4">
            <Lock className="h-5 w-5 text-violet" />
          </div>
          <h2 className="font-display text-xl mb-1">Staff access only</h2>
          <p className="text-sm text-muted-foreground mb-5">
            This area is reserved for ESB Brand management and staff. Your account is signed in as <span className="text-foreground">general public</span>.
          </p>
          <Link to="/" className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gold text-gold-foreground text-sm font-medium">
            Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const visibleTabs = tabs.filter((t) => !t.staff || isStaff);
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Account";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName?.[0] ?? "U").toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/40 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <EsbLogo />
          <nav className="hidden xl:flex items-center gap-0.5 p-1 rounded-full bg-card/60 border border-border">
            {visibleTabs.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    active
                      ? "bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-primary-foreground font-medium shadow-[0_4px_20px_-4px_oklch(0.82_0.13_82/0.4)]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 relative">
            <span className={`hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full border ${isStaff ? "border-gold/40 text-gold bg-gold/10" : "border-violet/40 text-violet bg-violet/10"}`}>
              {role === "admin" ? "Admin" : isStaff ? "Staff" : "Public"}
            </span>
            <button className="relative h-9 w-9 rounded-full bg-card/60 border border-border flex items-center justify-center hover:bg-card transition">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-violet to-gold border border-border overflow-hidden flex items-center justify-center text-xs font-semibold text-white"
              aria-label="Account menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-60 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl p-3 z-50">
                <div className="px-2 py-1.5 border-b border-border mb-2">
                  <div className="text-sm font-medium truncate">{displayName}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
        {/* compact tabs (mobile + tablet) */}
        <nav className="xl:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {visibleTabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  active
                    ? "bg-gold text-gold-foreground border-transparent font-medium"
                    : "border-border text-muted-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
