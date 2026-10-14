import { useState, useEffect } from "react";
import {
  Crown, Stethoscope, Syringe, Briefcase, Calculator, Truck,
  Users, ChevronDown, Check, UserCheck, ShieldAlert, X,
  Building2, Clock, CheckCircle2, UserX, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  getStoredStaffAccounts,
  approveStaffAccount,
  rejectStaffAccount,
  ROLE_CONFIGS,
  type StaffAccount,
  type StaffRole,
} from "@/lib/role-manager";

export function StaffRoleSwitcher() {
  const { staffAccount, isCeo, switchUser, pendingCount } = useAuth();
  const [open, setOpen] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [accounts, setAccounts] = useState<StaffAccount[]>(() => getStoredStaffAccounts());

  useEffect(() => {
    const handleUpdate = () => {
      setAccounts(getStoredStaffAccounts());
    };
    window.addEventListener("esb_staff_roles_updated", handleUpdate);
    return () => window.removeEventListener("esb_staff_roles_updated", handleUpdate);
  }, []);

  const pendingAccounts = accounts.filter((a) => a.status === "pending_ceo_approval");

  const getRoleIcon = (role: StaffRole) => {
    switch (role) {
      case "ceo":
        return <Crown className="h-3.5 w-3.5 text-gold" />;
      case "doctor":
        return <Stethoscope className="h-3.5 w-3.5 text-blue-400" />;
      case "nurse":
        return <Syringe className="h-3.5 w-3.5 text-emerald-400" />;
      case "sales":
        return <Briefcase className="h-3.5 w-3.5 text-amber-400" />;
      case "accountant":
        return <Calculator className="h-3.5 w-3.5 text-violet-400" />;
      case "logistics":
        return <Truck className="h-3.5 w-3.5 text-cyan-400" />;
      case "manager":
        return <Users className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const handleApprove = (staffId: string, role: StaffRole, branch: "Port Harcourt" | "Abuja") => {
    const approved = approveStaffAccount(staffId, role, branch);
    if (approved) {
      toast.success(`Role Approved by CEO Mrs. Elizabeth Umeh!`, {
        description: `${approved.fullName} now has ${ROLE_CONFIGS[role].title} access in ${branch}.`,
      });
      setAccounts(getStoredStaffAccounts());
    }
  };

  const handleReject = (staffId: string) => {
    rejectStaffAccount(staffId);
    toast.error("Application Rejected");
    setAccounts(getStoredStaffAccounts());
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary/90 border border-white/10 text-xs transition"
          title="Switch Staff Role or View Tailored Dashboards"
        >
          {getRoleIcon(staffAccount.role)}
          <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-[160px]">
            {staffAccount.fullName}
          </span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline uppercase font-mono">
            ({staffAccount.role})
          </span>

          {pendingCount > 0 && isCeo && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold animate-pulse">
              {pendingCount}
            </span>
          )}

          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#140F24] border border-gold/30 shadow-2xl z-50 p-3 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase text-gold tracking-wider block">
                  Staff Role Governance
                </span>
                <span className="text-xs text-muted-foreground">Select role to preview tailored view</span>
              </div>
              {isCeo && pendingCount > 0 && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowApprovalsModal(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 hover:bg-rose-500/30"
                >
                  {pendingCount} Pending
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {accounts.map((acc) => {
                const isActive = acc.email.toLowerCase() === staffAccount.email.toLowerCase();
                const isPending = acc.status === "pending_ceo_approval";

                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      switchUser(acc.email);
                      setOpen(false);
                      toast.success(`Active Identity: ${acc.fullName}`, {
                        description: `Role: ${ROLE_CONFIGS[acc.role]?.title || acc.role} • ${acc.branch}`,
                      });
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition text-xs ${
                      isActive
                        ? "bg-gold/15 border border-gold/40 text-foreground font-semibold"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {getRoleIcon(acc.role)}
                      <div className="truncate">
                        <div className="font-medium text-foreground truncate">{acc.fullName}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span>{ROLE_CONFIGS[acc.role]?.title}</span>
                          <span>•</span>
                          <span>{acc.branch}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isPending && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                          Pending
                        </span>
                      )}
                      {isActive && <Check className="h-3.5 w-3.5 text-gold shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {isCeo && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowApprovalsModal(true);
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-semibold flex items-center justify-center gap-1.5 border border-gold/30"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>CEO Staff Approvals Hub ({pendingCount})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CEO Approvals Modal */}
      {showApprovalsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated max-w-2xl w-full p-6 rounded-3xl border border-gold/50 bg-[#140F24] shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    CEO Staff Role Authorization Hub
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Exclusive to Mrs. Elizabeth Umeh (Founder & CEO). Confirm or reassign staff privileges.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApprovalsModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {pendingAccounts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-foreground">All Staff Registrations Confirmed</div>
                <div className="text-xs text-muted-foreground">
                  No staff members currently awaiting CEO review. New Gmail sign-ins will automatically populate here.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAccounts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-white/10 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <div className="font-bold text-sm text-foreground">{p.fullName}</div>
                        <div className="text-muted-foreground font-mono">{p.email}</div>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold w-fit">
                        Requested: {ROLE_CONFIGS[p.role]?.title || p.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div>
                        <span>Branch: </span>
                        <strong className="text-foreground">{p.branch}</strong>
                      </div>
                      <div>
                        <span>Phone: </span>
                        <strong className="text-foreground">{p.phone || "Not specified"}</strong>
                      </div>
                    </div>

                    {p.notes && (
                      <div className="p-2.5 rounded-xl bg-background/50 border border-white/5 text-[11px] text-muted-foreground italic">
                        "{p.notes}"
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                      <button
                        onClick={() => handleReject(p.id)}
                        className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleApprove(p.id, p.role, p.branch === "All Branches" ? "Port Harcourt" : p.branch)}
                        className="chip-gold px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm Role & Access</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowApprovalsModal(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-xs text-foreground font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
