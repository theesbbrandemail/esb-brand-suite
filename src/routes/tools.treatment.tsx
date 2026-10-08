import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { ToolWorkspace } from "@/components/esb/ToolWorkspace";
import { listAppointments } from "@/lib/ops.functions";
import { runOpsTool } from "@/lib/tools.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tools/treatment")({
  head: () => ({
    meta: [
      { title: "Treatment Plan & Aftercare AI — ESB Brand" },
      { name: "description", content: "Generate treatment plans and patient aftercare instructions from any ESB booking." },
      { property: "og:title", content: "Treatment Plan & Aftercare AI — ESB Brand" },
      { property: "og:description", content: "AI-written treatment plans and aftercare for ESB clinic bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TreatmentTool,
});

function TreatmentTool() {
  const list = useServerFn(listAppointments);
  const run = useServerFn(runOpsTool);
  const qc = useQueryClient();
  const from = new Date(Date.now() - 14 * 864e5).toISOString();
  const { data: appts = [] } = useQuery({ queryKey: ["tools", "appts", "treatment"], queryFn: () => list({ data: { from } }) });
  const [id, setId] = useState("");
  const [extra, setExtra] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string>();
  const selected = appts.find((a) => a.id === id);

  async function go() {
    if (!id) { toast.error("Pick a booking first"); return; }
    setRunning(true); setError(undefined); setResult("");
    try {
      const r = await run({ data: { tool: "treatment", appointmentId: id, extra } });
      if (r.error) setError(r.error); else setResult(r.text);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setRunning(false); }
  }

  async function save() {
    const notes = `${selected?.notes ? selected.notes + "\n\n" : ""}--- AI treatment plan (${new Date().toLocaleDateString()}) ---\n${result}`.slice(0, 20000);
    const { error: e } = await supabase.from("appointments").update({ notes }).eq("id", id);
    if (e) toast.error("Couldn't save to the booking", { description: e.message });
    else { toast.success("Saved to booking notes"); qc.invalidateQueries({ queryKey: ["tools", "appts"] }); }
  }

  return (
    <ToolWorkspace
      title="Treatment Plan & Aftercare"
      subtitle="Pick a booking — the AI drafts a treatment plan and patient aftercare. A clinician should review before sharing."
      onRun={go}
      running={running}
      result={result}
      error={error}
      actions={<button onClick={save} className="chip-gold inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"><Save className="h-3.5 w-3.5" /> Save to booking notes</button>}
      controls={
        <>
          <label className="block text-xs text-muted-foreground">
            Booking
            <select value={id} onChange={(e) => setId(e.target.value)} className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground">
              <option value="">Select a booking…</option>
              {appts.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.scheduled_at).toLocaleDateString()} · {a.patient_name} · {a.service}
                </option>
              ))}
            </select>
          </label>
          {appts.length === 0 && <p className="text-xs text-muted-foreground">No bookings from the last 2 weeks or upcoming.</p>}
          <label className="block text-xs text-muted-foreground">
            Clinician notes (optional)
            <textarea value={extra} onChange={(e) => setExtra(e.target.value)} rows={4} maxLength={1000} placeholder="e.g. sensitive skin, on retinoids, prefers minimal downtime" className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground" />
          </label>
        </>
      }
    />
  );
}
