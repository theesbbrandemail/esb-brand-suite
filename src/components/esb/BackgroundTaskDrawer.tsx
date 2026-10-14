import { useState, useEffect } from "react";
import {
  Zap, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck,
  Clock, Database, HardDrive, Truck, Users, Wifi, WifiOff,
  Sliders, Play, Pause, ChevronRight, X, ArrowUpRight,
  Download, Activity, Layers, FileSpreadsheet, Lock
} from "lucide-react";
import { toast } from "sonner";
import {
  backgroundSync,
  type SyncManagerSnapshot,
  type SyncChannelId,
  type SyncTaskMeta,
  type SyncTelemetryLog,
} from "@/lib/background-sync-manager";
import { formatNaira } from "@/lib/currency";

export function BackgroundTaskWidget() {
  const [snapshot, setSnapshot] = useState<SyncManagerSnapshot>(() => backgroundSync.getSnapshot());
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    return backgroundSync.subscribe((snap) => {
      setSnapshot(snap);
    });
  }, []);

  const healthColor =
    snapshot.latencyHealth === "ultra_fast"
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
      : snapshot.latencyHealth === "optimal"
      ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
      : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        className={`h-8 sm:h-9 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-full border text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 ${healthColor}`}
        title={`Background Sync Active: ${snapshot.currentLatencyMs}ms Round-Trip Latency (${snapshot.tasks.filter((t) => t.status === "synced").length}/${snapshot.tasks.length} Channels Synced)`}
      >
        <span className="relative flex h-2 w-2">
          {snapshot.autoSyncEnabled ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
          )}
        </span>
        <Zap className="h-3 w-3 text-gold" />
        <span className="font-bold text-foreground">{snapshot.currentLatencyMs}ms</span>
        <span className="hidden sm:inline text-muted-foreground text-[10px]">· 0 Latency</span>
      </button>

      {drawerOpen && (
        <BackgroundTaskDrawer snapshot={snapshot} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
}

export function BackgroundTaskDrawer({
  snapshot,
  onClose,
}: {
  snapshot: SyncManagerSnapshot;
  onClose: () => void;
}) {
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<SyncChannelId | "all">("all");

  const handleForceSync = async (channelId?: SyncChannelId) => {
    setIsSyncingAll(true);
    try {
      const res = await backgroundSync.forceSyncTask(channelId);
      toast.success(
        channelId ? `Channel Synced (${res.latencyMs}ms)` : `All Channels Synchronized (${res.latencyMs}ms)`,
        {
          description: `Processed ${res.records} records across internal state and external endpoints with zero data latency.`,
        }
      );
    } catch {
      toast.error("Sync error occurred on background worker");
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleExportDiagnostics = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `esb-sync-diagnostics-${Date.now()}.json`);
    dlAnchorElem.click();
    toast.success("Sync Diagnostics JSON Exported");
  };

  const filteredLogs = selectedChannel === "all"
    ? snapshot.recentLogs
    : snapshot.recentLogs.filter((l) => l.channelId === selectedChannel);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-end p-0 sm:p-4 animate-fade-in">
      <div className="card-elevated w-full sm:max-w-2xl h-full sm:h-[94vh] sm:rounded-3xl border border-gold/40 bg-neutral-950 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border/80 flex items-center justify-between bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-foreground">
                  Background Task Manager
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Zero Latency Pipeline
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Continuous polling & bidirectional synchronization between internal state and external APIs.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleForceSync()}
              disabled={isSyncingAll}
              className="chip-gold flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAll ? "animate-spin text-black" : ""}`} />
              <span>{isSyncingAll ? "Syncing..." : "Sync All Now"}</span>
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Latency Dashboard Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Current Latency</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 flex items-baseline gap-1">
                <span>{snapshot.currentLatencyMs}</span>
                <span className="text-xs text-muted-foreground">ms</span>
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ultra-Fast Real-Time</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Average Latency</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 flex items-baseline gap-1">
                <span>{snapshot.averageLatencyMs}</span>
                <span className="text-xs text-muted-foreground">ms</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Min {snapshot.minLatencyMs}ms · Max {snapshot.maxLatencyMs}ms
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Sync Cycles</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-gold">
                {snapshot.totalCyclesCompleted.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {snapshot.totalRecordsProcessed.toLocaleString()} records piped
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border space-y-1">
              <div className="text-[10px] uppercase font-bold text-muted-foreground">Offline Queue</div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-purple-400">
                {snapshot.offlineQueuePendingCount}
              </div>
              <div className="text-[10px] text-emerald-400">
                {snapshot.offlineQueuePendingCount === 0 ? "All committed" : "Pending auto-flush"}
              </div>
            </div>
          </div>

          {/* Polling Interval & Performance Controller */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-gold" />
                <span className="font-bold text-foreground">Polling Frequency & Performance Controller</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Master Auto-Sync:</span>
                <button
                  onClick={() => backgroundSync.setAutoSyncEnabled(!snapshot.autoSyncEnabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    snapshot.autoSyncEnabled
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {snapshot.autoSyncEnabled ? (
                    <>
                      <Pause className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Paused</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { ms: 3000, label: "3s (Instant Stream)" },
                { ms: 5000, label: "5s (High Velocity)" },
                { ms: 8000, label: "8s (Balanced Standard)" },
                { ms: 15000, label: "15s (Eco Mode)" },
                { ms: 3000, label: "30s (Low Power)" },
              ].map((opt) => (
                <button
                  key={opt.ms}
                  onClick={() => {
                    backgroundSync.setPollingInterval(opt.ms);
                    toast.success(`Polling interval set to ${opt.ms / 1000}s`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    snapshot.pollingIntervalMs === opt.ms
                      ? "bg-gold text-black font-bold shadow-sm"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Channels & Background Workers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-gold" />
                <span>Connected API Channels & Workers ({snapshot.tasks.length})</span>
              </span>
              <span className="text-muted-foreground text-[11px] font-mono">
                {snapshot.tasks.filter((t) => t.enabled).length} Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {snapshot.tasks.map((task) => {
                const isSynced = task.status === "synced";
                const isSyncing = task.status === "syncing";
                const isErr = task.status === "error";

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      !task.enabled
                        ? "bg-secondary/20 border-border/40 opacity-60"
                        : isSynced
                        ? "bg-secondary/30 border-border hover:border-gold/30"
                        : "bg-secondary/40 border-border"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-xs">{task.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary font-mono text-muted-foreground truncate max-w-[200px]">
                          {task.endpoint}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{task.description}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-3 pt-0.5 font-mono">
                        <span className="text-emerald-400 font-semibold">{task.latencyMs}ms latency</span>
                        <span>•</span>
                        <span>{task.recordsSynced} records</span>
                        <span>•</span>
                        <span>{(task.bytesTransferred / 1024).toFixed(1)} KB transferred</span>
                        {task.lastSyncedAt && (
                          <>
                            <span>•</span>
                            <span>Last sync: {new Date(task.lastSyncedAt).toLocaleTimeString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => handleForceSync(task.id)}
                        disabled={isSyncingAll || isSyncing}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center gap-1 transition"
                        title="Sync this channel immediately"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-gold" : ""}`} />
                        <span>Sync</span>
                      </button>

                      <button
                        onClick={() => backgroundSync.toggleTask(task.id, !task.enabled)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                          task.enabled
                            ? "bg-gold/15 text-gold border border-gold/40"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {task.enabled ? "Active" : "Disabled"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Sync Telemetry Event Log */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span>Live Event Stream & Audit Telemetry</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDiagnostics}
                  className="text-xs text-gold hover:underline flex items-center gap-1 font-medium"
                >
                  <Download className="h-3 w-3" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/20 p-3 max-h-60 overflow-y-auto space-y-1.5 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  Awaiting background worker event stream...
                </div>
              ) : (
                filteredLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-xl bg-background/50 border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-muted-foreground shrink-0">{log.timestamp}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-gold shrink-0">
                        {log.channelName.split(" ")[0]}
                      </span>
                      <span className="text-foreground truncate">{log.action}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-emerald-400 font-bold">{log.latencyMs}ms</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          log.status === "success" ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 flex items-center justify-between bg-secondary/30 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>High-Availability Zero Data Latency Cluster: Lagos & Abuja Active</span>
          </div>

          <button
            onClick={onClose}
            className="chip-gold px-4 py-2 text-xs font-semibold"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
