import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, UserCheck, Clock, MapPin, ShieldCheck, Plus, Search,
  Filter, CheckCircle2, DollarSign, Calendar, Phone, Award,
  Activity, ArrowUpRight, Sparkles, Building2, Stethoscope, Briefcase,
  Star, Trophy, Heart, Gift, TrendingUp, Zap, ChevronRight, X,
  Check, AlertTriangle, Layers, ListTodo, FileText, Send, UserX,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { StaffGeoClockIn } from "@/components/esb/StaffGeoClockIn";
import { SendClientGmailModal } from "@/components/esb/SendClientGmailModal";
import { GlobalBranchSwitch } from "@/components/esb/GlobalBranchSwitch";
import {
  getSelectedBranch,
  matchesCurrentBranch,
  type ActiveBranchKey,
} from "@/lib/branch-manager";
import {
  getStoredStaff,
  saveStoredStaff,
  getStoredStaffPerformance,
  saveStoredStaffPerformance,
  type StaffRecord,
  type StaffPerformanceRecord
} from "@/lib/storage";
import { formatNaira } from "@/lib/currency";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff Intelligence, Tasks & Scorecards — ESB Brand" },
      {
        name: "description",
        content:
          "Manager's intelligence dashboard, role-specific task worklists, attendance punctuality metrics, Employee of the Month scorecards, and premises-enforced GPS clock-in.",
      },
    ],
  }),
  component: StaffRecordsPage,
});

type StaffTab = "performance" | "tasks" | "attendance" | "actions" | "geofence";

interface DetailedStaffTask {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  category: "Clinical" | "Pharmaceutical" | "Sales & CRM" | "Operations" | "Quality & SOP";
  taskTitle: string;
  taskDetails: string;
  priority: "High" | "Medium" | "Urgent";
  status: "pending" | "in_progress" | "completed";
  dueTime: string;
  sopCode?: string;
  branch?: "Abuja" | "Port Harcourt" | "All Branches";
  estimatedMinutes?: number;
  checklist?: Array<{ id: string; label: string; done: boolean }>;
  verificationProtocol?: string;
  notes?: string;
}

interface AttendanceRecord {
  staffId: string;
  name: string;
  role: string;
  branch: "Abuja" | "Port Harcourt";
  scheduledDays: number;
  daysPresent: number;
  daysOnTime: number;
  lateDays: number;
  totalLateMinutes: number;
  approvedLeaves: number;
  unapprovedAbsences: number;
  earlyDepartures: number;
  missedClockIns: number;
  onTimeRatePct: number; // (Days on time / Days scheduled) * 100
  attendanceScore: number;
}

interface EmployeeScorecard {
  staffId: string;
  name: string;
  role: string;
  branch: string;
  roleKpiScore: number; // 40%
  attendanceScore: number; // 15%
  qualitySopScore: number; // 15%
  customerExpScore: number; // 15%
  initiativeScore: number; // 10%
  reportingScore: number; // 5%
  totalScore: number; // Out of 100%
  rank: number;
  awardEligible: boolean;
  notes: string;
}

interface ManagementActionRecord {
  id: string;
  issue: string;
  branch: "Abuja" | "Port Harcourt" | "All Branches";
  department: string;
  rootCause: string;
  correctiveAction: string;
  responsiblePerson: string;
  deadline: string;
  status: "Open" | "In Progress" | "Resolved";
}

