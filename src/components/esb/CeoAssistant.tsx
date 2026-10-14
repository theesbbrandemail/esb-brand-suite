import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Brain, X, Send, Loader2, Sparkles, CheckCircle2,
  Zap, PackagePlus, UserPlus, ShieldCheck, Flame, ChevronRight,
  Mic, MicOff, Volume2, VolumeX, Camera, Paperclip, FileText,
  UploadCloud, Image as ImageIcon, Video, Trash2, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { listInventory, type CeoKpis } from "@/lib/ops.functions";
import { AI_BRAINS, type AiBrainId, executeAdminAction } from "@/lib/ai-brains";
import { formatNaira } from "@/lib/currency";
import { uploadFileToGoogleDrive } from "@/lib/google-workspace";

type Turn = {
  role: "user" | "assistant";
  content: string;
  brain?: AiBrainId;
  attachments?: {
    name: string;
    type: string;
    size?: number;
    url?: string;
    driveUploaded?: boolean;
  }[];
  actionExecuted?: {
    type: string;
    summary: string;
  };
};

interface AttachedFile {
  id: string;
  file: File | Blob;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  textExtract?: string;
  driveUploaded?: boolean;
}

const SUGGESTIONS = [
  "Restock 50 units Vitamin C Brightening Serum",
  "Add VIP lead Chief Adeleke ₦2,500,000 for Derma Aesthetics",
  "Verify premise GPS clock-in for medical team",
  "Summarise today's revenue in Nigerian Naira (₦)",
  "Analyze uploaded financial invoice & extract totals",
];

