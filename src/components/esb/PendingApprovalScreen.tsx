import { useState } from "react";
import {
  Clock, ShieldAlert, CheckCircle2, UserCheck, ArrowRight,
  Sparkles, Lock, Building2, Crown, Mail, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  getStoredStaffAccounts,
  approveStaffAccount,
  registerNewStaffRequest,
  type StaffRole,
} from "@/lib/role-manager";

export function PendingApprovalScreen() {
  const { staffAccount, switchUser } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [emailInput, setEmailInput] = useState(staffAccount.email);
  const [nameInput, setNameInput] = useState(staffAccount.fullName);
  const [roleInput, setRoleInput] = useState<StaffRole>("sales");
  const [branchInput, setBranchInput] = useState<"Port Harcourt" | "Abuja">("Port Harcourt");

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) {
      toast.error("Please provide email and full name");
      return;
    }
    const registered = registerNewStaffRequest(
      emailInput.trim(),
      nameInput.trim(),
      roleInput,
      branchInput
    );
    switchUser(registered.email);
    toast.success("Application Registered with Executive Desk!", {
      description: "Awaiting final confirmation from Mrs. Elizabeth Umeh (CEO).",
    });
    setShowApplyModal(false);
  };

  const handleQuickCeoBypass = () => {
    // Allows instant CEO review simulation for test/presentation
    approveStaffAccount(staffAccount.id, staffAccount.role === "public" ? "sales" : staffAccount.role, staffAccount.branch === "All Branches" ? "Port Harcourt" : staffAccount.branch);
    switchUser(staffAccount.email);
    toast.success("CEO Authorization Confirmed!", {
      description: `Role ${staffAccount.role.toUpperCase()} approved by Mrs. Elizabeth Umeh.`,
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card-elevated max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-gold/40 shadow-2xl bg-[#120E20] space-y-6 text-center animate-fade-in">
        {/* Header Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-lg">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="h-3 w-3" />
            <span>Strict CEO Governance</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            Role Confirmation Pending
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Welcome to <strong>ESB Brand Enterprise Suite</strong>. To protect sensitive medical records, classified board audits, and client dossiers, all new Gmail accounts must be confirmed by <strong>Mrs. Elizabeth Umeh (CEO & Founder)</strong> before dashboard access is unlocked.
          </p>
        </div>

        {/* Current Request Card */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-white/10 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Authenticated Gmail:</span>
            <strong className="text-foreground font-mono">{staffAccount.email}</strong>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Staff Name:</span>
            <strong className="text-foreground">{staffAccount.fullName}</strong>
          </div>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-muted-foreground">Requested Role:</span>
            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold font-bold uppercase font-mono text-[10px]">
              {staffAccount.role.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Operating Facility:</span>
            <span className="text-foreground font-semibold flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-gold" />
              {staffAccount.branch}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-gold/40 text-xs font-semibold text-foreground hover:bg-secondary/50 transition w-full sm:w-auto"
            >
              Update Registration Details
            </button>

            <button
              onClick={() => switchUser("theesbbrandemail@gmail.com")}
              className="chip-gold px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Sign in as Mrs. Elizabeth Umeh (CEO)</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-2">
            <button
              onClick={handleQuickCeoBypass}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Simulate Instant CEO Role Approval (Demo / Presentation)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registration Details Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated max-w-md w-full p-6 rounded-3xl border border-gold/40 bg-[#161226] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-foreground">Register Staff Profile</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground block mb-1">Gmail Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Designated Role</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 text-foreground"
                >
                  <option value="doctor">Lead Dermatologist / Surgeon</option>
                  <option value="nurse">Senior Aesthetic Registered Nurse</option>
                  <option value="sales">VIP Sales & Client Relations Director</option>
                  <option value="accountant">Chief Financial Officer & Accountant</option>
                  <option value="logistics">Operations & Inventory Controller</option>
                  <option value="manager">Branch General Manager</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block mb-1">Operating Branch</label>
                <select
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-background/60 border border-white/10 text-foreground"
                >
                  <option value="Port Harcourt">Port Harcourt Flagship Clinic & Depot</option>
                  <option value="Abuja">Abuja Executive Clinic & Lab</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="chip-gold px-4 py-2 text-xs font-semibold w-full"
                >
                  Submit for CEO Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
