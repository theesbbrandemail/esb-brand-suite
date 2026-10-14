import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  MessageCircle, Phone, Calendar, Clock, CheckCircle2, AlertCircle,
  Filter, Search, UserCheck, Sparkles, Send, RefreshCw, ChevronRight,
  HeartPulse, ShieldAlert, Award, FileText, Check, Plus
} from "lucide-react";
import { Shell } from "@/components/esb/Shell";

export const Route = createFileRoute("/followups")({
  head: () => ({
    meta: [
      { title: "Customer Follow-Up Dashboard — ESB Brand Suite" },
      { name: "description", content: "Post-care check-ins, treatment recovery monitoring, and replenishment follow-ups across all ESB departments." },
    ],
  }),
  component: FollowupsPage,
});

type DeptKey =
  | "all"
  | "skincare-kitchen"
  | "derma"
  | "skinclinic"
  | "dental"
  | "rejuvenating"
  | "studios";

interface FollowUpTask {
  id: string;
  patientName: string;
  phone: string;
  deptKey: Exclude<DeptKey, "all">;
  deptName: string;
  treatmentName: string;
  treatmentDate: string;
  followUpType:
    | "Day 1 Post-Care Check"
    | "Day 3 Peeling & Redness Evaluation"
    | "Day 7 Healing & Glow Check"
    | "Serum Refill & Replenishment"
    | "Session 2 Next Appointment"
    | "Dental Sensitivity Check";
  urgency: "high" | "medium" | "routine";
  status: "pending" | "sent" | "completed" | "escalated";
  dueDate: string;
  assignedStaff: string;
  recommendedMessage: string;
  notes?: string;
}

const INITIAL_FOLLOWUPS: FollowUpTask[] = [
  {
    id: "fup-1",
    patientName: "Dr. Amara Okonjo",
    phone: "+2348023341122",
    deptKey: "skinclinic",
    deptName: "Skin Clinic",
    treatmentName: "Glycolic 20% Peeling & Hydra-Glow",
    treatmentDate: "2026-10-10",
    followUpType: "Day 1 Post-Care Check",
    urgency: "high",
    status: "pending",
    dueDate: "Today, 11:00 AM",
    assignedStaff: "Nurse Kemi",
    recommendedMessage:
      "Good morning Dr. Amara! This is Nurse Kemi from ESB Skin Clinic checking in on your skin after yesterday's Glycolic Peel. How is the hydration feeling? Please remember to reapply your mineral SPF 50 every 3 hours and avoid hot steam.",
  },
  {
    id: "fup-2",
    patientName: "Senator Fatima Aliyu",
    phone: "+2348091118899",
    deptKey: "rejuvenating",
    deptName: "Rejuvenating Aesthetics",
    treatmentName: "Exosome Microneedling & RF",
    treatmentDate: "2026-10-09",
    followUpType: "Day 3 Peeling & Redness Evaluation",
    urgency: "medium",
    status: "pending",
    dueDate: "Today, 02:00 PM",
    assignedStaff: "Dr. Ngozi Eze",
    recommendedMessage:
      "Good afternoon Senator Fatima. Following up on your Exosome & RF treatment on Friday. Any mild flaking or tightness is expected cellular turnover. Are you enjoying the Barrier Repair Balm provided in your aftercare kit?",
  },
  {
    id: "fup-3",
    patientName: "Chinedu Eke",
    phone: "+2348189987766",
    deptKey: "skincare-kitchen",
    deptName: "Skincare Kitchen",
    treatmentName: "Custom Peptide Serum Bar Batch #204",
    treatmentDate: "2026-09-12",
    followUpType: "Serum Refill & Replenishment",
    urgency: "routine",
    status: "pending",
    dueDate: "Today, 04:30 PM",
    assignedStaff: "Esthetician Chioma",
    recommendedMessage:
      "Hello Chinedu! It's been 4 weeks since your custom peptide serum was freshly blended at ESB Skincare Kitchen. You should be down to your last 5ml! Would you like us to prepare your fresh refill bottle for pickup?",
  },
  {
    id: "fup-4",
    patientName: "Hauwa Bello",
    phone: "+2348035552345",
    deptKey: "dental",
    deptName: "Dental Clinic",
    treatmentName: "Hollywood Laser Teeth Whitening",
    treatmentDate: "2026-10-10",
    followUpType: "Dental Sensitivity Check",
    urgency: "high",
    status: "pending",
    dueDate: "Today, 10:30 AM",
    assignedStaff: "Dr. Tariq Bello",
    recommendedMessage:
      "Good morning Hauwa! Checking in from ESB Dental Clinic. How are your teeth feeling this morning after yesterday's whitening? Please ensure you stick to the 'white diet' (no coffee, red wine or dark stews) for the next 24 hours.",
  },
  {
    id: "fup-5",
    patientName: "Ngozi Obi",
    phone: "+2348123339900",
    deptKey: "derma",
    deptName: "Derma Aesthetics",
    treatmentName: "Acne Purifying Homecare Bundle",
    treatmentDate: "2026-10-04",
    followUpType: "Day 7 Healing & Glow Check",
    urgency: "routine",
    status: "completed",
    dueDate: "Yesterday",
    assignedStaff: "Blessing Okon",
    recommendedMessage:
      "Hi Ngozi! How is your skin adjusting to the Azelaic Clarifying Gel after 7 days? Send us a quick no-makeup photo if you'd like our esthetician to review your progress!",
  },
  {
    id: "fup-6",
    patientName: "Tunde Bakare",
    phone: "+2348074441234",
    deptKey: "studios",
    deptName: "ESB Studios",
    treatmentName: "Editorial Beauty Portrait & Retouching",
    treatmentDate: "2026-10-08",
    followUpType: "Session 2 Next Appointment",
    urgency: "medium",
    status: "pending",
    dueDate: "Tomorrow, 01:00 PM",
    assignedStaff: "David Bassey",
    recommendedMessage:
      "Hello Tunde! Your initial high-resolution studio proofs from ESB Studios are ready in your private client portal. Would you like to select your top 5 for final color grading?",
  },
];