const SEED_DETAILED_TASKS: DetailedStaffTask[] = [
  {
    id: "task-101",
    staffId: "staff-1",
    staffName: "Dr. Ngozi Eze",
    role: "Lead Dermatologist",
    category: "Clinical",
    sopCode: "SOP-CLN-014",
    branch: "Port Harcourt",
    estimatedMinutes: 45,
    taskTitle: "Review Fitzpatrick IV chemical peel protocols & approve dilution",
    taskDetails: "Authorize 20% TCA concentration guidelines for Nurse Amina and outpatient consults. Inspect client patch tests and verify neutralization buffer pH 8.0.",
    priority: "Urgent",
    status: "in_progress",
    dueTime: "11:00 AM",
    verificationProtocol: "Sign off in CRM Clinical Notes and log batch neutralization reagent in Lab Registry.",
    checklist: [
      { id: "c1", label: "Review Fitzpatrick type IV/V clinical safety thresholds", done: true },
      { id: "c2", label: "Confirm 20% trichloroacetic acid dilution ratio with Pharmacist Emeka", done: true },
      { id: "c3", label: "Verify post-peel sodium bicarbonate neutralization buffer availability", done: false },
      { id: "c4", label: "Sign electronic medical approval sheet for outpatient cases", done: false },
    ],
    notes: "Client Chief Adeleke scheduled for 2:30 PM treatment in Suite 02.",
  },
  {
    id: "task-102",
    staffId: "staff-2",
    staffName: "Nurse Amina Bello",
    role: "Senior Aesthetic Registered Nurse",
    category: "Clinical",
    sopCode: "SOP-NUR-022",
    branch: "Port Harcourt",
    estimatedMinutes: 30,
    taskTitle: "Room Suite A laser handpiece UV sterilization & consent verification",
    taskDetails: "Ensure autoclave cycle temperature strip is logged in patient charts prior to laser therapy. Inspect protective eye goggles for both patient and clinician.",
    priority: "High",
    status: "completed",
    dueTime: "08:30 AM",
    verificationProtocol: "Autoclave temperature indicator tape archived in Daily Nursing Sterilization Log.",
    checklist: [
      { id: "c1", label: "Autoclave cycle 134°C sterilization for 18 minutes executed", done: true },
      { id: "c2", label: "Verify class 4 laser protective eyewear optical density (OD 7+)", done: true },
      { id: "c3", label: "Obtain countersigned digital consent form from VIP client", done: true },
      { id: "c4", label: "Calibrate skin cooling chiller to 4°C continuous contact", done: true },
    ],
    notes: "All Suite A prep verified and ready for Dr. Eze.",
  },
  {
    id: "task-103",
    staffId: "staff-6",
    staffName: "Pharm. Emeka Obi",
    role: "Chief Pharmacist & Formulations Lead",
    category: "Pharmaceutical",
    sopCode: "SOP-PHM-008",
    branch: "Port Harcourt",
    estimatedMinutes: 25,
    taskTitle: "Sterile Lab Refrigerator #01 Cold-Chain Inspection (2°C - 8°C)",
    taskDetails: "Verify temperature sensor telemetry and batch Lot EXO-2026-92 exosome stability. Log cold-chain integrity across central formulation repository.",
    priority: "High",
    status: "completed",
    dueTime: "09:00 AM",
    verificationProtocol: "Temperature chart logger export attached to National Agency compliance register.",
    checklist: [
      { id: "c1", label: "Inspect Digital Telemetry Sensor Log #01 (Current temp: 3.8°C)", done: true },
      { id: "c2", label: "Inspect secondary backup generator transfer switch for cold-room", done: true },
      { id: "c3", label: "Verify Lot EXO-2026-92 (28 vials remaining, expiry Dec 2027)", done: true },
      { id: "c4", label: "Re-seal nitrogen-purged sterile barrier packaging", done: true },
    ],
    notes: "Cold chain verified within 100% optimal parameters.",
  },
  {
    id: "task-104",
    staffId: "staff-4",
    staffName: "Chioma Okeke",
    role: "VIP Sales Director",
    category: "Sales & CRM",
    sopCode: "SOP-SLS-001",
    branch: "Abuja",
    estimatedMinutes: 60,
    taskTitle: "Submit Monthly ESB-SALES-KPI-001 Customer Intelligence Report",
    taskDetails: "Consolidate lost sales reasons, top 10 requested SKUs, and customer objection data across Abuja and Port Harcourt sales reps. Ensure all pipeline deals reflect collected cash.",
    priority: "High",
    status: "in_progress",
    dueTime: "02:00 PM",
    verificationProtocol: "Direct upload to CEO Executive Intelligence Suite with audit trail.",
    checklist: [
      { id: "c1", label: "Calculate lead-to-cash conversion rate for 48 active pipeline leads", done: true },
      { id: "c2", label: "Document top 5 lost sales objections (Price 42%, Stock-out 28%)", done: true },
      { id: "c3", label: "Verify repeat client purchases with Accounting bank statement reconciliations", done: false },
      { id: "c4", label: "Submit 5-part scorecard grades for all branch sales representatives", done: false },
    ],
    notes: "Interim numbers indicate 82.5% target achievement MTD.",
  },
  {
    id: "task-105",
    staffId: "staff-3",
    staffName: "Tunde Bakare",
    role: "Lead Dental Surgeon",
    category: "Clinical",
    sopCode: "SOP-DNT-011",
    branch: "Port Harcourt",
    estimatedMinutes: 30,
    taskTitle: "Calibrate Hollywood laser whitening power outputs and shade guide Vita B2",
    taskDetails: "Complete desensitizing gel inspection before 11:30 AM appointment. Inspect gingival barrier resin curing light.",
    priority: "Medium",
    status: "pending",
    dueTime: "11:15 AM",
    verificationProtocol: "Pre-shade and post-shade clinical photography archived in Dental CRM.",
    checklist: [
      { id: "c1", label: "Laser whitening diode output calibrated to 460nm wavelength", done: false },
      { id: "c2", label: "Inspect gingival barrier blue curing light battery level (100%)", done: true },
      { id: "c3", label: "Confirm potassium nitrate desensitizing topical gel stock", done: false },
      { id: "c4", label: "Prepare Vita Bleachedguide 3D-Master shade reference tab", done: false },
    ],
    notes: "Client requested minimum 4 shades improvement.",
  },
  {
    id: "task-106",
    staffId: "staff-5",
    staffName: "Zainab Aliyu",
    role: "Operations & Supply Controller",
    category: "Operations",
    sopCode: "SOP-OPS-033",
    branch: "Abuja",
    estimatedMinutes: 40,
    taskTitle: "Reconcile Abuja warehouse dispatch WAY-APX-8812 and inventory levels",
    taskDetails: "Ensure 50 units Vitamin C and Exosome serums are checked in upon DHL delivery. Scan QR codes into Supabase warehouse database.",
    priority: "High",
    status: "pending",
    dueTime: "01:30 PM",
    verificationProtocol: "Goods Delivery Note signed by DHL driver and Formulations QC Officer.",
    checklist: [
      { id: "c1", label: "Track DHL express airway bill WAY-APX-8812 dispatch courier status", done: true },
      { id: "c2", label: "Inspect physical carton tamper-evident holographic security tape", done: false },
      { id: "c3", label: "Match physical vial count against electronic Purchase Order PO-8821", done: false },
      { id: "c4", label: "Execute one-click barcode ingest into Inventory system", done: false },
    ],
    notes: "Courier van currently 15 minutes away from Maitama clinic.",
  },
];

