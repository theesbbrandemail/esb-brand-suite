import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { listBranches, listAppointments, listContentPosts, type Branch, type Appointment, type ContentPost } from "@/lib/ops.functions";
import { MapPin, ArrowRight, Loader2, Calendar, FileText } from "lucide-react";

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function BranchCards({ title = "Branches" }: { title?: string }) {
  const branchesFn = useServerFn(listBranches);
  const apptsFn = useServerFn(listAppointments);

  const branchesQ = useQuery({ queryKey: ["branches"], queryFn: () => branchesFn() });
  const apptsQ = useQuery({
    queryKey: ["appointments", "today"],
    queryFn: () => apptsFn({ data: todayRange() }),
    refetchInterval: 60_000,
  });

  const postsFn = useServerFn(listContentPosts);
  const postsQ = useQuery({
    queryKey: ["content-posts"],
    queryFn: () => postsFn({ data: {} }),
    refetchInterval: 60_000,
  });

  const branches = (branchesQ.data ?? []) as Branch[];
  const appts = (apptsQ.data ?? []) as Appointment[];
  const posts = (postsQ.data ?? []) as ContentPost[];
  const countFor = (id: string) => appts.filter((a) => a.branch_id === id).length;
  const postsFor = (id: string) => posts.filter((p) => p.branch_id === id).length;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 gold-text" />
        <h2 className="font-display text-sm sm:text-base">{title}</h2>
        <span className="ml-auto text-[10px] text-muted-foreground">Tap a branch to view its appointments</span>
      </div>

      {branchesQ.isLoading ? (
        <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading branches…
        </div>
      ) : branches.length === 0 ? (
        <p className="py-6 text-xs text-muted-foreground">No branches yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {branches.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 24 }}
            >
              <Link
                to="/appointments"
                search={{ q: "", status: "", branchId: b.id }}
                aria-label={`Open appointments for ${b.name}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-sm font-semibold">{b.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{b.city ?? "—"}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                  <Calendar className="h-3 w-3 gold-text" />
                  <span className="gold-text font-semibold">{apptsQ.isLoading ? "…" : countFor(b.id)}</span>
                  <span className="text-muted-foreground">appointments today</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