export function CeoAssistant({
  kpis,
  open,
  onOpenChange,
}: {
  kpis: CeoKpis | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const inventoryFn = useServerFn(listInventory);
  const [selectedBrain, setSelectedBrain] = useState<AiBrainId>("super-gemini");
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice Chat State (Speech-to-Text & Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File Attachments State
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const invQ = useQuery({
    queryKey: ["ceo-assistant-inventory"],
    queryFn: () => inventoryFn({ data: {} }),
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const snapshot = useMemo(() => {
    const inv = (invQ.data ?? []).slice(0, 40).map((r) => ({
      product: r.product?.name ?? "Unknown",
      sku: r.product?.sku ?? null,
      brand: r.product?.brand ?? null,
      branch: r.branch?.name ?? null,
      qty: r.qty,
      reorder_at: r.low_stock_threshold,
      low: r.qty <= r.low_stock_threshold,
    }));
    return JSON.stringify({
      generated_at: new Date().toISOString(),
      currency: "NGN",
      kpis: kpis ?? null,
      inventory: inv,
    }).slice(0, 11500);
  }, [kpis, invQ.data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, attachedFiles]);

  // Clean up media stream when modal closes
  useEffect(() => {
    if (!open && mediaStreamRef.current) {
      stopCamera();
    }
  }, [open]);

  // Text to speech helper
  function speakText(text: string) {
    if (!voiceSpeechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown asterisks and links for smoother speech
      const clean = text.replace(/[*#_`]/g, "").replace(/https?:\/\/\S+/g, "");
      const utterance = new SpeechSynthesisUtterance(clean.slice(0, 300));
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // speech synthesis not allowed or supported
    }
  }

  // Voice Chat (Speech Recognition)
  function toggleSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Voice listening... Speak your executive directive");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      toast.error("Microphone access error. Please grant mic permissions.");
      setIsListening(false);
    }
  }

  // Camera Management
  async function startCamera() {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
      toast.info("Using device camera capture fallback.");
      // Fallback to native mobile camera via file input
      fileInputRef.current?.click();
      setIsCameraActive(false);
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const fileName = `esb-camera-snap-${Date.now()}.jpg`;
      const previewUrl = URL.createObjectURL(blob);
      const newFile: AttachedFile = {
        id: `att-${Date.now()}`,
        file: blob,
        name: fileName,
        type: "image/jpeg",
        size: blob.size,
        previewUrl,
      };
      setAttachedFiles((prev) => [...prev, newFile]);
      toast.success("Photo captured and attached to AI input!");
      stopCamera();
    }, "image/jpeg", 0.9);
  }

  // File Handling
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let previewUrl: string | undefined = undefined;
      let textExtract: string | undefined = undefined;

      if (f.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(f);
      } else if (
        f.type.includes("text") ||
        f.type.includes("csv") ||
        f.type.includes("json") ||
        f.name.endsWith(".txt") ||
        f.name.endsWith(".csv")
      ) {
        try {
          const raw = await f.text();
          textExtract = raw.slice(0, 3000);
        } catch {
          // ignore
        }
      }

      const attached: AttachedFile = {
        id: `file-${Date.now()}-${i}`,
        file: f,
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
        previewUrl,
        textExtract,
      };

      setAttachedFiles((prev) => [...prev, attached]);
    }

    toast.success(`${files.length} document/media attached for AI processing!`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachedFile(id: string) {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  async function uploadAttachedToDrive(att: AttachedFile) {
    toast.loading(`Uploading "${att.name}" to Google Drive...`);
    const res = await uploadFileToGoogleDrive(att.file, att.name);
    if (res.success) {
      toast.success(`"${att.name}" stored in Google Drive / Cloud!`);
      setAttachedFiles((prev) =>
        prev.map((f) => (f.id === att.id ? { ...f, driveUploaded: true } : f))
      );
    }
  }

  async function submit(text: string) {
    const t = text.trim();
    if ((!t && attachedFiles.length === 0) || busy) return;

    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setInput("");

    // Prepare contextual message with document extracts if present
    let promptWithDocs = t;
    if (filesToSend.length > 0) {
      const fileNames = filesToSend.map((f) => f.name).join(", ");
      const docSnippets = filesToSend
        .filter((f) => f.textExtract)
        .map((f) => `--- DOCUMENT [${f.name}] CONTENT ---\n${f.textExtract}\n--- END DOCUMENT ---`)
        .join("\n\n");

      promptWithDocs = `${t ? t + "\n\n" : ""}[Attached Document/Media: ${fileNames}]\n${docSnippets}`;
    }

    // 1. Check & execute immediate admin actions (Stock, CRM, Staff, Promo)
    const { response: actionResponse, executedAction } = executeAdminAction(
      selectedBrain,
      promptWithDocs,
      snapshot
    );

    if (executedAction) {
      toast.success(`Action Executed: ${executedAction.summary}`, {
        description: `Processed by ${AI_BRAINS[selectedBrain].name} into live storage.`,
      });
    }

    const next: Turn[] = [
      ...turns,
      {
        role: "user",
        content: t || `[Attached ${filesToSend.length} files: ${filesToSend.map((f) => f.name).join(", ")}]`,
        brain: selectedBrain,
        attachments: filesToSend.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          url: f.previewUrl,
          driveUploaded: f.driveUploaded,
        })),
      },
    ];
    setTurns(next);
    setBusy(true);

    // 2. Fetch live reasoning from Super Gemini backend or fallback
    try {
      const res = await fetch("/api/ceo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, snapshot, brain: selectedBrain }),
      });

      if (!res.ok) {
        throw new Error("AI service response error");
      }

      const textResponse = await res.text();
      const finalContent = executedAction
        ? `${actionResponse}\n\n---\n${textResponse}`
        : textResponse || actionResponse;

      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: finalContent,
          brain: selectedBrain,
          actionExecuted: executedAction
            ? { type: executedAction.type, summary: executedAction.summary }
            : undefined,
        },
      ]);
      speakText(finalContent);
    } catch {
      // Graceful fallback to verified action response
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          content: actionResponse,
          brain: selectedBrain,
          actionExecuted: executedAction
            ? { type: executedAction.type, summary: executedAction.summary }
            : undefined,
        },
      ]);
      speakText(actionResponse);
    } finally {
      setBusy(false);
    }
  }

  const activeBrain = AI_BRAINS[selectedBrain];

  return (
    <>
      {/* Floating dock trigger with 3D/4K Gold Glow */}
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Open CEO Multi-Brain AI assistant"
        className="fixed bottom-6 right-5 z-40 h-14 w-14 rounded-full flex items-center justify-center glow-gold shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{
          background: "linear-gradient(135deg, #d4af37 0%, #aa771c 50%, #f3e5ab 100%)",
          color: "#1a1202",
          boxShadow: "0 10px 30px -5px rgba(212, 175, 55, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.6)",
        }}
      >
        {open ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6 animate-pulse group-hover:rotate-12 transition-transform" />}
      </button>

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[480px] p-2 sm:p-4 pb-20 sm:pb-6 transition-all duration-500 ease-out ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="card-elevated h-full flex flex-col overflow-hidden relative border border-gold/30 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-2xl">
          <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          {/* Header */}
          <header className="relative flex flex-col px-4 py-3 border-b border-border/60 bg-secondary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-gold/20 border border-gold/40 text-gold shadow-sm">
                  <Brain className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-display font-bold gold-text flex items-center gap-1.5">
                    ESB Super Gemini & Multi-Brain AI
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-success/20 text-success border border-success/30 font-mono">
                      LIVE
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Connected to Google Workspace & Lagos HQ · ₦ NGN
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice Readout Toggle */}
                <button
                  onClick={() => {
                    setVoiceSpeechEnabled(!voiceSpeechEnabled);
                    toast.info(voiceSpeechEnabled ? "Voice speech readout disabled" : "Voice speech readout enabled");
                  }}
                  title={voiceSpeechEnabled ? "Mute AI Speech" : "Enable AI Voice Readout"}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    voiceSpeechEnabled ? "text-gold bg-gold/20 border border-gold/40" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {voiceSpeechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Brain Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 mt-3 p-1 rounded-xl bg-background/80 border border-border/70">
              {(Object.keys(AI_BRAINS) as AiBrainId[]).map((id) => {
                const b = AI_BRAINS[id];
                const active = selectedBrain === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedBrain(id);
                      toast.info(`Switched to ${b.name}`, { description: b.tagline });
                    }}
                    className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center transition-all ${
                      active
                        ? "bg-gold/20 text-gold font-semibold shadow-sm border border-gold/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <span className="text-xs">{b.avatar}</span>
                    <span className="text-[10px] truncate max-w-full mt-0.5">{b.name.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Brain Tagline */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-gold" />
                Active Model: <strong className="text-foreground">{activeBrain.name}</strong>
              </span>
              <span className="text-success text-[10px] font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                Real Directives Active
              </span>
            </div>
          </header>

          {/* Camera Viewfinder Modal */}
          {isCameraActive && (
            <div className="p-3 bg-secondary/80 border-b border-border/80 flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gold">
                  <Camera className="h-3.5 w-3.5 animate-pulse" />
                  Live Device Camera Viewfinder
                </span>
                <button onClick={stopCamera} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-48 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-1.5 rounded-full bg-gold text-black font-semibold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Snap & Attach to AI
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Chat Stream & Action Cards */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {turns.length === 0 && (
              <div className="space-y-4 animate-fade-up">
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-gold/20 space-y-1.5">
                  <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold" />
                    Autonomous Executive AI Brain & Google Workspace
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Speak directly, upload clinical documents/photos, or give admin directives. Real-world commands like{" "}
                    <span className="text-gold font-medium">"Restock 50 serums"</span> or{" "}
                    <span className="text-gold font-medium">"Add VIP lead ₦2.5M"</span> instantly execute
                    and persist in the database.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Suggested Executive Commands
                  </div>
                  <div className="grid gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => submit(s)}
                        className="text-left text-xs px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border/70 hover:border-gold/50 hover:bg-gold/10 hover:text-gold transition-all duration-200 flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-gold/80 group-hover:scale-110 transition-transform" />
                          {s}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {turns.map((turn, i) => {
              const isUser = turn.role === "user";
              return (
                <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-1`}>
                  <div className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
                    {isUser ? (
                      <span>You (CEO)</span>
                    ) : (
                      <>
                        <span className="text-gold font-medium">
                          {turn.brain ? AI_BRAINS[turn.brain].name : activeBrain.name}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Attached Media Chips in History */}
                  {turn.attachments && turn.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-w-[88%] mb-1">
                      {turn.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] bg-secondary border border-border/80 text-foreground"
                        >
                          {att.url ? (
                            <img src={att.url} alt={att.name} className="h-4 w-4 rounded object-cover" />
                          ) : (
                            <FileText className="h-3 w-3 text-gold" />
                          )}
                          <span className="truncate max-w-[120px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] text-xs p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-tr-sm"
                        : "bg-secondary/70 border border-border/80 text-foreground rounded-tl-sm"
                    }`}
                  >
                    {turn.actionExecuted && (
                      <div className="mb-2.5 p-2 rounded-lg bg-success/20 border border-success/40 text-success text-[11px] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Action Executed: {turn.actionExecuted.summary}</span>
                      </div>
                    )}
                    {turn.content}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-xl bg-secondary/30 w-fit">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                <span>{activeBrain.name} is processing data & executing commands...</span>
              </div>
            )}
          </div>

          {/* Pending Attached Files Chips Preview */}
          {attachedFiles.length > 0 && (
            <div className="px-3 py-2 bg-secondary/50 border-t border-border/50 flex flex-wrap gap-2">
              {attachedFiles.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-background border border-gold/30 shadow-sm"
                >
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="h-5 w-5 rounded object-cover" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-gold" />
                  )}
                  <span className="text-[11px] font-medium truncate max-w-[110px]">{att.name}</span>
                  {/* Google Drive Upload Button */}
                  <button
                    type="button"
                    onClick={() => uploadAttachedToDrive(att)}
                    title="Upload to Google Drive / Cloud"
                    className={`p-1 rounded-md transition-colors ${
                      att.driveUploaded
                        ? "text-success bg-success/20"
                        : "text-muted-foreground hover:text-gold hover:bg-gold/10"
                    }`}
                  >
                    {att.driveUploaded ? <CheckCircle2 className="h-3 w-3" /> : <UploadCloud className="h-3 w-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(att.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box with Voice, Camera, File Uploader */}
          <footer className="p-3 border-t border-border/70 bg-background/95 space-y-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-1.5"
            >
              {/* Voice Chat Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                title={isListening ? "Stop Voice Listening" : "Start Voice Input"}
                className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                    : "bg-secondary/60 text-muted-foreground hover:text-gold hover:bg-secondary border border-border"
                }`}
              >
                {isListening ? <Mic className="h-4 w-4 animate-bounce" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Camera Button */}
              <button
                type="button"
                onClick={startCamera}
                title="Open Camera / Snap Photo"
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-secondary/60 text-muted-foreground hover:text-gold hover:bg-secondary border border-border transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>

              {/* File / Document Picker Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach Document, Photo, Video, or Spreadsheet"
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center bg-secondary/60 text-muted-foreground hover:text-gold hover:bg-secondary border border-border transition-colors"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Main Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening to voice input..."
                    : `Ask ${activeBrain.name.split(" ")[0]} or give an admin directive...`
                }
                disabled={busy}
                className="flex-1 h-10 px-3 rounded-xl text-xs bg-secondary/50 border border-border focus:border-gold focus:outline-none placeholder:text-muted-foreground text-foreground transition-all"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={busy || (!input.trim() && attachedFiles.length === 0)}
                className="h-10 px-3 sm:px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 text-black disabled:opacity-50 transition-transform active:scale-95 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #d4af37, #aa771c)",
                  color: "#120d03",
                  fontWeight: 600,
                }}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
}