const SEED_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    staffId: "staff-1",
    name: "Dr. Ngozi Eze",
    role: "Lead Dermatologist",
    branch: "Port Harcourt",
    scheduledDays: 24,
    daysPresent: 24,
    daysOnTime: 24,
    lateDays: 0,
    totalLateMinutes: 0,
    approvedLeaves: 0,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 100.0,
    attendanceScore: 100,
  },
  {
    staffId: "staff-2",
    name: "Nurse Amina Bello",
    role: "Senior Aesthetic RN",
    branch: "Port Harcourt",
    scheduledDays: 24,
    daysPresent: 24,
    daysOnTime: 23,
    lateDays: 1,
    totalLateMinutes: 12,
    approvedLeaves: 0,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 95.8,
    attendanceScore: 97,
  },
  {
    staffId: "staff-6",
    name: "Pharm. Emeka Obi",
    role: "Chief Pharmacist",
    branch: "Port Harcourt",
    scheduledDays: 24,
    daysPresent: 24,
    daysOnTime: 24,
    lateDays: 0,
    totalLateMinutes: 0,
    approvedLeaves: 0,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 100.0,
    attendanceScore: 100,
  },
  {
    staffId: "staff-4",
    name: "Chioma Okeke",
    role: "VIP Sales Director",
    branch: "Port Harcourt",
    scheduledDays: 24,
    daysPresent: 23,
    daysOnTime: 22,
    lateDays: 1,
    totalLateMinutes: 15,
    approvedLeaves: 1,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 91.7,
    attendanceScore: 94,
  },
  {
    staffId: "staff-5",
    name: "Zainab Aliyu",
    role: "Operations Controller",
    branch: "Abuja",
    scheduledDays: 24,
    daysPresent: 24,
    daysOnTime: 23,
    lateDays: 1,
    totalLateMinutes: 8,
    approvedLeaves: 0,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 95.8,
    attendanceScore: 98,
  },
  {
    staffId: "staff-3",
    name: "Tunde Bakare",
    role: "Lead Dental Surgeon",
    branch: "Port Harcourt",
    scheduledDays: 22,
    daysPresent: 22,
    daysOnTime: 21,
    lateDays: 1,
    totalLateMinutes: 20,
    approvedLeaves: 0,
    unapprovedAbsences: 0,
    earlyDepartures: 0,
    missedClockIns: 0,
    onTimeRatePct: 95.5,
    attendanceScore: 96,
  },
];

const SEED_SCORECARDS: EmployeeScorecard[] = [
  {
    staffId: "staff-1",
    name: "Dr. Ngozi Eze",
    role: "Lead Dermatologist",
    branch: "Port Harcourt Flagship",
    roleKpiScore: 39.2, // out of 40%
    attendanceScore: 15.0, // out of 15%
    qualitySopScore: 15.0, // out of 15%
    customerExpScore: 14.8, // out of 15%
    initiativeScore: 9.8, // out of 10%
    reportingScore: 5.0, // out of 5%
    totalScore: 98.8,
    rank: 1,
    awardEligible: true,
    notes: "Flawless clinical documentation and zero adverse escalations.",
  },
  {
    staffId: "staff-6",
    name: "Pharm. Emeka Obi",
    role: "Chief Pharmacist",
    branch: "Port Harcourt Flagship",
    roleKpiScore: 38.5,
    attendanceScore: 15.0,
    qualitySopScore: 15.0,
    customerExpScore: 14.5,
    initiativeScore: 9.5,
    reportingScore: 5.0,
    totalScore: 97.5,
    rank: 2,
    awardEligible: true,
    notes: "Maintained 100% cold-chain integrity and NAFDAC compliance.",
  },
  {
    staffId: "staff-2",
    name: "Nurse Amina Bello",
    role: "Senior Aesthetic RN",
    branch: "Port Harcourt Flagship",
    roleKpiScore: 38.0,
    attendanceScore: 14.4,
    qualitySopScore: 15.0,
    customerExpScore: 14.8,
    initiativeScore: 9.2,
    reportingScore: 4.8,
    totalScore: 96.2,
    rank: 3,
    awardEligible: true,
    notes: "Patient care rating 4.9/5.0 with rigorous pre-procedure protocols.",
  },
  {
    staffId: "staff-4",
    name: "Chioma Okeke",
    role: "VIP Sales Director",
    branch: "Port Harcourt Flagship",
    roleKpiScore: 37.8,
    attendanceScore: 14.2,
    qualitySopScore: 14.5,
    customerExpScore: 14.7,
    initiativeScore: 9.4,
    reportingScore: 4.9,
    totalScore: 95.5,
    rank: 4,
    awardEligible: true,
    notes: "Exceeded monthly collection target by ₦4.2M with high retention.",
  },
];

