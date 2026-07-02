import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Sparkles, Smartphone, Bell, Package, Calendar, Image as ImageIcon, ScanFace, ClipboardList, LogOut, Lock, ChevronDown, FlaskConical, ShoppingBag, Stethoscope, Smile, HeartPulse, Cpu, Truck, Crown, Briefcase, Megaphone, Syringe, Calculator, ClipboardCheck, Bot, Clapperboard, MessageCircle } from "lucide-react";
import { EsbLogo } from "./Logo";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

type MenuItem = { to: string; label: string; icon: typeof LayoutGrid; staff?: boolean; sub?: string };

const brands: readonly MenuItem[] = [
  { to: "/brands/skincare-kitchen", label: "Skincare Kitchen", icon: FlaskConical, sub: "Production · R&D · Sales" },
  { to: "/brands/derma", label: "Derma Aesthetics", icon: ShoppingBag, sub: "Retail & preorder" },
  { to: "/brands/skinclinic", label: "Skin Clinic", icon: Stethoscope, sub: "Aesthetics procedures" },
  { to: "/brands/dental", label: "Dental Clinic", icon: Smile, sub: "Oral & dental care" },
  { to: "/brands/rejuvenating", label: "Rejuvenating", icon: HeartPulse, sub: "Wellness & anti-aging" },
  { to: "/brands/global-tech", label: "Global Skin Tech", icon: Cpu, sub: "AI platform tier" },
  { to: "/brands/logistics", label: "Logistics", icon: Truck, sub: "Cross-branch sync" },
];

const aiRoles: readonly MenuItem[] = [
  { to: "/ai/ceo", label: "CEO AI Suite", icon: Crown, sub: "Biometric-gated", staff: true },
  { to: "/ai/manager", label: "Manager AI", icon: Briefcase, staff: true },
  { to: "/ai/social", label: "Social / Content AI", icon: Megaphone, staff: true },
  { to: "/ai/nurses", label: "Aesthetic Nurses AI", icon: Syringe, staff: true },
  { to: "/ai/accountant", label: "Accountant AI", icon: Calculator, staff: true },
  { to: "/ai/logistics", label: "Logistics AI", icon: Truck, staff: true },
  { to: "/ai/records", label: "Records AI", icon: ClipboardCheck, sub: "Sign-in & tasks", staff: true },
  { to: "/ai/customer", label: "Client AI Suite", icon: Smartphone, sub: "WhatsApp ready" },
];

export function Shell({ children, requireStaff = false }: { children: ReactNode; requireStaff?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, session, role, isStaff, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<null | "brands" | "ai">(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

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
  const visibleBrands = brands.filter((b) => !b.staff || isStaff);
  const visibleAi = aiRoles.filter((a) => !a.staff || isStaff);
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "Account";
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = (displayName?.[0] ?? "U").toUpperCase();
  const brandsActive = pathname.startsWith("/brands/");
  const aiActive = pathname.startsWith("/ai/");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/40 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <EsbLogo />
          <nav className="hidden xl:flex items-center gap-0.5 p-1 rounded-full bg-card/60 border border-border" ref={dropdownRef}>
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
            <DropdownTrigger
              label="Brands"
              active={brandsActive}
              open={openDropdown === "brands"}
              onClick={() => setOpenDropdown(openDropdown === "brands" ? null : "brands")}
            />
            <DropdownTrigger
              label="AI Roles"
              icon={Bot}
              active={aiActive}
              open={openDropdown === "ai"}
              onClick={() => setOpenDropdown(openDropdown === "ai" ? null : "ai")}
            />
            {openDropdown && (
              <div className="absolute left-1/2 -translate-x-1/2 top-14 w-[520px] rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-2 z-50 grid grid-cols-2 gap-1">
                {(openDropdown === "brands" ? visibleBrands : visibleAi).map((m) => {
                  const Icon = m.icon;
                  const active = pathname === m.to;
                  return (
                    <Link
                      key={m.to}
                      to={m.to}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg transition ${
                        active ? "bg-gold/10 border border-gold/30" : "hover:bg-secondary/60 border border-transparent"
                      }`}
                    >
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary/60 border border-border flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{m.label}</div>
                        {m.sub && <div className="text-[10px] text-muted-foreground truncate">{m.sub}</div>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
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
          <MobileGroup label="Brands" items={visibleBrands} pathname={pathname} />
          <MobileGroup label="AI" items={visibleAi} pathname={pathname} />
        </nav>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

function DropdownTrigger({
  label,
  icon: Icon,
  active,
  open,
  onClick,
}: {
  label: string;
  icon?: typeof LayoutGrid;
  active: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
        active || open
          ? "bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.72_0.14_70)] text-primary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
      <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function MobileGroup({ label, items, pathname }: { label: string; items: readonly MenuItem[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const groupActive = items.some((i) => pathname === i.to);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
          groupActive || open ? "bg-gold text-gold-foreground border-transparent font-medium" : "border-border text-muted-foreground"
        }`}
      >
        {label} <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-10 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl p-1.5 z-50">
          {items.map((m) => {
            const Icon = m.icon;
            const active = pathname === m.to;
            return (
              <Link
                key={m.to}
                to={m.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${
                  active ? "bg-gold/10 text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-gold" />
                {m.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
