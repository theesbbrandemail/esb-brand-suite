import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Plus, Search, X, Loader2, AlertCircle, PlugZap, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Shell } from "@/components/esb/Shell";
import { useAuth } from "@/lib/auth";
import {
  CRM_MODULES, type CrmModule, type CrmRecord,
  crmStatus, crmList, crmGet, crmSave, crmAddNote, crmFindDuplicates, crmLogs,
} from "@/lib/crm.functions";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM — ESB Brand Suite" },
      { name: "description", content: "Live Zoho CRM leads, contacts, accounts, deals and activities for ESB Brand staff." },
      { property: "og:title", content: "CRM — ESB Brand Suite" },
      { property: "og:description", content: "Staff-only CRM workspace connected to Zoho CRM." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CrmPage,
});

/** Editable fields for create/edit per module (standard Zoho API names). */
const FORM: Record<CrmModule, { key: string; label: string; options?: string[] }[]> = {
  Leads: [
    { key: "First_Name", label: "First name" }, { key: "Last_Name", label: "Last name *" },
    { key: "Email", label: "Email" }, { key: "Phone", label: "Phone" }, { key: "Company", label: "Company" },
    { key: "Lead_Status", label: "Lead status", options: ["Not Contacted", "Attempted to Contact", "Contact in Future", "Contacted", "Junk Lead", "Lost Lead", "Pre-Qualified"] },
  ],
  Contacts: [{ key: "First_Name", label: "First name" }, { key: "Last_Name", label: "Last name *" }, { key: "Email", label: "Email" }, { key: "Phone", label: "Phone" }],
  Accounts: [{ key: "Account_Name", label: "Account name *" }, { key: "Phone", label: "Phone" }, { key: "Website", label: "Website" }, { key: "Industry", label: "Industry" }],
  Deals: [
    { key: "Deal_Name", label: "Deal name *" }, { key: "Amount", label: "Amount (₦)" }, { key: "Closing_Date", label: "Closing date (YYYY-MM-DD)" },
    { key: "Stage", label: "Stage", options: ["Qualification", "Needs Analysis", "Value Proposition", "Proposal/Price Quote", "Negotiation/Review", "Closed Won", "Closed Lost"] },
  ],
  Tasks: [{ key: "Subject", label: "Subject *" }, { key: "Due_Date", label: "Due date (YYYY-MM-DD)" }, { key: "Status", label: "Status", options: ["Not Started", "Deferred", "In Progress", "Completed", "Waiting for input"] }, { key: "Priority", label: "Priority", options: ["High", "Highest", "Low", "Lowest", "Normal"] }],
  Calls: [{ key: "Subject", label: "Subject *" }, { key: "Call_Type", label: "Call type", options: ["Outbound", "Inbound"] }, { key: "Call_Start_Time", label: "Start (ISO e.g. 2026-10-10T10:00:00+01:00)" }],
  Meetings: [{ key: "Event_Title", label: "Title *" }, { key: "Start_DateTime", label: "Start (ISO, +01:00)" }, { key: "End_DateTime", label: "End (ISO, +01:00)" }, { key: "Venue", label: "Venue" }],
};

function show(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "object") return (v as { name?: string }).name ?? JSON.stringify(v);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v).toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
  return String(v);
}
function title(r: CrmRecord): string {
  return show(r.Full_Name ?? r.Account_Name ?? r.Deal_Name ?? r.Subject ?? r.Event_Title ?? r.Last_Name ?? r.id);
}

function CrmPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "super_admin";
  const statusFn = useServerFn(crmStatus);
  const listFn = useServerFn(crmList);
  const [module, setModule] = useState<CrmModule>("Leads");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => { const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400); return () => clearTimeout(t); }, [searchInput]);

  const status = useQuery({ queryKey: ["crm", "status"], queryFn: () => statusFn(), staleTime: 60_000 });
  const connected = status.data?.connected;
  const list = useQuery({
    queryKey: ["crm", "list", module, page, search],
    queryFn: () => listFn({ data: { module, page, search: search || undefined } }),
    enabled: !!connected,
  });
  const res = list.data;

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="text-xs text-muted-foreground">Home / CRM</div>
          <h1 className="font-display text-2xl sm:text-3xl">CRM</h1>
          <p className="text-sm text-muted-foreground">Zoho CRM is the source of truth — changes here write straight to Zoho.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { status.refetch(); list.refetch(); }} className="chip-violet inline-flex items-center gap-1.5 px-3 py-1.5 text-xs" disabled={!connected}>
            <RefreshCw className={`h-3.5 w-3.5 ${list.isFetching ? "animate-spin" : ""}`} /> Sync now
          </button>
          <button onClick={() => setCreating(true)} disabled={!connected} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold disabled:opacity-50">
            <Plus className="h-3.5 w-3.5" /> New {module.slice(0, -1)}
          </button>
        </div>
      </div>

      {status.isLoading ? (
        <div className="card-elevated p-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking Zoho connection…</div>
      ) : !connected ? (
        <div className="card-elevated p-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-2"><PlugZap className="h-5 w-5 text-gold" /><h2 className="font-display text-lg">Zoho CRM not connected</h2></div>
          <p className="text-sm text-muted-foreground mb-3">
            {status.data?.error ?? "No Zoho CRM account is linked to ESB Brand Suite yet."} Once a Super Admin connects the company Zoho account, leads, contacts, accounts, deals, tasks, calls and meetings appear here live.
          </p>
          <p className="text-xs text-muted-foreground">Setup status: waiting for Zoho authorisation. Nothing is stored or faked in the meantime.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Connected{status.data?.user ? ` as ${status.data.user}` : ""}
            {res?.ok && <> · Last synced {new Date(res.data.syncedAt).toLocaleTimeString("en-NG", { timeZone: "Africa/Lagos" })}</>}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CRM_MODULES.map((m) => (
              <button key={m} onClick={() => { setModule(m); setPage(1); setOpenId(null); }}
                className={`px-3 py-1.5 rounded-full text-xs border ${m === module ? "bg-gold/15 border-gold/40 text-gold" : "border-border text-muted-foreground hover:text-foreground"}`}>{m}</button>
            ))}
          </div>
          <div className="relative mb-3 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Search ${module}…`} aria-label={`Search ${module}`}
              className="w-full rounded-full bg-secondary/60 border border-border pl-9 pr-3 py-2 text-sm" />
          </div>

          <div className="card-elevated overflow-x-auto">
            {list.isLoading ? (
              <div className="p-6 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading {module}…</div>
            ) : res && !res.ok ? (
              <div className="p-6 flex items-start gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4 mt-0.5" /> {res.error}</div>
            ) : res?.ok && res.data.records.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No {module.toLowerCase()} found.</div>
            ) : res?.ok ? (
              <table className="w-full text-xs">
                <thead className="text-left text-muted-foreground">
                  <tr>{res.data.fields.filter((f) => f !== "First_Name" && f !== "Last_Name").map((f) => <th key={f} className="px-3 py-2 font-medium">{f.replace(/_/g, " ")}</th>)}</tr>
                </thead>
                <tbody>
                  {res.data.records.map((r) => (
                    <tr key={r.id} onClick={() => setOpenId(r.id)} onKeyDown={(e) => e.key === "Enter" && setOpenId(r.id)} tabIndex={0}
                      className="border-t border-border hover:bg-secondary/40 cursor-pointer">
                      {res.data.fields.filter((f) => f !== "First_Name" && f !== "Last_Name").map((f) => <td key={f} className="px-3 py-2 whitespace-nowrap">{show(r[f])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="chip-violet px-2 py-1 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <button disabled={!(res?.ok && res.data.more)} onClick={() => setPage(page + 1)} className="chip-violet px-2 py-1 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          </div>
          {isAdmin && <IntegrationLog />}
        </>
      )}

      {openId && <RecordPanel module={module} id={openId} onClose={() => setOpenId(null)} />}
      {creating && <RecordForm module={module} onClose={() => setCreating(false)} />}
    </Shell>
  );
}

function RecordPanel({ module, id, onClose }: { module: CrmModule; id: string; onClose: () => void }) {
  const getFn = useServerFn(crmGet);
  const noteFn = useServerFn(crmAddNote);
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const q = useQuery({ queryKey: ["crm", "rec", module, id], queryFn: () => getFn({ data: { module, id } }) });
  const addNote = useMutation({
    mutationFn: () => noteFn({ data: { module, id, content: note } }),
    onSuccess: (r) => { if (r.ok) { toast.success("Note added to Zoho"); setNote(""); qc.invalidateQueries({ queryKey: ["crm", "rec", module, id] }); } else toast.error(r.error); },
  });
  const rec = q.data?.ok ? q.data.data.record : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-card border-l border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg truncate">{rec ? title(rec) : module}</h2>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full hover:bg-secondary/60 flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        {q.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : q.data && !q.data.ok ? (
          <p className="text-sm text-destructive">{q.data.error}</p>
        ) : rec ? (
          <>
            <div className="text-xs text-muted-foreground mb-3">Owner: {show(rec.Owner)} · Updated {show(rec.Modified_Time)}</div>
            {editing ? (
              <RecordForm module={module} record={rec} inline onClose={() => { setEditing(false); qc.invalidateQueries({ queryKey: ["crm"] }); }} />
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-4">
                  {Object.entries(rec).filter(([k, v]) => !k.startsWith("$") && v != null && v !== "" && typeof v !== "boolean" && !Array.isArray(v)).slice(0, 30).map(([k, v]) => (
                    <div key={k} className="min-w-0"><dt className="text-muted-foreground">{k.replace(/_/g, " ")}</dt><dd className="truncate">{show(v)}</dd></div>
                  ))}
                </dl>
                <button onClick={() => setEditing(true)} className="chip-gold px-3 py-1.5 text-xs mb-5">Edit record</button>
              </>
            )}
            <h3 className="font-display text-sm mb-2">Notes</h3>
            <div className="space-y-2 mb-3">
              {(q.data?.ok ? q.data.data.notes : []).map((n) => (
                <div key={n.id} className="rounded-lg border border-border p-2 text-xs"><div className="font-medium">{show(n.Note_Title)}</div><div className="whitespace-pre-wrap">{show(n.Note_Content)}</div><div className="text-muted-foreground mt-1">{show(n.Created_Time)}</div></div>
              ))}
              {q.data?.ok && q.data.data.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Add a note or follow-up…" className="w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm" />
            <button onClick={() => addNote.mutate()} disabled={!note.trim() || addNote.isPending} className="mt-2 px-4 py-1.5 rounded-full bg-gold text-gold-foreground text-xs font-semibold disabled:opacity-50">
              {addNote.isPending ? "Saving…" : "Add note"}
            </button>
          </>
        ) : <p className="text-sm text-muted-foreground">Record not found.</p>}
      </div>
    </div>
  );
}

function RecordForm({ module, record, inline, onClose }: { module: CrmModule; record?: CrmRecord; inline?: boolean; onClose: () => void }) {
  const saveFn = useServerFn(crmSave);
  const dupeFn = useServerFn(crmFindDuplicates);
  const qc = useQueryClient();
  const [vals, setVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(FORM[module].map((f) => [f.key, record?.[f.key] != null ? show(record[f.key]) : ""])),
  );
  const [dupes, setDupes] = useState<CrmRecord[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(force = false) {
    setBusy(true);
    try {
      if (!record && !force && (vals.Email || vals.Phone) && (module === "Leads" || module === "Contacts")) {
        const d = await dupeFn({ data: { module, email: vals.Email || undefined, phone: vals.Phone || undefined } });
        if (d.duplicates.length) { setDupes(d.duplicates); return; }
      }
      const values: Record<string, string | number | null> = {};
      for (const f of FORM[module]) {
        const v = vals[f.key]?.trim();
        if (v === undefined || v === "" || v === "—") continue;
        values[f.key] = f.key === "Amount" ? Number(v) : v;
      }
      const r = await saveFn({ data: { module, id: record?.id, values } });
      if (!r.ok) { toast.error(r.error); return; }
      toast.success(record ? "Saved to Zoho" : `${module.slice(0, -1)} created in Zoho`);
      qc.invalidateQueries({ queryKey: ["crm"] });
      onClose();
    } catch { toast.error("Couldn't save. Please try again."); }
    finally { setBusy(false); }
  }

  const body = (
    <div className="space-y-3">
      {FORM[module].map((f) => (
        <label key={f.key} className="block text-xs text-muted-foreground">
          {f.label}
          {f.options ? (
            <select value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground">
              <option value="">—</option>{f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input value={vals[f.key]} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground" />
          )}
        </label>
      ))}
      {dupes && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs">
          <p className="font-medium mb-1">Possible duplicates already in Zoho:</p>
          <ul className="list-disc ml-4 mb-2">{dupes.map((d) => <li key={d.id}>{title(d)} · {show(d.Email)} · {show(d.Phone)}</li>)}</ul>
          <button onClick={() => submit(true)} className="underline">Create anyway</button>
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={() => submit()} disabled={busy} className="px-4 py-2 rounded-full bg-gold text-gold-foreground text-xs font-semibold disabled:opacity-50">{busy ? "Saving…" : record ? "Save changes" : "Create"}</button>
        <button onClick={onClose} className="px-4 py-2 rounded-full border border-border text-xs">Cancel</button>
      </div>
    </div>
  );
  if (inline) return body;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-5">
        <h2 className="font-display text-lg mb-3">New {module.slice(0, -1)}</h2>
        {body}
      </div>
    </div>
  );
}

function IntegrationLog() {
  const logsFn = useServerFn(crmLogs);
  const q = useQuery({ queryKey: ["crm", "logs"], queryFn: () => logsFn() });
  if (!q.data?.length) return null;
  return (
    <div className="card-elevated p-4 mt-6">
      <h2 className="font-display text-sm mb-2">Integration errors (admins only)</h2>
      <ul className="space-y-1 text-xs">
        {q.data.map((l: { id: string; action: string; status: number | null; message: string | null; created_at: string }) => (
          <li key={l.id} className="flex gap-2"><span className="text-muted-foreground whitespace-nowrap">{new Date(l.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</span><span>{l.action} · {l.status ?? "—"} · {(l.message ?? "").slice(0, 140)}</span></li>
        ))}
      </ul>
    </div>
  );
}