const SEED_ACTIONS: ManagementActionRecord[] = [
  {
    id: "act-01",
    issue: "High weekend appointment cancellation rate in Abuja",
    branch: "Abuja",
    department: "Rejuvenating & Aesthetics",
    rootCause: "VIP escort arrivals conflict with morning schedule; reminder delay",
    correctiveAction: "Implement WhatsApp concierge reminder 24h & 2h prior; offer VIP private door entry",
    responsiblePerson: "Zainab Aliyu (Operations Lead)",
    deadline: "2026-10-20",
    status: "In Progress",
  },
  {
    id: "act-02",
    issue: "Temporary out-of-stock on TCA neutralizer kits",
    branch: "Port Harcourt",
    department: "Pharmacy & Derma",
    rootCause: "Wholesale batch transit delayed at regional cargo inspection",
    correctiveAction: "Emergency re-allocation of 15 kits from VI Central Formulation Lab via overnight courier",
    responsiblePerson: "Pharm. Emeka Obi",
    deadline: "2026-10-16",
    status: "Resolved",
  },
  {
    id: "act-03",
    issue: "Sales inquiries for Spironolactone cream which is not currently stocked",
    branch: "All Branches",
    department: "R&D & Formulation",
    rootCause: "Unmet customer demand logged in ESB-SALES-KPI-001 Section B",
    correctiveAction: "R&D formulation assessment for topical 5% cream with clinical director review",
    responsiblePerson: "Dr. Ngozi Eze / Pharm. Emeka Obi",
    deadline: "2026-10-30",
    status: "Open",
  },
];

