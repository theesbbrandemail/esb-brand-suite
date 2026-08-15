import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Appointment } from "@/lib/ops.functions";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  User,
  X,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const WA = (phone: string, msg: string) =>
  `https://wa.me/${phone.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(msg)}`;

interface AppointmentDetailsDrawerProps {
  appt: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatus: (s: "confirmed" | "completed" | "cancelled") => void;
}

export function AppointmentDetailsDrawer({
  appt,
  open,
  onOpenChange,
  onStatus,
}: AppointmentDetailsDrawerProps) {
  if (!appt) return null;

  const time = format(new Date(appt.scheduled_at), "p");
  const date = format(new Date(appt.scheduled_at), "EEEE, MMMM d, yyyy");
  const statusColor =
    appt.status === "completed"
      ? "text-success border-success/40 bg-success/10"
      : appt.status === "cancelled"
        ? "text-danger border-danger/40 bg-danger/10"
        : appt.status === "confirmed"
          ? "text-gold border-gold/40 bg-gold/10"
          : "text-muted-foreground border-border bg-secondary";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-white/10 bg-[oklch(0.12_0.02_300)] max-h-[85vh]">
        <DrawerHeader className="flex items-start justify-between pb-2">
          <div className="text-left min-w-0">
            <DrawerTitle className="font-display text-xl truncate">{appt.patient_name}</DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground mt-1">
              Appointment details
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <button className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition shrink-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-2 overflow-y-auto overscroll-contain">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColor}`}
            >
              {appt.status}
            </span>
            {appt.branch && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {appt.branch.name}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <DetailRow icon={CalendarDays} label="Date" value={date} />
            <DetailRow icon={Clock} label="Time" value={`${time} · ${appt.duration_minutes} min`} />
            <DetailRow icon={User} label="Service" value={appt.service} />
            {appt.patient_phone && (
              <DetailRow
                icon={Phone}
                label="Phone"
                value={appt.patient_phone}
                href={`tel:${appt.patient_phone}`}
              />
            )}
            {appt.patient_email && (
              <DetailRow icon={User} label="Email" value={appt.patient_email} />
            )}
            {appt.notes ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{appt.notes}</div>
              </div>
            ) : null}
          </div>

          {appt.patient_phone && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <a
                href={`tel:${appt.patient_phone}`}
                className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border hover:bg-card transition"
              >
                <Phone className="h-3.5 w-3.5" /> Call patient
              </a>
              <a
                href={WA(
                  appt.patient_phone,
                  `Hi ${appt.patient_name}, this is ESB Brand confirming your ${appt.service} appointment on ${date} at ${time}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[oklch(0.65_0.18_145)]/15 border border-[oklch(0.65_0.18_145)]/40 text-[oklch(0.75_0.18_145)] hover:bg-[oklch(0.65_0.18_145)]/25 transition"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-white/10 pt-3 gap-2">
          <div className="grid grid-cols-3 gap-2">
            {appt.status !== "confirmed" && appt.status !== "completed" && (
              <button
                onClick={() => onStatus("confirmed")}
                className="text-xs chip-gold px-2 py-2.5 rounded-xl"
              >
                Confirm
              </button>
            )}
            {appt.status !== "completed" && (
              <button
                onClick={() => onStatus("completed")}
                className="text-xs inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl border border-success/40 text-success hover:bg-success/10 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Complete
              </button>
            )}
            {appt.status !== "cancelled" && (
              <button
                onClick={() => onStatus("cancelled")}
                className="text-xs inline-flex items-center justify-center gap-1 px-2 py-2.5 rounded-xl border border-danger/40 text-danger hover:bg-danger/10 transition"
              >
                <XCircle className="h-3.5 w-3.5" /> Cancel
              </button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <Icon className="h-4 w-4 text-gold shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-sm font-medium truncate ${href ? "text-gold" : ""}`}>{value}</div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {body}
      </a>
    );
  }
  return body;
}