function FollowupsPage() {
  const [selectedDept, setSelectedDept] = useState<DeptKey>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [tasks, setTasks] = useState<FollowUpTask[]>(INITIAL_FOLLOWUPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMessageModal, setActiveMessageModal] = useState<FollowUpTask | null>(null);

  const filteredTasks = tasks.filter((t) => {
    const matchesDept = selectedDept === "all" || t.deptKey === selectedDept;
    const matchesStatus = statusFilter === "all" || (statusFilter === "pending" ? t.status !== "completed" : t.status === "completed");
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.treatmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.followUpType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedTodayCount = tasks.filter((t) => t.status === "completed").length;

  const handleMarkSent = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: "sent" } : t)));
    toast.success("Follow-up marked as sent via WhatsApp!");
  };

  const handleMarkCompleted = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: "completed" } : t)));
    toast.success("Follow-up completed and logged to client record!");
  };

  return (
    <Shell>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-gold uppercase tracking-wider mb-1 font-semibold">
            <HeartPulse className="h-3.5 w-3.5" /> Clinical & Customer Concierge
          </div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            Customer Follow-Up Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Departmental post-procedure monitoring, healing check-ins, refill alerts, and 1-click WhatsApp outreach.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const pendingOnes = tasks.filter((t) => t.status === "pending");
              toast.success(`Automated dispatch queued: ${pendingOnes.length} follow-up reminders queued.`);
            }}
            className="chip-violet px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> Run AI Auto-Followups
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Pending Follow-ups
          </div>
          <div className="text-3xl font-display font-bold text-gold">{pendingCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Requires contact today</div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Completed Today
          </div>
          <div className="text-3xl font-display font-bold text-success">{completedTodayCount}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Response rate: 94.2%</div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Post-Care Protocol SLA
          </div>
          <div className="text-3xl font-display font-bold text-foreground">100%</div>
          <div className="text-[11px] text-success mt-1">Zero overdue Day 1 check-ins</div>
        </div>

        <div className="card-elevated p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Repeat Bookings Generated
          </div>
          <div className="text-3xl font-display font-bold text-violet">18</div>
          <div className="text-[11px] text-muted-foreground mt-1">From replenishment alerts</div>
        </div>
      </div>

      {/* Filters: Department & Status */}
      <div className="space-y-3 mb-6">
        {/* Department row */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All Departments" },
            { key: "skinclinic", label: "Skin Clinic" },
            { key: "rejuvenating", label: "Rejuvenating Aesthetics" },
            { key: "skincare-kitchen", label: "Skincare Kitchen" },
            { key: "dental", label: "Dental Clinic" },
            { key: "derma", label: "Derma Aesthetics" },
            { key: "studios", label: "ESB Studios" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedDept(item.key as DeptKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition ${
                selectedDept === item.key
                  ? "bg-gold text-gold-foreground font-semibold shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["all", "pending", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs capitalize ${
                  statusFilter === s
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All Tasks" : s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient, procedure, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-secondary/80 border border-border text-xs focus:outline-none focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="card-elevated p-8 text-center text-muted-foreground">
            <p className="text-sm">No follow-up tasks found for this department filter.</p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`card-elevated p-4 transition border ${
                t.status === "completed"
                  ? "opacity-60 border-border"
                  : t.urgency === "high"
                  ? "border-warning/50 bg-warning/5"
                  : "border-border hover:border-gold/30"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{t.patientName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold font-medium">
                      {t.deptName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {t.followUpType}
                    </span>
                    {t.urgency === "high" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" /> High Priority
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Procedure: <span className="text-foreground">{t.treatmentName}</span> ({t.treatmentDate})
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due: {t.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> Assigned: {t.assignedStaff}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveMessageModal(t)}
                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <FileText className="h-3.5 w-3.5 text-gold" /> View Message
                  </button>

                  <a
                    href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      t.recommendedMessage
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleMarkSent(t.id)}
                    className="chip-gold px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 hover:scale-105 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Send WhatsApp
                  </a>

                  {t.status !== "completed" ? (
                    <button
                      onClick={() => handleMarkCompleted(t.id)}
                      className="p-2 rounded-xl bg-success/15 text-success hover:bg-success hover:text-white transition"
                      title="Mark follow-up completed"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-xs text-success font-medium flex items-center gap-1 px-2">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Modal */}
      {activeMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-elevated p-6 max-w-lg w-full">
            <h2 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gold" />
              Follow-up Message Template
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Patient: {activeMessageModal.patientName} · {activeMessageModal.deptName}
            </p>

            <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground leading-relaxed mb-4">
              {activeMessageModal.recommendedMessage}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveMessageModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>

              <a
                href={`https://wa.me/${activeMessageModal.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  activeMessageModal.recommendedMessage
                )}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  handleMarkSent(activeMessageModal.id);
                  setActiveMessageModal(null);
                }}
                className="chip-gold px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Open in WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