function StaffRecordsPage() {
  const [activeTab, setActiveTab] = useState<StaffTab>("performance");
  const [staffList, setStaffList] = useState<StaffRecord[]>(() => getStoredStaff());
  const [staffPerf, setStaffPerf] = useState<StaffPerformanceRecord[]>(() => getStoredStaffPerformance());
  const [tasksList, setTasksList] = useState<DetailedStaffTask[]>(SEED_DETAILED_TASKS);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(SEED_ATTENDANCE_RECORDS);
  const [scorecards, setScorecards] = useState<EmployeeScorecard[]>(SEED_SCORECARDS);
  const [actionsList, setActionsList] = useState<ManagementActionRecord[]>(SEED_ACTIONS);

  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => staffList[0]?.id || "staff-1");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Active Branch Switch & Staff Gmail Integration
  const [activeBranch, setActiveBranch] = useState<ActiveBranchKey>(() => getSelectedBranch());
  const [gmailModal, setGmailModal] = useState<{
    open: boolean;
    recipientName: string;
    recipientEmail: string;
    recipientPhone?: string;
    department?: string;
    subject: string;
    message: string;
  }>({
    open: false,
    recipientName: "",
    recipientEmail: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const handleBranchChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ branch: ActiveBranchKey }>;
      if (customEvent.detail?.branch) {
        setActiveBranch(customEvent.detail.branch);
      } else {
        setActiveBranch(getSelectedBranch());
      }
    };
    window.addEventListener("esb_branch_changed", handleBranchChange);
    return () => window.removeEventListener("esb_branch_changed", handleBranchChange);
  }, []);

  // Detailed Task Inspection State & Filters
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<DetailedStaffTask | null>(null);
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>("all");
  const [taskSearch, setTaskSearch] = useState<string>("");

  const handleToggleChecklistStep = (taskId: string, stepId: string) => {
    setTasksList((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextChecklist = (t.checklist || []).map((step) =>
          step.id === stepId ? { ...step, done: !step.done } : step
        );
        const allDone = nextChecklist.length > 0 && nextChecklist.every((s) => s.done);
        const updated = {
          ...t,
          checklist: nextChecklist,
          status: (allDone ? "completed" : "in_progress") as DetailedStaffTask["status"],
        };
        if (selectedTaskDetail?.id === taskId) {
          setSelectedTaskDetail(updated);
        }
        return updated;
      })
    );
  };

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStaff, setNewTaskStaff] = useState(staffList[0]?.name || "Dr. Ngozi Eze");
  const [newTaskCat, setNewTaskCat] = useState<DetailedStaffTask["category"]>("Clinical");
  const [newTaskPriority, setNewTaskPriority] = useState<DetailedStaffTask["priority"]>("High");

  const refreshStaff = () => {
    setStaffList(getStoredStaff());
    setStaffPerf(getStoredStaffPerformance());
  };

  const activeStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

  const handleToggleTaskStatus = (id: string) => {
    setTasksList(
      tasksList.map((t) => {
        if (t.id !== id) return t;
        const nextStatus = t.status === "completed" ? "pending" : "completed";
        return { ...t, status: nextStatus };
      })
    );
    toast.success("Staff task status updated");
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: DetailedStaffTask = {
      id: `task-${Date.now()}`,
      staffId: `staff-${Date.now()}`,
      staffName: newTaskStaff,
      role: "Assigned Staff",
      category: newTaskCat,
      taskTitle: newTaskTitle.trim(),
      taskDetails: "Logged via Management Worklist Dispatcher.",
      priority: newTaskPriority,
      status: "pending",
      dueTime: "Today",
    };

    setTasksList([newTask, ...tasksList]);
    toast.success(`Task dispatched to ${newTaskStaff}!`);
    setNewTaskTitle("");
    setShowTaskModal(false);
  };

  const handleAwardBonus = (staffId: string, amountNgn: number = 50000) => {
    const updated = staffPerf.map((p) => {
      if (p.staffId !== staffId) return p;
      return {
        ...p,
        bonusEarnedNgn: p.bonusEarnedNgn + amountNgn,
        rewardPoints: p.rewardPoints + 250,
      };
    });
    setStaffPerf(updated);
    saveStoredStaffPerformance(updated);
    const target = staffPerf.find((p) => p.staffId === staffId);
    toast.success(`Awarded ${formatNaira(amountNgn)} Spot Bonus to ${target?.name}!`, {
      description: `Added +250 reward points. Synced with payroll audit trail.`,
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ================================================================== */}
        {/* HEADER & SWITCHER */}
        {/* ================================================================== */}
        <div className="p-6 rounded-3xl bg-secondary/30 border border-gold/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gold uppercase tracking-wider mb-1 font-semibold">
              <Building2 className="h-4 w-4" /> ESB Group Management Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Staff Intelligence, Worklists & Accountability
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
              Monitors Abuja & Port Harcourt: role-specific tasks, attendance punctuality metrics, Employee of the Month scorecards, and action trackers.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <GlobalBranchSwitch />
            <button
              onClick={() => setShowTaskModal(true)}
              className="chip-gold px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Dispatch Task
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* NAVIGATION TABS */}
        {/* ================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 p-1 rounded-2xl bg-secondary/30 border border-border">
          {[
            { key: "performance", label: "Employee Scorecards & Awards", icon: Trophy },
            { key: "tasks", label: "Role-Specific Staff Worklists", icon: ListTodo },
            { key: "attendance", label: "Punctuality & Attendance Engine", icon: Clock },
            { key: "actions", label: "Manager Accountability Tracker", icon: FileText },
            { key: "geofence", label: "Premises GPS Geofence", icon: ShieldCheck },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as StaffTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                  active
                    ? "bg-gold text-black shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* TAB 1: EMPLOYEE SCORECARDS & EMPLOYEE OF THE MONTH/YEAR */}
        {/* ================================================================== */}
        {activeTab === "performance" && (
          <div className="space-y-6 animate-fade-in">
            {/* Scorecard Methodology Banner */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-1">
                Employee of the Month/Year Weighted Scorecard Methodology (100% Total)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Employees are assessed fairly based on their actual role — separating attendance, job performance, and conduct so no one wins solely for high sales or showing up early:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-gold">40% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Role-Specific KPI</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-cyan-400">15% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Attendance & Punctuality</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-violet-400">15% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Quality & SOP Adherence</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-emerald-400">15% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Customer Experience</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-amber-300">10% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Initiative & Process</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border border-white/5 text-center">
                  <div className="font-bold text-rose-300">5% Weight</div>
                  <div className="text-[10px] text-muted-foreground">Reporting & Accuracy</div>
                </div>
              </div>
            </div>

            {/* Scorecard Rankings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scorecards
                .filter((sc) => activeBranch === "all" || matchesCurrentBranch(sc.branch, activeBranch))
                .map((sc) => (
                <div key={sc.staffId} className="card-elevated p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-gold text-black font-bold text-xs flex items-center justify-center font-mono">
                        #{sc.rank}
                      </span>
                      <div>
                        <div className="text-base font-bold text-foreground">{sc.name}</div>
                        <div className="text-xs text-muted-foreground">{sc.role} • {sc.branch}</div>
                      </div>
                    </div>

                    <span className="text-xs px-3 py-1 rounded-full font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {sc.totalScore}% Score
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Role KPI Achievement (40% max)</span>
                        <span className="font-mono text-gold font-bold">{sc.roleKpiScore} / 40</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${(sc.roleKpiScore / 40) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Attendance & Punctuality (15% max)</span>
                        <span className="font-mono text-cyan-400 font-bold">{sc.attendanceScore} / 15</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(sc.attendanceScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Quality & SOP Compliance (15% max)</span>
                        <span className="font-mono text-violet-400 font-bold">{sc.qualitySopScore} / 15</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(sc.qualitySopScore / 15) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Customer Experience & Teamwork (15% max)</span>
                        <span className="font-mono text-emerald-400 font-bold">{sc.customerExpScore} / 15</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(sc.customerExpScore / 15) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/60 text-[11px] text-muted-foreground border border-white/5 italic">
                    "{sc.notes}"
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>Employee of the Month Contender</span>
                    </span>

                    <button
                      onClick={() => handleAwardBonus(sc.staffId, 50000)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold/20 text-gold border border-gold/40 hover:bg-gold hover:text-black transition"
                    >
                      <Zap className="h-3.5 w-3.5 inline mr-1" />
                      <span>Award ₦50K Bonus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: ROLE-SPECIFIC STAFF WORKLISTS */}
        {/* ================================================================== */}
        {/* ================================================================== */}
        {/* TAB 2: ROLE-SPECIFIC STAFF WORKLISTS WITH FULL SOP DETAILS */}
        {/* ================================================================== */}
        {activeTab === "tasks" && (() => {
          const filteredTasks = tasksList.filter((t) => {
            if (activeBranch !== "all" && t.branch && !matchesCurrentBranch(t.branch, activeBranch)) return false;
            if (taskCategoryFilter !== "all" && t.category !== taskCategoryFilter) return false;
            if (taskStatusFilter !== "all" && t.status !== taskStatusFilter) return false;
            if (taskSearch.trim()) {
              const q = taskSearch.toLowerCase();
              return (
                t.taskTitle.toLowerCase().includes(q) ||
                t.taskDetails.toLowerCase().includes(q) ||
                t.staffName.toLowerCase().includes(q) ||
                (t.sopCode && t.sopCode.toLowerCase().includes(q))
              );
            }
            return true;
          });

          return (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-gold flex items-center gap-2">
                    <ListTodo className="h-4 w-4" /> Role-Specific Professional Task Worklists & SOPs
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Clear role segregation across Doctor, Nurse, Pharmacist, Sales Director, and Operations Controller with step-by-step SOP checklists.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-emerald-400 font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    {tasksList.filter((t) => t.status === "completed").length} of {tasksList.length} Completed
                  </span>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="chip-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Dispatch New Task</span>
                  </button>
                </div>
              </div>

              {/* Task Search & Filter Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/40 border border-border">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search by title, SOP code, staff name, or protocol..."
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                    {[
                      { key: "all", label: "All Categories" },
                      { key: "Clinical", label: "Clinical" },
                      { key: "Pharmaceutical", label: "Pharmacy" },
                      { key: "Sales & CRM", label: "Sales & CRM" },
                      { key: "Operations", label: "Operations" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setTaskCategoryFilter(cat.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition ${
                          taskCategoryFilter === cat.key
                            ? "bg-gold text-black"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Picker */}
                  <select
                    value={taskStatusFilter}
                    onChange={(e) => setTaskStatusFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:border-gold focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Task Cards List */}
              <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No tasks matching your current search or category filter.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((t) => {
                      const isDone = t.status === "completed";
                      const completedSteps = t.checklist ? t.checklist.filter((c) => c.done).length : 0;
                      const totalSteps = t.checklist ? t.checklist.length : 0;

                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isDone
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-[#1C172E] border-white/5 hover:border-gold/30"
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  t.priority === "Urgent"
                                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    : "bg-gold/20 text-gold border border-gold/30"
                                }`}
                              >
                                {t.priority}
                              </span>
                              {t.sopCode && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                                  {t.sopCode}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {t.category}
                              </span>
                              {t.branch && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                                  {t.branch}
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-sm text-foreground">{t.taskTitle}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{t.taskDetails}</div>

                            {totalSteps > 0 && (
                              <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                                <span className="font-mono text-gold font-semibold">
                                  SOP Progress: {completedSteps} / {totalSteps} steps completed
                                </span>
                                <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <div
                                    className="h-full bg-gold rounded-full transition-all"
                                    style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-0.5">
                              <span>Assignee: <strong className="text-foreground">{t.staffName}</strong> ({t.role})</span>
                              <span>•</span>
                              <span>Due: <strong className="text-gold">{t.dueTime}</strong></span>
                              {t.estimatedMinutes && (
                                <>
                                  <span>•</span>
                                  <span>Est: {t.estimatedMinutes} mins</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                            <button
                              onClick={() => {
                                const staffObj = staffList.find((s) => s.name === t.staffName);
                                setGmailModal({
                                  open: true,
                                  recipientName: t.staffName,
                                  recipientEmail: `${t.staffName.toLowerCase().replace(/[^a-z0-9]/g, "")}@esb-aesthetics.ng`,
                                  recipientPhone: staffObj?.phone,
                                  department: t.category,
                                  subject: `Task Assignment: ${t.taskTitle} [${t.sopCode || "ESB-SOP"}]`,
                                  message: `Dear ${t.staffName},\n\nYou have been assigned the following operational directive:\n\n• Task: ${t.taskTitle}\n• Role: ${t.role}\n• Branch: ${t.branch || "Port Harcourt / Abuja"}\n• Priority: ${t.priority}\n• Due: ${t.dueTime}\n• SOP Protocol: ${t.sopCode || "Standard Procedure"}\n\nTask Details:\n${t.taskDetails}\n\nVerification Protocol:\n${t.verificationProtocol || "Verify in system"}\n\nPlease complete the SOP checklist and confirm execution.\n\nManagement Operations Desk\nESB Brand Suite`,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition flex items-center gap-1"
                              title="Dispatch task brief to staff Gmail"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Email Staff</span>
                            </button>

                            <button
                              onClick={() => setSelectedTaskDetail(t)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold/15 text-gold border border-gold/40 hover:bg-gold hover:text-black transition flex items-center gap-1.5"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>View Full SOP Details</span>
                            </button>

                            <button
                              onClick={() => handleToggleTaskStatus(t.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                                isDone
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-secondary text-amber-300 border border-border hover:bg-secondary/80"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>{t.status.replace("_", " ")}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ================================================================== */}
        {/* TAB 3: PUNCTUALITY & ATTENDANCE FORMULA ENGINE */}
        {/* ================================================================== */}
        {activeTab === "attendance" && (
          <div className="space-y-6 animate-fade-in">
            {/* Punctuality Formula Card */}
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gold uppercase tracking-wider">
                    Staff Punctuality Formula: On-Time Rate = (Days on time ÷ Days scheduled) × 100
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Approved leaves and public holidays are excluded from lateness. Auto-flagging for repeated tardiness across Abuja & Port Harcourt.
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  Group Average: 96.5% Punctuality
                </span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="font-display font-bold text-sm text-foreground">
                  Monthly Attendance & Punctuality Records (Port Harcourt & Abuja)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1C172E] text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Employee & Role</th>
                      <th className="p-3.5">Branch</th>
                      <th className="p-3.5 text-center">Scheduled</th>
                      <th className="p-3.5 text-center">Present</th>
                      <th className="p-3.5 text-center">On-Time</th>
                      <th className="p-3.5 text-center">Late Days</th>
                      <th className="p-3.5 text-center">On-Time Rate (%)</th>
                      <th className="p-3.5 text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {attendanceList
                      .filter((att) => activeBranch === "all" || matchesCurrentBranch(att.branch, activeBranch))
                      .map((att) => (
                      <tr key={att.staffId} className="hover:bg-white/[0.02] transition">
                        <td className="p-3.5">
                          <div className="font-bold text-foreground text-sm font-sans">{att.name}</div>
                          <div className="text-[10px] text-muted-foreground font-sans">{att.role}</div>
                        </td>
                        <td className="p-3.5 font-sans">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {att.branch}
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-foreground">{att.scheduledDays}d</td>
                        <td className="p-3.5 text-center text-emerald-400 font-bold">{att.daysPresent}d</td>
                        <td className="p-3.5 text-center text-cyan-300 font-bold">{att.daysOnTime}d</td>
                        <td className="p-3.5 text-center text-amber-300">
                          {att.lateDays > 0 ? `${att.lateDays}d (${att.totalLateMinutes}m)` : "0d"}
                        </td>
                        <td className="p-3.5 text-center font-bold text-gold">{att.onTimeRatePct}%</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            {att.attendanceScore} pts
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: MANAGER ACCOUNTABILITY & ACTION TRACKER */}
        {/* ================================================================== */}
        {activeTab === "actions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 rounded-2xl bg-secondary/30 border border-gold/30">
              <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-1">
                Management Accountability & Corrective Action Tracker
              </h3>
              <p className="text-xs text-muted-foreground">
                A dashboard must not only show what happened; it must record what action is taken, by whom, and by when.
              </p>
            </div>

            <div className="space-y-3">
              {actionsList
                .filter((act) => activeBranch === "all" || act.branch === "All Branches" || matchesCurrentBranch(act.branch, activeBranch))
                .map((act) => (
                <div key={act.id} className="card-elevated p-5 rounded-2xl border border-white/10 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{act.issue}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono">
                          {act.branch} • {act.department}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase font-mono ${
                      act.status === "Resolved"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {act.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-background/60 border border-white/5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Root Cause:</span>
                      <span className="text-muted-foreground">{act.rootCause}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-background/60 border border-white/5">
                      <span className="text-[10px] text-gold uppercase font-bold block mb-0.5">Corrective Action:</span>
                      <span className="text-foreground font-medium">{act.correctiveAction}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Owner: <strong className="text-foreground">{act.responsiblePerson}</strong></span>
                    <span>Deadline: <strong className="text-gold font-mono">{act.deadline}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: GPS GEOFENCE CLOCK-IN */}
        {/* ================================================================== */}
        {activeTab === "geofence" && (
          <div className="space-y-4 animate-fade-in">
            {activeStaff && (
              <StaffGeoClockIn activeStaff={activeStaff} onUpdate={refreshStaff} />
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: DISPATCH TASK */}
        {/* ================================================================== */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreateTaskSubmit}
              className="card-elevated max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4 text-gold" /> Dispatch Role Task
                </h3>
                <button type="button" onClick={() => setShowTaskModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Assign To Staff</label>
                  <select
                    value={newTaskStaff}
                    onChange={(e) => setNewTaskStaff(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground">Category</label>
                  <select
                    value={newTaskCat}
                    onChange={(e) => setNewTaskCat(e.target.value as any)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    <option value="Clinical">Clinical</option>
                    <option value="Pharmaceutical">Pharmaceutical</option>
                    <option value="Sales & CRM">Sales & CRM</option>
                    <option value="Operations">Operations</option>
                    <option value="Quality & SOP">Quality & SOP</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inspect Lot EXO-2026-92 cold-chain stability"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 rounded-xl text-xs text-muted-foreground">
                  Cancel
                </button>
                <button type="submit" className="chip-gold px-4 py-2 text-xs font-semibold">
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: FULL TASK DETAILS & STEP-BY-STEP SOP CHECKLIST */}
        {/* ================================================================== */}
        {selectedTaskDetail && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="card-elevated max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 bg-neutral-950 border border-gold/40 shadow-2xl animate-scale-in">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border/80 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        selectedTaskDetail.priority === "Urgent"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-gold/20 text-gold border border-gold/30"
                      }`}
                    >
                      {selectedTaskDetail.priority} Priority
                    </span>
                    {selectedTaskDetail.sopCode && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                        {selectedTaskDetail.sopCode}
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {selectedTaskDetail.category}
                    </span>
                    {selectedTaskDetail.branch && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                        {selectedTaskDetail.branch}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                    {selectedTaskDetail.taskTitle}
                  </h2>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Assigned to: <strong className="text-foreground">{selectedTaskDetail.staffName}</strong> ({selectedTaskDetail.role}) · Due: <strong className="text-gold">{selectedTaskDetail.dueTime}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTaskDetail(null)}
                  className="h-8 w-8 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scope & Task Details */}
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-gold tracking-wider">
                  Full Technical Instructions & Clinical Scope
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedTaskDetail.taskDetails}
                </p>
                {selectedTaskDetail.notes && (
                  <div className="p-3 rounded-xl bg-background/60 border border-white/5 text-[11px] text-amber-300 italic">
                    <strong>Operational Note:</strong> {selectedTaskDetail.notes}
                  </div>
                )}
              </div>

              {/* Step-by-Step SOP Checklist */}
              {selectedTaskDetail.checklist && selectedTaskDetail.checklist.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4 text-gold" />
                      <span>Step-by-Step SOP Checklist Steps:</span>
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {selectedTaskDetail.checklist.filter((c) => c.done).length} / {selectedTaskDetail.checklist.length} Complete
                    </span>
                  </div>

                  <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/50">
                    {selectedTaskDetail.checklist.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => handleToggleChecklistStep(selectedTaskDetail.id, step.id)}
                        className={`p-3.5 flex items-center gap-3 cursor-pointer transition ${
                          step.done ? "bg-emerald-500/10" : "hover:bg-secondary/40"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center border transition ${
                            step.done
                              ? "bg-emerald-500 text-black border-emerald-400 font-bold"
                              : "border-border text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span
                          className={`text-xs select-none ${
                            step.done ? "line-through text-muted-foreground" : "text-foreground font-medium"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Protocol Box */}
              {selectedTaskDetail.verificationProtocol && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Mandatory Verification & Compliance Protocol</span>
                  </div>
                  <div className="text-muted-foreground">
                    {selectedTaskDetail.verificationProtocol}
                  </div>
                </div>
              )}

              {/* Action Buttons & Status Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  {[
                    { key: "pending", label: "Pending" },
                    { key: "in_progress", label: "In Progress" },
                    { key: "completed", label: "Completed" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => {
                        const updated = { ...selectedTaskDetail, status: s.key as any };
                        setSelectedTaskDetail(updated);
                        setTasksList(tasksList.map((t) => (t.id === updated.id ? updated : t)));
                        toast.success(`Task marked as ${s.label}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                        selectedTaskDetail.status === s.key
                          ? "bg-gold text-black font-bold shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 justify-end flex-wrap">
                  <button
                    onClick={() => {
                      const staffObj = staffList.find((s) => s.name === selectedTaskDetail.staffName);
                      setGmailModal({
                        open: true,
                        recipientName: selectedTaskDetail.staffName,
                        recipientEmail: `${selectedTaskDetail.staffName.toLowerCase().replace(/[^a-z0-9]/g, "")}@esb-aesthetics.ng`,
                        recipientPhone: staffObj?.phone,
                        department: selectedTaskDetail.category,
                        subject: `Official SOP Protocol Directive: ${selectedTaskDetail.taskTitle} [${selectedTaskDetail.sopCode || "ESB-SOP"}]`,
                        message: `Dear ${selectedTaskDetail.staffName},\n\nPlease find the authorized procedural directive below:\n\n• Task: ${selectedTaskDetail.taskTitle}\n• Role: ${selectedTaskDetail.role}\n• Branch: ${selectedTaskDetail.branch || "Port Harcourt / Abuja"}\n• Priority: ${selectedTaskDetail.priority}\n• SOP Code: ${selectedTaskDetail.sopCode || "N/A"}\n• Due: ${selectedTaskDetail.dueTime}\n\nTask Details:\n${selectedTaskDetail.taskDetails}\n\nMandatory Verification Protocol:\n${selectedTaskDetail.verificationProtocol || "Verify in system"}\n\nNotes:\n${selectedTaskDetail.notes || "None"}\n\nPlease complete all checklist items promptly.\n\nWarm regards,\nManagement Operations Desk\nESB Brand Suite`,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Dispatch to Gmail</span>
                  </button>

                  <button
                    onClick={() => {
                      toast.success("Task SOP work order printed!");
                      window.print();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition flex items-center gap-1.5"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Work Order</span>
                  </button>

                  <button
                    onClick={() => setSelectedTaskDetail(null)}
                    className="chip-gold px-4 py-2 text-xs font-semibold"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Staff/Client Gmail Modal */}
        <SendClientGmailModal
          open={gmailModal.open}
          onOpenChange={(open) => setGmailModal((prev) => ({ ...prev, open }))}
          clientName={gmailModal.recipientName}
          clientEmail={gmailModal.recipientEmail}
          clientPhone={gmailModal.recipientPhone}
          brand="ESB Group Management Operations"
          defaultSubject={gmailModal.subject}
          defaultMessage={gmailModal.message}
          contextType="general"
        />
      </div>
    </Shell>
  );
}
