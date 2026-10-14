import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Stethoscope, Syringe, HeartPulse, Clock, AlertTriangle, CheckCircle2,
  UserCheck, ShieldCheck, FileText, Plus, ChevronRight, Sparkles,
  Search, Eye, Activity, BedDouble, Thermometer, Pill, Check, X,
  ThermometerSnowflake, AlertOctagon, HelpCircle, Send, ArrowRight
} from "lucide-react";
import { Shell } from "@/components/esb/Shell";
import { formatNaira } from "@/lib/currency";
import {
  SEED_PRODUCT_COMPLAINTS,
  SEED_CUSTOMER_QUESTIONS,
  type ProductComplaintRecord,
  type CustomerQuestionReferral,
} from "@/lib/sales-intelligence";

export const Route = createFileRoute("/clinical")({
  head: () => ({
    meta: [
      { title: "Clinical & Professional Workspaces — ESB Brand" },
      {
        name: "description",
        content:
          "Role-specific professional workspaces for Aesthetic Nurse, Doctor, and Pharmacist with clinical queues, batch oversight, and safety escalations.",
      },
    ],
  }),
  component: ClinicalSuitePage,
});

type ProfessionalRole = "doctor" | "nurse" | "pharmacist" | "queue";

interface ClinicalPatient {
  id: string;
  name: string;
  age: number;
  phone: string;
  room: string;
  procedure: string;
  doctor: string;
  nurse: string;
  scheduledTime: string;
  status: "Checked In" | "Numbing in Progress" | "In Procedure" | "Post-Care Cooling" | "Discharged";
  numbingStartTime?: string;
  numbingElapsedMinutes?: number;
  allergies: string[];
  contraindications: string;
  vitals: { bp: string; pulse: string; temp: string };
  skinNotes: string;
  doctorInstructions: string;
  batchUsed?: string;
  consentSigned: boolean;
}

const INITIAL_QUEUE: ClinicalPatient[] = [
  {
    id: "cl-1",
    name: "Dr. Amara Okonjo",
    age: 38,
    phone: "+2348023341122",
    room: "Suite A (VIP Laser)",
    procedure: "Glycolic 20% Peeling + Hydra-Glow",
    doctor: "Dr. Ngozi Eze",
    nurse: "Nurse Amina Bello",
    scheduledTime: "09:30 AM",
    status: "Numbing in Progress",
    numbingStartTime: "09:10 AM",
    numbingElapsedMinutes: 25,
    allergies: ["Fragrance oils", "Strong Salicylic Acid"],
    contraindications: "No oral retinoids in past 6 months. Fitzpatrick Type IV.",
    vitals: { bp: "118/76", pulse: "72 bpm", temp: "36.6 °C" },
    skinNotes: "Combination / Mild Erythema on cheeks. Target hyperpigmentation around jawline.",
    doctorInstructions: "Neutralize glycolic peel at 3.5 minutes. Follow with chilled exosome barrier mist.",
    batchUsed: "LOT-GLY-2026-08",
    consentSigned: true,
  },
  {
    id: "cl-2",
    name: "Senator Fatima Aliyu",
    age: 52,
    phone: "+2348091118899",
    room: "Executive Aesthetics Suite 1",
    procedure: "Exosome Microneedling & RF Tightening",
    doctor: "Dr. Tariq Bello",
    nurse: "Nurse Amina Bello",
    scheduledTime: "10:15 AM",
    status: "In Procedure",
    numbingStartTime: "09:30 AM",
    numbingElapsedMinutes: 45,
    allergies: ["None reported"],
    contraindications: "No metal implants in facial area. Safe for RF energy.",
    vitals: { bp: "124/82", pulse: "68 bpm", temp: "36.5 °C" },
    skinNotes: "Mature skin with fine peri-orbital lines and laxity. Excellent barrier recovery.",
    doctorInstructions: "RF depth set to 1.5mm cheeks, 0.8mm forehead. Infuse 5ml Exosome suspension.",
    batchUsed: "LOT-EXO-2026-92",
    consentSigned: true,
  },
  {
    id: "cl-3",
    name: "Chinedu Eke",
    age: 31,
    phone: "+2348189987766",
    room: "Procedure Room 2",
    procedure: "Active Acne Clarifying & LED Blue Light",
    doctor: "Dr. Ngozi Eze",
    nurse: "Nurse Blessing",
    scheduledTime: "11:00 AM",
    status: "Checked In",
    allergies: ["Benzoyl peroxide rash"],
    contraindications: "Sun exposure 2 days ago; avoid aggressive manual extractions.",
    vitals: { bp: "120/80", pulse: "75 bpm", temp: "36.7 °C" },
    skinNotes: "Active papules on chin and temples. Mild sebum overproduction.",
    doctorInstructions: "Gentle salicylic 2% spot prep only. 20 min blue LED phototherapy session.",
    batchUsed: "LOT-LED-ACN-04",
    consentSigned: true,
  },
  {
    id: "cl-4",
    name: "Hauwa Bello",
    age: 29,
    phone: "+2348035552345",
    room: "Dental Cosmetic Suite",
    procedure: "Laser Whitening & Gum Barrier Cure",
    doctor: "Dr. Tariq Bello",
    nurse: "Nurse Blessing",
    scheduledTime: "11:30 AM",
    status: "Checked In",
    allergies: ["Latex"],
    contraindications: "Use nitrile gloves only. Mild dentin hypersensitivity.",
    vitals: { bp: "112/74", pulse: "70 bpm", temp: "36.4 °C" },
    skinNotes: "Oral soft tissue healthy. Shade Vita B2 targeting A1.",
    doctorInstructions: "Apply potassium nitrate desensitizing gel prior to laser exposure.",
    batchUsed: "LOT-DENT-WHT-11",
    consentSigned: true,
  },
];

