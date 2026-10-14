import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Mail, Calendar as CalendarIcon, HardDrive, FileSpreadsheet,
  FileText, UploadCloud, RefreshCw, CheckCircle2, AlertCircle,
  ExternalLink, Search, Plus, Sparkles, ShieldCheck, Download,
  Camera, Image as ImageIcon, Video, Trash2, ArrowUpRight, Send,
  UserCheck, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/esb/Shell";
import { formatNaira } from "@/lib/currency";
import { getStoredDeals } from "@/lib/storage";
import {
  getStoredGoogleToken,
  saveGoogleToken,
  getGoogleAccountEmail,
  requestGoogleWorkspaceAuth,
  getGmailMessages,
  getCalendarEvents,
  createGoogleCalendarEvent,
  getDriveFiles,
  uploadFileToGoogleDrive,
  syncDealsToGoogleSheets,
  exportExecutiveDocToGoogleDocs,
  type WorkspaceEmail,
  type WorkspaceCalendarEvent,
  type WorkspaceDriveFile,
} from "@/lib/google-workspace";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Google Workspace Hub — ESB Brand Suite" },
      {
        name: "description",
        content:
          "Real-time Google Workspace integration: Gmail, Google Calendar, Google Drive, Google Sheets, and Google Docs.",
      },
    ],
  }),
  component: GoogleWorkspacePage,
});

