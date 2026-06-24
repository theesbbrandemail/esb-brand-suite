import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/esb/Shell";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAppointments, listBranches, createAppointment, updateAppointmentStatus,
  listFollowUps, markFollowUpSent, type Appointment,
} from "@/lib/ops.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays, Plus, Phone, MessageCircle, CheckCircle2, XCircle, Clock, Radio, MapPin, Sparkles,
} from "lucide-react";
import { format, isSameDay } from "date-fns";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — ESB Brand" },
      { name: "description", content: "Patient scheduling and automated WhatsApp follow-ups across all ESB branches with real-time sync." },
    ],
  }),
  component: AppointmentsPage,
});

const WA = (phone: string, msg: string) =>
  `https://wa.me/${phone.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(msg)}`;

function AppointmentsPage() {
  const qc = useQueryClient();
  const branchesFn = useServerFn(listBranches);
  const apptsFn = useServerFn(listAppointments);
  const followFn = useServerFn(listFollowUps);
  const createFn = useServerFn(createAppointment);
  const updateStatusFn = useServerFn(updateAppointmentStatus);
  const markSentFn = useServerFn(markFollowUpSent);

  const [branchId, setBranchId] = useState<string | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [pulse, setPulse] = useState(false);

  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const apptsQ = useQuery({
    queryKey: ["appointments", branchId ?? "all"],
    queryFn: () => apptsFn({ data: { branchId } }),
  });
  const followQ = useQuery({ queryKey: ["follow-ups"], queryFn: () => followFn() });

  useEffect(() => {
    const ch = supabase
      .channel("appts-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        setPulse(true);
        qc.invalidateQueries({ queryKey: ["appointments"] });
        setTimeout(() => setPulse(false), 800);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => {
        qc.invalidateQueries({ queryKey: ["follow-ups"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "confirmed" | "completed" | "cancelled" }) =>
      updateStatusFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const markSent = useMutation({
    mutationFn: (id: string) => markSentFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["follow-ups"] }),
  });

  const dayAppts = useMemo(
    () => (apptsQ.data ?? []).filter((a) => isSameDay(new Date(a.scheduled_at), date)),
    [apptsQ.data, date],
  );
  const week = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i - 0);
      return d;
    });
  }, []);

  const pendingFollowUps = (followQ.data ?? []).filter((f) => f.status === "pending");

  return (
    <Shell>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] gold-text">Patient Scheduling</div>
            <h1 className="text-3xl font-display font-semibold mt-1">
              <span className="gold-text">Appointments</span> & Follow-ups
            </h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Radio className={`h-3 w-3 text-success ${pulse ? "animate-pulse" : ""}`} />
              Live cross-branch sync · {apptsQ.data?.length ?? 0} upcoming
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value || undefined)}
              className="px-3 py-2 rounded-full bg-card border border-border text-sm"
            >
              <option value="">All branches</option>
              {(branchesQ.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button onClick={() => setShowForm((s) => !s)} className="chip-gold inline-flex items-center gap-1.5 px-3 py-2">
              <Plus className="h-3.5 w-3.5" /> New booking
            </button>
          </div>
        </div>

        {showForm && (
          <BookingForm
            branches={branchesQ.data ?? []}
            onClose={() => setShowForm(false)}
            onSubmit={async (v) => {
              await createFn({ data: v });
              qc.invalidateQueries({ queryKey: ["appointments"] });
              qc.invalidateQueries({ queryKey: ["follow-ups"] });
              setShowForm(false);
            }}
          />
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg">{format(date, "EEEE, MMM d")}</h2>
              <span className="text-xs text-muted-foreground">{dayAppts.length} appointment{dayAppts.length === 1 ? "" : "s"}</span>
            </div>

            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {week.map((d) => {
                const active = isSameDay(d, date);
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDate(d)}
                    className={`flex flex-col items-center justify-center min-w-[52px] py-2 rounded-xl border transition ${active ? "bg-gold text-gold-foreground border-transparent font-semibold" : "border-border text-muted-foreground hover:border-gold/40"}`}
                  >
                    <span className="text-[9px] uppercase">{format(d, "EEE")}</span>
                    <span className="text-base">{format(d, "d")}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {apptsQ.isLoading && <div className="text-sm text-muted-foreground p-6 text-center">Loading…</div>}
              {!apptsQ.isLoading && dayAppts.length === 0 && (
                <div className="text-sm text-muted-foreground p-6 text-center border border-dashed border-border rounded-2xl">
                  No appointments on this day.
                </div>
              )}
              {dayAppts.map((a) => (
                <ApptCard
                  key={a.id}
                  appt={a}
                  onStatus={(status) => setStatus.mutate({ id: a.id, status })}
                />
              ))}
            </div>
          </div>

          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" />
                <h2 className="font-display text-lg">Follow-up Queue</h2>
              </div>
              <span className="chip-violet">{pendingFollowUps.length} pending</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Auto-scheduled 24h after each appointment. Tap WhatsApp to send.
            </p>
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {followQ.isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
              {!followQ.isLoading && pendingFollowUps.length === 0 && (
                <div className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary/30 border border-border/40">
                  No pending follow-ups.
                </div>
              )}
              {pendingFollowUps.map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium truncate">{f.patient_name}</div>
                    <span className="text-[10px] gold-text">{format(new Date(f.scheduled_at), "MMM d, p")}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2">{f.message}</p>
                  <div className="flex gap-1.5">
                    {f.patient_phone && (
                      <a
                        href={WA(f.patient_phone, f.message)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => markSent.mutate(f.id)}
                        className="flex-1 text-[11px] inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[oklch(0.65_0.18_145)]/15 border border-[oklch(0.65_0.18_145)]/40 text-[oklch(0.75_0.18_145)] hover:bg-[oklch(0.65_0.18_145)]/25"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => markSent.mutate(f.id)}
                      className="text-[11px] inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border hover:bg-secondary"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ApptCard({ appt, onStatus }: {
  appt: Appointment;
  onStatus: (s: "confirmed" | "completed" | "cancelled") => void;
}) {
  const time = format(new Date(appt.scheduled_at), "p");
  const statusColor =
    appt.status === "completed" ? "text-success border-success/40 bg-success/10"
      : appt.status === "cancelled" ? "text-danger border-danger/40 bg-danger/10"
      : appt.status === "confirmed" ? "text-gold border-gold/40 bg-gold/10"
      : "text-muted-foreground border-border bg-secondary";

  return (
    <div className="p-4 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="text-sm font-medium">{appt.patient_name}</div>
          <div className="text-[11px] text-muted-foreground">{appt.service}</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{time}</span>
            {appt.branch && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{appt.branch.name}</span>
            )}
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusColor}`}>
          {appt.status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {appt.patient_phone && (
          <a href={`tel:${appt.patient_phone}`} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-border hover:bg-card">
            <Phone className="h-3 w-3" /> Call
          </a>
        )}
        {appt.patient_phone && (
          <a
            href={WA(appt.patient_phone, `Hi ${appt.patient_name}, this is ESB Brand confirming your ${appt.service} appointment at ${time}.`)}
            target="_blank" rel="noreferrer"
            className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[oklch(0.65_0.18_145)]/15 border border-[oklch(0.65_0.18_145)]/40 text-[oklch(0.75_0.18_145)]"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </a>
        )}
        {appt.status !== "confirmed" && appt.status !== "completed" && (
          <button onClick={() => onStatus("confirmed")} className="text-[11px] chip-gold px-2 py-1">Confirm</button>
        )}
        {appt.status !== "completed" && (
          <button onClick={() => onStatus("completed")} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-success/40 text-success">
            <CheckCircle2 className="h-3 w-3" /> Complete
          </button>
        )}
        {appt.status !== "cancelled" && (
          <button onClick={() => onStatus("cancelled")} className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-danger/40 text-danger">
            <XCircle className="h-3 w-3" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function BookingForm({
  branches, onClose, onSubmit,
}: {
  branches: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (v: {
    branch_id: string; patient_name: string; patient_phone?: string; patient_email?: string;
    service: string; scheduled_at: string; duration_minutes: number; notes?: string;
  }) => Promise<void>;
}) {
  const [branch, setBranch] = useState(branches[0]?.id ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Skin Consultation");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const valid = branch && name.trim().length > 1 && service.trim().length > 1 && when;

  return (
    <div className="card-elevated p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-lg flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gold" /> New booking
        </h3>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Branch">
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm">
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="Service">
          <input value={service} onChange={(e) => setService(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </Field>
        <Field label="Patient name">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </Field>
        <Field label="WhatsApp / phone (incl. country)">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </Field>
        <Field label="When">
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </Field>
        <Field label="Duration (min)">
          <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} className="w-full px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </Field>
      </div>
      <button
        disabled={!valid || loading}
        onClick={async () => {
          setLoading(true);
          try {
            await onSubmit({
              branch_id: branch,
              patient_name: name.trim(),
              patient_phone: phone.trim() || undefined,
              service: service.trim(),
              scheduled_at: new Date(when).toISOString(),
              duration_minutes: duration,
            });
          } finally { setLoading(false); }
        }}
        className="chip-gold mt-4 w-full py-2 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Book + auto-schedule follow-up"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
