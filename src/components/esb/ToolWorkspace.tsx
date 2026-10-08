import { useState, type ReactNode } from "react";
import { Copy, Printer, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "./Shell";

function inline(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}

/** Lightweight markdown: headings, bullets, numbered lists, tables, bold. */
export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      i--;
      out.push(
        <div key={i} className="overflow-x-auto my-3">
          <table className="w-full text-xs border border-border rounded-lg">
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className={ri === 0 ? "bg-secondary/60 font-semibold" : "border-t border-border"}>
                  {r.map((c, ci) => <td key={ci} className="px-2 py-1.5">{inline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const h = /^(#{1,4})\s+(.*)/.exec(l);
    if (h) { out.push(<h3 key={i} className="font-display text-base mt-4 mb-1 text-gold">{inline(h[2])}</h3>); continue; }
    const b = /^\s*(?:[-*]|\d+\.)\s+(.*)/.exec(l);
    if (b) { out.push(<li key={i} className="ml-5 list-disc text-sm leading-relaxed">{inline(b[1])}</li>); continue; }
    if (!l.trim()) { out.push(<div key={i} className="h-2" />); continue; }
    out.push(<p key={i} className="text-sm leading-relaxed">{inline(l)}</p>);
  }
  return <div>{out}</div>;
}

export function ToolWorkspace({
  title,
  subtitle,
  controls,
  onRun,
  running,
  result,
  error,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  controls: ReactNode;
  onRun: () => void;
  running: boolean;
  result: string;
  error?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Shell requireStaff>
      <div className="mb-6">
        <div className="chip-violet inline-flex items-center gap-1.5 mb-2"><Sparkles className="h-3 w-3" /> AI tool</div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="card-elevated p-5 space-y-4 h-fit">
          {controls}
          <button
            onClick={onRun}
            disabled={running}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gold text-gold-foreground text-sm font-semibold disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {running ? "Working…" : "Generate"}
          </button>
        </div>
        <div className="space-y-5 min-w-0">
          {children}
          <div className="card-elevated p-5 min-h-[240px]">
            {error ? (
              <div className="flex items-start gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4 mt-0.5" /> {error}</div>
            ) : running ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> The AI is preparing your results…</div>
            ) : result ? (
              <>
                <div className="flex flex-wrap gap-2 mb-3 print:hidden">
                  <button onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied"); }} className="chip-gold inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"><Copy className="h-3.5 w-3.5" /> Copy</button>
                  <button onClick={() => window.print()} className="chip-violet inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"><Printer className="h-3.5 w-3.5" /> Print</button>
                  {actions}
                </div>
                <Markdown text={result} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Choose your options and tap Generate.</p>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function BranchSelect({ value, onChange, branches }: { value: string; onChange: (v: string) => void; branches: { id: string; name: string }[] }) {
  return (
    <label className="block text-xs text-muted-foreground">
      Branch
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg bg-secondary/60 border border-border px-3 py-2 text-sm text-foreground">
        <option value="">All branches</option>
        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
    </label>
  );
}