interface NurseChecklistTask {
  id: string;
  category: "Readiness" | "Consent" | "Monitoring" | "Safety";
  title: string;
  details: string;
  completed: boolean;
  assignedPatient?: string;
}

const INITIAL_NURSE_CHECKLIST: NurseChecklistTask[] = [
  { id: "nc-1", category: "Readiness", title: "Sterilize Suite A laser handpieces & UV sanitization", details: "Autoclave cycle #44 verified with temperature strip.", completed: true },
  { id: "nc-2", category: "Readiness", title: "Reconstitute Exosome 5ml suspension on cold ice block", details: "Lot EXO-2026-92 cold-chain verified by Pharmacist Emeka.", completed: true, assignedPatient: "Senator Fatima Aliyu" },
  { id: "nc-3", category: "Consent", title: "Verify informed consent signature & Fitzpatrick score", details: "Fitzpatrick IV verified. No photosensitivity medications.", completed: true, assignedPatient: "Dr. Amara Okonjo" },
  { id: "nc-4", category: "Monitoring", title: "Numbing timer check: 25 mins elapsed for Dr. Amara", details: "Topical Lidocaine 10.56% checked. Mild skin erythema monitored.", completed: false, assignedPatient: "Dr. Amara Okonjo" },
  { id: "nc-5", category: "Safety", title: "Post-peel soothing & barrier cooling mist application", details: "Prepare sterile cold packs and exosome mist for Suite A.", completed: false, assignedPatient: "Dr. Amara Okonjo" },
];

interface PharmacyColdChainRecord {
  facility: string;
  currentTemp: number; // in °C
  minTemp: number;
  maxTemp: number;
  status: "Optimal" | "Warning" | "Critical";
  itemsCount: number;
  lastChecked: string;
}

const COLD_CHAIN_RECORDS: PharmacyColdChainRecord[] = [
  { facility: "Sterile Lab Refrigerator 01 (Port Harcourt Flagship)", currentTemp: 3.8, minTemp: 2.0, maxTemp: 8.0, status: "Optimal", itemsCount: 142, lastChecked: "12 mins ago" },
  { facility: "Clinical Aesthetics Vaccine/Peel Refrigerator (Abuja)", currentTemp: 4.5, minTemp: 2.0, maxTemp: 8.0, status: "Optimal", itemsCount: 88, lastChecked: "18 mins ago" },
  { facility: "Active Formulation Cold Unit (Port Harcourt Depot)", currentTemp: 4.1, minTemp: 2.0, maxTemp: 8.0, status: "Optimal", itemsCount: 65, lastChecked: "25 mins ago" },
];