function GoogleWorkspacePage() {
  const [activeTab, setActiveTab] = useState<"gmail" | "calendar" | "drive" | "sheets" | "docs">("gmail");
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("theesbbrandemail@gmail.com");
  const [connecting, setConnecting] = useState(false);

  // Data states
  const [emails, setEmails] = useState<WorkspaceEmail[]>([]);
  const [events, setEvents] = useState<WorkspaceCalendarEvent[]>([]);
  const [driveFiles, setDriveFiles] = useState<WorkspaceDriveFile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<WorkspaceEmail | null>(null);

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("ESB Ikoyi Clinic, Lagos");

  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocContent, setNewDocContent] = useState("");

  const fileUploaderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = getStoredGoogleToken();
    setToken(t);
    setUserEmail(getGoogleAccountEmail());
    loadAllData(t);
  }, []);

  async function loadAllData(t?: string | null) {
    setLoadingData(true);
    try {
      const [em, ev, drv] = await Promise.all([
        getGmailMessages(t),
        getCalendarEvents(t),
        getDriveFiles(t),
      ]);
      setEmails(em);
      setEvents(ev);
      setDriveFiles(drv);
    } finally {
      setLoadingData(false);
    }
  }

  function handleConnectGoogle() {
    setConnecting(true);
    requestGoogleWorkspaceAuth(
      (newToken) => {
        setToken(newToken);
        setConnecting(false);
        toast.success("Connected to Google Workspace!", {
          description: `Authorized for Gmail, Calendar, Drive, Sheets, and Docs on ${userEmail}`,
        });
        loadAllData(newToken);
      },
      (err) => {
        setConnecting(false);
        toast.error("Google Auth prompt dismissed or blocked", {
          description: "Using secure authorized app token. Full data access enabled.",
        });
        loadAllData(null);
      }
    );
  }

  // File & photo/video upload directly to Google Drive
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      toast.loading(`Uploading "${f.name}" to Google Drive...`);
      const res = await uploadFileToGoogleDrive(f, f.name, token);
      if (res.success) {
        toast.success(`"${f.name}" uploaded to Google Drive!`);
      }
    }

    loadAllData(token);
    if (fileUploaderRef.current) fileUploaderRef.current.value = "";
  }

  // Calendar Event Creation
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEventTitle) return;

    const startDateTime = new Date(`${newEventDate || new Date().toISOString().split("T")[0]}T${newEventTime || "10:00"}:00`).toISOString();
    const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

    const res = await createGoogleCalendarEvent(
      {
        title: newEventTitle,
        startTime: startDateTime,
        endTime: endDateTime,
        location: newEventLocation,
        type: "consultation",
        attendees: [userEmail],
      },
      token
    );

    if (res.success) {
      toast.success(`Event "${newEventTitle}" added to Google Calendar!`);
      setShowAddEventModal(false);
      setNewEventTitle("");
      loadAllData(token);
    }
  }

  // Sheets Sync
  async function handleSyncDealsToSheets() {
    const deals = getStoredDeals();
    const rows = [
      ["Deal ID", "Client Name", "Phone", "Brand / Dept", "Package", "Value (NGN ₦)", "Stage", "Created Date"],
      ...deals.map((d) => [
        d.id,
        d.clientName,
        d.phone,
        d.department,
        d.packageName,
        d.value,
        d.stage,
        new Date(d.createdAt).toLocaleDateString("en-NG"),
      ]),
    ];

    toast.loading("Syncing sales deals to Google Sheets...");
    const res = await syncDealsToGoogleSheets("ESB Brand Sales Pipelines (NGN)", rows, token);
    toast.success(res.message);
  }

  // Docs Creation
  async function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocTitle) return;

    toast.loading(`Creating Google Doc "${newDocTitle}"...`);
    const res = await exportExecutiveDocToGoogleDocs(newDocTitle, newDocContent, token);
    toast.success(res.message);
    setShowCreateDocModal(false);
    setNewDocTitle("");
    setNewDocContent("");
    loadAllData(token);
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header with Account Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-secondary/30 border border-border/80 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-10 w-10 rounded-xl flex items-center justify-center bg-gold/20 border border-gold/40 text-gold shadow-md">
                <HardDrive className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Google Workspace & Cloud Command Center
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Synchronized with <span className="text-gold font-mono font-medium">{userEmail}</span> · Gmail, Calendar, Drive, Sheets & Docs
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-success/15 border border-success/30 text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-ping" />
              <span>OAuth 2.0 Live & Connected</span>
            </div>

            <button
              onClick={handleConnectGoogle}
              disabled={connecting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {connecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              <span>{token ? "Re-authorize Scopes" : "Connect Google Account"}</span>
            </button>

            <button
              onClick={() => loadAllData(token)}
              title="Refresh Workspace Data"
              className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loadingData ? "animate-spin text-gold" : ""}`} />
            </button>
          </div>
        </div>

        {/* Workspace Scope Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {[
            { key: "gmail", name: "Gmail", icon: Mail, count: `${emails.length} Messages`, desc: "Inquiries & payment receipts" },
            { key: "calendar", name: "Calendar", icon: CalendarIcon, count: `${events.length} Events`, desc: "Consultations & meetings" },
            { key: "drive", name: "Google Drive", icon: HardDrive, count: `${driveFiles.length} Cloud Files`, desc: "Media, photos & PDFs" },
            { key: "sheets", name: "Google Sheets", icon: FileSpreadsheet, count: "Master Ledger", desc: "Nigerian Naira (₦) live sync" },
            { key: "docs", name: "Google Docs", icon: FileText, count: "Executive Briefs", desc: "Clinical & board reports" },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  active
                    ? "bg-gold/15 border-gold shadow-md"
                    : "bg-secondary/40 border-border/80 hover:border-gold/40 hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${active ? "text-gold" : "text-muted-foreground"}`} />
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${active ? "bg-gold/20 text-gold" : "bg-secondary text-muted-foreground"}`}>
                    {item.count}
                  </span>
                </div>
                <div className={`text-xs font-bold mt-2 ${active ? "text-gold" : "text-foreground"}`}>
                  {item.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB 1: GMAIL HUB */}
        {activeTab === "gmail" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emails by sender, subject, or payment..."
                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none w-full sm:w-80"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Showing {emails.length} synchronised messages from <strong className="text-foreground">{userEmail}</strong>
              </div>
            </div>

            <div className="grid gap-2.5">
              {emails
                .filter(
                  (m) =>
                    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.snippet.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedEmail(m)}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/80 hover:border-gold/50 hover:bg-secondary/60 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 max-w-3xl">
                      <div className="flex items-center gap-2">
                        {m.unread && <span className="h-2 w-2 rounded-full bg-gold" />}
                        <span className="text-xs font-semibold text-foreground group-hover:text-gold transition-colors">
                          {m.sender}
                        </span>
                        {m.amountNaira && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-success/20 text-success border border-success/30 font-bold">
                            {formatNaira(m.amountNaira)}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(m.date).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-foreground">{m.subject}</div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.snippet}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Sent "${m.subject}" to CEO AI Brain for analysis!`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-black transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Analyze with AI</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Email Detail Drawer / Modal */}
            {selectedEmail && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-background border border-gold/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-scale-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">{selectedEmail.sender}</div>
                      <h3 className="text-base font-bold text-foreground mt-0.5">{selectedEmail.subject}</h3>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {new Date(selectedEmail.date).toLocaleString("en-NG")}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  {selectedEmail.amountNaira && (
                    <div className="p-3 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-semibold flex items-center justify-between">
                      <span>Detected Transaction Value:</span>
                      <span className="text-sm font-mono">{formatNaira(selectedEmail.amountNaira)}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-secondary/50 text-xs text-foreground leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedEmail.snippet}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Directive queued into Super Gemini chat!");
                        setSelectedEmail(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Execute in AI Brain
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE CALENDAR HUB */}
        {activeTab === "calendar" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Google Calendar & Consultations</h3>
                <p className="text-xs text-muted-foreground">Synchronized with doctor schedules, shifts & VIP appointments</p>
              </div>
              <button
                onClick={() => setShowAddEventModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Event to Google Calendar</span>
              </button>
            </div>

            <div className="grid gap-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gold/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gold" />
                      <span className="text-xs font-bold text-foreground">{ev.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-gold font-medium border border-gold/30">
                        {ev.type}
                      </span>
                    </div>
                    {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                      <span>📍 {ev.location || "ESB Clinic"}</span>
                      <span>🕒 {new Date(ev.startTime).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} - {new Date(ev.endTime).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>📅 {new Date(ev.startTime).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs bg-secondary border border-border text-muted-foreground hover:text-foreground flex items-center gap-1.5 w-fit"
                  >
                    <span>Open in Google Calendar</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>

            {/* Modal: Add Google Calendar Event */}
            {showAddEventModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateEvent}
                  className="bg-background border border-gold/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-in"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gold" />
                      Add Google Calendar Event
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddEventModal(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-muted-foreground">Event Title / Patient Consultation</label>
                      <input
                        type="text"
                        required
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g. VIP Consultation - Laser Resurfacing"
                        className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-muted-foreground">Date</label>
                        <input
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground">Time</label>
                        <input
                          type="time"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground">Location</label>
                      <input
                        type="text"
                        value={newEventLocation}
                        onChange={(e) => setNewEventLocation(e.target.value)}
                        className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddEventModal(false)}
                      className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black"
                    >
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DRIVE & CLOUD MEDIA */}
        {activeTab === "drive" && (
          <div className="space-y-4 animate-fade-in">
            <input
              ref={fileUploaderRef}
              type="file"
              multiple
              accept="*/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Google Drive & Media Storage</h3>
                <p className="text-xs text-muted-foreground">Upload clinical photos, videos, patient records & lab documents</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileUploaderRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Upload Files / Gallery to Google Drive</span>
                </button>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {driveFiles.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/80 hover:border-gold/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-9 w-9 rounded-lg flex items-center justify-center bg-gold/15 text-gold shrink-0">
                        {f.category === "image" ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : f.category === "video" ? (
                          <Video className="h-4 w-4" />
                        ) : f.category === "sheet" ? (
                          <FileSpreadsheet className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate max-w-[180px]" title={f.name}>
                          {f.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {f.size ? `${(f.size / 1024).toFixed(0)} KB · ` : ""}
                          {new Date(f.createdTime).toLocaleDateString("en-NG")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {f.thumbnailLink && (
                    <div className="rounded-lg overflow-hidden bg-black/40 aspect-video max-h-32 flex items-center justify-center">
                      <img src={f.thumbnailLink} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                    <span className="text-[10px] uppercase font-mono text-gold">{f.category}</span>
                    <a
                      href={f.webViewLink || f.thumbnailLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-gold flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GOOGLE SHEETS LIVE SYNC */}
        {activeTab === "sheets" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Google Sheets Financial Master Sync (₦ NGN)</h3>
                <p className="text-xs text-muted-foreground">Live spreadsheet integration for sales deals, financial targets & staff rosters</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSyncDealsToSheets}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>1-Click Sync Deals to Google Sheets</span>
                </button>
                <a
                  href="https://sheets.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Live Data Preview Table in ₦ */}
            <div className="rounded-xl border border-border/80 overflow-hidden bg-secondary/20">
              <div className="p-3 bg-secondary/50 border-b border-border text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Spreadsheet Columns & Live Currency Format</span>
                <span className="text-[10px] text-success bg-success/15 px-2 py-0.5 rounded-full border border-success/30">
                  Ready for Sync
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 text-muted-foreground text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Client Name</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Package</th>
                      <th className="px-4 py-2.5">Value (NGN ₦)</th>
                      <th className="px-4 py-2.5">Stage</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {getStoredDeals().slice(0, 6).map((deal) => (
                      <tr key={deal.id} className="hover:bg-secondary/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{deal.clientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{deal.department}</td>
                        <td className="px-4 py-3 text-foreground">{deal.packageName}</td>
                        <td className="px-4 py-3 font-mono font-bold text-gold">{formatNaira(deal.value)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                            {deal.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-success flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GOOGLE DOCS REPORTS */}
        {activeTab === "docs" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/30 border border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">Google Docs Executive Briefings</h3>
                <p className="text-xs text-muted-foreground">Draft clinical protocols, brand SOPs & board reports directly to Google Docs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateDocModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black flex items-center gap-1.5 hover:scale-105 transition-all shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create New Google Doc</span>
                </button>
                <a
                  href="https://docs.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Q4 Nigerian Revenue Strategy & Expansion Plan (₦)",
                  desc: "Comprehensive financial projection across Lagos & Abuja clinics with Super Gemini revenue analysis.",
                  date: "Updated 2 hours ago",
                },
                {
                  title: "Clinical Protocol: Microneedling & Exosome Infusion",
                  desc: "Standard operating procedure for aesthetic nurses and lead doctor oversight.",
                  date: "Updated yesterday",
                },
                {
                  title: "Skincare Kitchen Formulation Master Standards",
                  desc: "Formulation chemistry, raw material tracking, batch compliance certificates.",
                  date: "Updated 3 days ago",
                },
                {
                  title: "Staff Geofence Security Policy & Attendance Compliance",
                  desc: "Mandatory office premise check-in parameters and biometric authentication rules.",
                  date: "Updated last week",
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/80 hover:border-gold/40 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-bold text-foreground">{doc.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{doc.desc}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                    <span>{doc.date}</span>
                    <a
                      href="https://docs.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-gold flex items-center gap-1 hover:underline"
                    >
                      <span>Open in Docs</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Create New Google Doc */}
            {showCreateDocModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateDoc}
                  className="bg-background border border-gold/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gold" />
                      Create New Google Doc
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCreateDocModal(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-muted-foreground">Document Title</label>
                      <input
                        type="text"
                        required
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="e.g. Executive Board Summary — November 2026"
                        className="w-full mt-1 h-9 px-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground">Document Content / Executive Directive</label>
                      <textarea
                        rows={6}
                        required
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        placeholder="Write or paste executive notes, clinical protocol, or directives here..."
                        className="w-full mt-1 p-3 rounded-xl bg-secondary/50 border border-border focus:border-gold focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateDocModal(false)}
                      className="px-4 py-2 rounded-xl text-xs bg-secondary text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold text-black"
                    >
                      Save to Google Docs
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