function ClinicalSuitePage() {
  const [activeRole, setActiveRole] = useState<ProfessionalRole>("nurse");
  const [queue, setQueue] = useState<ClinicalPatient[]>(INITIAL_QUEUE);
  const [nurseTasks, setNurseTasks] = useState<NurseChecklistTask[]>(INITIAL_NURSE_CHECKLIST);
  const [selectedPatient, setSelectedPatient] = useState<ClinicalPatient | null>(INITIAL_QUEUE[0]);
  const [showChartModal, setShowChartModal] = useState(false);
  const [newDoctorNote, setNewDoctorNote] = useState("");
  const [safetyEscalationOpen, setSafetyEscalationOpen] = useState(false);
  const [escalationDesc, setEscalationDesc] = useState("");

  const handleUpdateStatus = (patientId: string, status: ClinicalPatient["status"]) => {
    setQueue(queue.map((p) => (p.id === patientId ? { ...p, status } : p)));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient({ ...selectedPatient, status });
    }
    toast.success(`Patient status updated to ${status}`);
  };

  const handleToggleNurseTask = (taskId: string) => {
    setNurseTasks(
      nurseTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    toast.success("Nurse clinical checklist task updated");
  };

  const handleSaveDoctorInstruction = () => {
    if (!newDoctorNote.trim() || !selectedPatient) return;
    const updated = {
      ...selectedPatient,
      doctorInstructions: `${selectedPatient.doctorInstructions} | [Dr Note ${new Date().toLocaleTimeString()}]: ${newDoctorNote.trim()}`,
    };
    setSelectedPatient(updated);
    setQueue(queue.map((p) => (p.id === updated.id ? updated : p)));
    setNewDoctorNote("");
    setShowChartModal(false);
    toast.success("Doctor clinical order updated & synced to nurse tasklist");
  };

  const handleTriggerSafetyEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationDesc.trim()) return;
    toast.error("URGENT SAFETY ESCALATION BROADCASTED!", {
      description: `Alert sent to Lead Dermatologist Dr. Ngozi Eze & Chief Pharmacist Emeka Obi. Case: ${selectedPatient?.name}`,
    });
    setSafetyEscalationOpen(false);
    setEscalationDesc("");
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ================================================================== */}
        {/* HEADER & ROLE WORKSPACE SWITCHER */}
        {/* ================================================================== */}
        <div className="p-6 rounded-3xl bg-secondary/30 border border-gold/30 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gold uppercase tracking-wider mb-1 font-semibold">
              <HeartPulse className="h-4 w-4" /> ESB Clinical & Professional Workspace Architecture
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Clinical & Professional Operations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl">
              Strict professional demarcation: Reception owns booking, Sales owns conversion, and qualified Clinicians & Pharmacists retain professional authority.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="flex bg-background rounded-2xl p-1 border border-border text-xs flex-wrap">
            <button
              onClick={() => setActiveRole("nurse")}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeRole === "nurse"
                  ? "bg-gold text-black shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Syringe className="h-3.5 w-3.5" />
              <span>Aesthetic Nurse</span>
            </button>
            <button
              onClick={() => setActiveRole("doctor")}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeRole === "doctor"
                  ? "bg-gold text-black shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Doctor's Clinic</span>
            </button>
            <button
              onClick={() => setActiveRole("pharmacist")}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeRole === "pharmacist"
                  ? "bg-gold text-black shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pill className="h-3.5 w-3.5" />
              <span>Pharmacist Workspace</span>
            </button>
            <button
              onClick={() => setActiveRole("queue")}
              className={`px-3 sm:px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                activeRole === "queue"
                  ? "bg-gold text-black shadow-md font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BedDouble className="h-3.5 w-3.5" />
              <span>Patient Queue</span>
            </button>
          </div>
        </div>

        {/* ================================================================== */}
        {/* WORKSPACE 1: AESTHETIC NURSE WORKSPACE */}
        {/* ================================================================== */}
        {activeRole === "nurse" && (
          <div className="space-y-6 animate-fade-in">
            {/* Top KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Assigned Nurse</div>
                <div className="text-base font-bold text-foreground mt-0.5">Nurse Amina Bello</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Senior Aesthetic RN • On Duty</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Pre-Procedure Readied</div>
                <div className="text-xl font-bold text-foreground mt-0.5">4 of 4 Patients</div>
                <div className="text-[10px] text-gold mt-0.5">Consents & allergy checks complete</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Active Numbing Timer</div>
                <div className="text-xl font-bold text-amber-300 mt-0.5 font-mono">25m Elapsed</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Dr. Amara (Room Suite A)</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Safety Incidents</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5">0 Escalations</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Infection SOP compliance 100%</div>
              </div>
            </div>

            {/* Nurse's Clinical Worklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task Checklist */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Syringe className="h-4 w-4 text-gold" />
                      <span>Nurse Clinical Protocols & Preparation Checklist</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Focuses strictly on clinical readiness, observation, and batch logging — no sales pressure.</p>
                  </div>
                  <button
                    onClick={() => setSafetyEscalationOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition flex items-center gap-1.5"
                  >
                    <AlertOctagon className="h-3.5 w-3.5" />
                    <span>Report Adverse Reaction</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {nurseTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleNurseTask(task.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        task.completed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                          : "bg-[#1C172E] border-white/5 text-foreground hover:border-gold/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
                            task.completed ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-gold"
                          }`}>
                            {task.category}
                          </span>
                          <span className="font-bold text-xs">{task.title}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{task.details}</div>
                        {task.assignedPatient && (
                          <div className="text-[10px] text-gold font-medium">Patient: {task.assignedPatient}</div>
                        )}
                      </div>

                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${
                        task.completed ? "bg-emerald-500 text-black border-emerald-400" : "border-white/20 text-transparent"
                      }`}>
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient In Room Quick Observation */}
              <div className="card-elevated p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-bold text-sm text-foreground">Current Patient In Room</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono font-bold">
                    SUITE A
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="text-base font-bold text-foreground">Dr. Amara Okonjo (38)</div>
                    <div className="text-muted-foreground">Glycolic 20% Peeling + Hydra-Glow</div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/60 space-y-1.5 border border-white/5">
                    <div className="text-[10px] text-gold uppercase font-bold">Observed Vitals</div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                      <div>BP: <strong className="text-foreground">118/76</strong></div>
                      <div>Pulse: <strong className="text-foreground">72 bpm</strong></div>
                      <div>Temp: <strong className="text-foreground">36.6 °C</strong></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] space-y-1">
                    <div className="font-bold uppercase text-[10px]">Allergies & Contraindications:</div>
                    <div>Fragrance oils, strong Salicylic acid. Fitzpatrick Type IV.</div>
                  </div>

                  <div className="p-3 rounded-xl bg-background/60 space-y-1 border border-white/5 text-[11px]">
                    <div className="text-[10px] text-muted-foreground uppercase">Doctor's Clinical Instructions:</div>
                    <div className="text-foreground">{queue[0].doctorInstructions}</div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus("cl-1", "In Procedure")}
                      className="w-full chip-gold py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Ready for Doctor</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* WORKSPACE 2: DOCTOR'S CLINICAL WORKSPACE */}
        {/* ================================================================== */}
        {activeRole === "doctor" && (
          <div className="space-y-6 animate-fade-in">
            {/* Top KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Attending Clinician</div>
                <div className="text-base font-bold text-foreground mt-0.5">Dr. Ngozi Eze</div>
                <div className="text-[10px] text-gold mt-0.5">Consultant Dermatologist • Session Active</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Consultations Today</div>
                <div className="text-xl font-bold text-foreground mt-0.5 font-mono">6 Scheduled</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">2 Completed • 1 In Procedure</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Clinical Reviews Due</div>
                <div className="text-xl font-bold text-cyan-400 mt-0.5 font-mono">3 Reviews</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Post-procedure day-7 checks</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Open Clinical Escalations</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">0 Incidents</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Zero severe reactions logged</div>
              </div>
            </div>

            {/* Doctor's Consultations & Procedure Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-gold" />
                      <span>Doctor Consultations & Procedure Oversight</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Prioritizes medical assessment, informed consent, device parameters, and clinical safety.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {queue.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => setSelectedPatient(pt)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedPatient?.id === pt.id
                          ? "bg-[#1F1936] border-gold shadow-lg"
                          : "bg-[#1C172E] border-white/5 hover:border-gold/30"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{pt.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {pt.room}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-mono font-bold">
                            {pt.status}
                          </span>
                        </div>
                        <div className="text-xs text-gold font-medium">{pt.procedure}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Allergies: <strong className="text-rose-400">{pt.allergies.join(", ")}</strong> • Batch: {pt.batchUsed}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(pt);
                            setShowChartModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border text-foreground flex items-center gap-1"
                        >
                          <FileText className="h-3.5 w-3.5 text-gold" />
                          <span>Update Chart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Patient Clinical Chart Viewer */}
              {selectedPatient && (
                <div className="card-elevated p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] uppercase tracking-wider text-gold font-bold">Clinical Record</span>
                    <h4 className="text-base font-bold text-foreground mt-0.5">{selectedPatient.name}</h4>
                    <div className="text-xs text-muted-foreground">{selectedPatient.procedure}</div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-background/60 space-y-1 border border-white/5">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Contraindications</div>
                      <div className="text-amber-200">{selectedPatient.contraindications}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-background/60 space-y-1 border border-white/5">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold">Skin Analysis Notes</div>
                      <div className="text-foreground leading-relaxed">{selectedPatient.skinNotes}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-background/60 space-y-1 border border-white/5">
                      <div className="text-[10px] text-gold uppercase font-bold">Doctor Orders & Instructions</div>
                      <div className="text-foreground leading-relaxed">{selectedPatient.doctorInstructions}</div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedPatient.id, "Post-Care Cooling")}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border text-foreground"
                      >
                        Complete Procedure
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedPatient.id, "Discharged")}
                        className="w-full chip-gold py-2 text-xs font-semibold"
                      >
                        Discharge Patient
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* WORKSPACE 3: PHARMACIST PROFESSIONAL WORKSPACE */}
        {/* ================================================================== */}
        {activeRole === "pharmacist" && (
          <div className="space-y-6 animate-fade-in">
            {/* Top KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Chief Pharmacist</div>
                <div className="text-base font-bold text-foreground mt-0.5">Pharm. Emeka Obi</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Sterile Lab & Quality Lead • On Duty</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Cold-Chain Units</div>
                <div className="text-xl font-bold text-foreground mt-0.5 font-mono">3 Fridges Optimal</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">Avg 4.1°C • Temperature logged</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Referred Questions</div>
                <div className="text-xl font-bold text-gold mt-0.5 font-mono">
                  {SEED_CUSTOMER_QUESTIONS.filter((q) => q.referredTo === "Pharmacist").length} Active Inquiries
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">From Sales & WhatsApp</div>
              </div>
              <div className="card-elevated p-4 rounded-2xl border border-white/10">
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Quarantine & Recalls</div>
                <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">0 Batches Flagged</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">NAFDAC certificates verified</div>
              </div>
            </div>

            {/* Cold Chain Storage & Quality Checks */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <ThermometerSnowflake className="h-4 w-4 text-cyan-400" />
                  <span>Cold-Chain Storage & Active Formulation Quality Oversight</span>
                </h3>
                <span className="text-xs text-muted-foreground font-mono">Continuous Sensor Telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {COLD_CHAIN_RECORDS.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#1C172E] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{rec.facility}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        {rec.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-cyan-300">{rec.currentTemp}°C</span>
                      <span className="text-[10px] text-muted-foreground">Range: {rec.minTemp}°C – {rec.maxTemp}°C</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex justify-between pt-1 border-t border-white/5">
                      <span>{rec.itemsCount} stored vials</span>
                      <span>Checked {rec.lastChecked}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Product Questions Referred to Pharmacist */}
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-gold" />
                  <span>Clinical & Pharmaceutical Questions Referred From Sales Desk</span>
                </h4>
                <span className="text-xs text-gold font-mono">Approved Guidance Queue</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sales staff must not guess answers to drug compatibility or active formulation queries. Pharmacist prepares approved, evidence-based guidance.
              </p>

              <div className="space-y-3 pt-2">
                {SEED_CUSTOMER_QUESTIONS.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-[#1C172E] border border-white/5 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-foreground text-sm">"{q.question}"</div>
                        <div className="text-[11px] text-muted-foreground">
                          Inquiry regarding: <strong className="text-gold">{q.productOrService}</strong> • Client: {q.customerName}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-cyan-300 font-mono shrink-0">
                        Assigned to {q.referredTo}
                      </span>
                    </div>

                    {q.approvedResponse && (
                      <div className="p-3 rounded-xl bg-background/80 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed">
                        <strong className="text-white block text-[10px] uppercase font-bold">Approved Pharmacist Response:</strong>
                        {q.approvedResponse}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-white/5">
                      <span>Asked {q.timesAsked} times</span>
                      <span>Action: {q.furtherActionRequired}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* WORKSPACE 4: PATIENT QUEUE OVERVIEW */}
        {/* ================================================================== */}
        {activeRole === "queue" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/10 bg-[#161224]/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-foreground">Live Clinical Room Allocations & Flow</h3>
                  <p className="text-xs text-muted-foreground">All treatment rooms across Port Harcourt Flagship & Abuja Clinics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {queue.map((pt) => (
                  <div key={pt.id} className="card-elevated p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {pt.room}
                      </span>
                      <span className="text-[10px] font-bold text-gold">{pt.scheduledTime}</span>
                    </div>

                    <div className="pt-1">
                      <div className="font-bold text-sm text-foreground">{pt.name}</div>
                      <div className="text-xs text-gold font-medium mt-0.5">{pt.procedure}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-background/60 text-[11px] text-muted-foreground space-y-0.5">
                      <div>Doctor: <strong className="text-foreground">{pt.doctor}</strong></div>
                      <div>Nurse: <strong className="text-foreground">{pt.nurse}</strong></div>
                    </div>

                    <div className="pt-2">
                      <span className="block text-center text-xs px-2.5 py-1 rounded-xl bg-gold/20 text-gold font-bold">
                        {pt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: DOCTOR CHART NOTE UPDATE */}
        {/* ================================================================== */}
        {showChartModal && selectedPatient && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-gold" />
                  <span>Update Doctor Clinical Chart: {selectedPatient.name}</span>
                </h3>
                <button onClick={() => setShowChartModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Current Procedure & Protocol</label>
                  <div className="font-bold text-foreground text-sm mt-0.5">{selectedPatient.procedure}</div>
                </div>

                <div>
                  <label className="text-muted-foreground">Doctor Orders / Technical Instructions</label>
                  <textarea
                    rows={4}
                    placeholder="Enter clinical instructions, depth, neutralization time, or post-procedure recovery prescriptions..."
                    value={newDoctorNote}
                    onChange={(e) => setNewDoctorNote(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary border border-border text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowChartModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDoctorInstruction}
                  className="chip-gold px-4 py-2 text-xs font-semibold"
                >
                  Save & Notify Nurse
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODAL: URGENT ADVERSE REACTION SAFETY ESCALATION */}
        {/* ================================================================== */}
        {safetyEscalationOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleTriggerSafetyEscalation}
              className="card-elevated max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-rose-500 animate-scale-in bg-[#150D18]"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertOctagon className="h-5 w-5 text-rose-500 animate-pulse" />
                <span>CRITICAL SAFETY ESCALATION PROTOCOL</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Immediate notification dispatched to Lead Dermatologist, Pharmacist, and Branch Operations Manager. Sales staff and reception are notified to hold related batch products.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground">Patient / Client Name</label>
                  <input
                    type="text"
                    required
                    defaultValue={selectedPatient?.name || "Dr. Amara Okonjo"}
                    className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground">Nature of Adverse Reaction / Quality Incident</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe symptoms, erythema grade, pain, suspected product batch..."
                    value={escalationDesc}
                    onChange={(e) => setEscalationDesc(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-secondary border border-border text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSafetyEscalationOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-muted-foreground"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg">
                  Broadcast Urgent Alert
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}
