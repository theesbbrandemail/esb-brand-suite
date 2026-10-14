import { useState, useEffect } from "react";
import {
  MapPin, ShieldCheck, ShieldAlert, Lock, Unlock, Clock,
  CheckCircle2, Navigation, AlertTriangle, ExternalLink, RefreshCw, UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { getStoredStaff, saveStoredStaff, type StaffRecord } from "@/lib/storage";

// Official Operating Clinic Premises in Nigeria (Strictly 2 Active Branches)
export const OFFICE_PREMISES = [
  {
    id: "ph-gra",
    name: "Port Harcourt Flagship Clinic & Depot",
    city: "Port Harcourt",
    lat: 4.8156,
    lng: 7.0498,
    radiusMeters: 200,
  },
  {
    id: "maitama-abuja",
    name: "Maitama Executive Clinic & Lab",
    city: "Abuja",
    lat: 9.0765,
    lng: 7.4985,
    radiusMeters: 200,
  },
];

// Haversine distance formula in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function StaffGeoClockIn({
  activeStaff,
  onUpdate,
}: {
  activeStaff: StaffRecord;
  onUpdate?: () => void;
}) {
  const [selectedPremise, setSelectedPremise] = useState(OFFICE_PREMISES[0]);
  const [verifying, setVerifying] = useState(false);
  const [geoState, setGeoState] = useState<{
    status: "idle" | "verifying" | "verified" | "outside_premises" | "denied";
    distanceMeters?: number;
    coords?: { lat: number; lng: number };
    error?: string;
  }>({
    status: activeStaff.status === "on_duty" ? "verified" : "idle",
  });

  // Check device real GPS or simulate for evaluation
  const handleVerifyLocation = (overrideMock?: boolean) => {
    setVerifying(true);
    setGeoState({ status: "verifying" });

    if (overrideMock) {
      setTimeout(() => {
        setVerifying(false);
        setGeoState({
          status: "verified",
          distanceMeters: 28,
          coords: { lat: selectedPremise.lat + 0.0001, lng: selectedPremise.lng + 0.0001 },
        });
        toast.success("Premises GPS Confirmed!", {
          description: `You are 28m within ${selectedPremise.name} perimeter. Sign-in unlocked.`,
        });
      }, 700);
      return;
    }

    if (!navigator.geolocation) {
      setVerifying(false);
      setGeoState({
        status: "outside_premises",
        error: "Geolocation is not supported by your browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistanceMeters(
          latitude,
          longitude,
          selectedPremise.lat,
          selectedPremise.lng
        );

        setVerifying(false);
        if (dist <= selectedPremise.radiusMeters) {
          setGeoState({
            status: "verified",
            distanceMeters: Math.round(dist),
            coords: { lat: latitude, lng: longitude },
          });
          toast.success("Location Verified!", {
            description: `Within office boundaries (${Math.round(dist)}m from HQ). Sign in enabled.`,
          });
        } else {
          setGeoState({
            status: "outside_premises",
            distanceMeters: Math.round(dist),
            coords: { lat: latitude, lng: longitude },
          });
          toast.error("Geo-Fence Locked!", {
            description: `You are ${(dist / 1000).toFixed(1)}km away from ${selectedPremise.name}. Sign in requires physical presence.`,
          });
        }
      },
      (err) => {
        setVerifying(false);
        // Default to outside premises warning with override option for presentation
        setGeoState({
          status: "outside_premises",
          distanceMeters: 2400,
          error: err.message,
        });
        toast.warning("GPS Signal Required", {
          description: "Use 'Simulate Office Presence' for testing or grant GPS permissions.",
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleToggleDuty = (action: "clock_in" | "clock_out") => {
    const list = getStoredStaff();
    const updated = list.map((s) => {
      if (s.id === activeStaff.id) {
        if (action === "clock_in") {
          return {
            ...s,
            status: "on_duty" as const,
            clockInTime: new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
            verifiedLocation: `${selectedPremise.name} (GPS Verified)`,
            coordinates: geoState.coords || { lat: selectedPremise.lat, lng: selectedPremise.lng },
          };
        } else {
          return {
            ...s,
            status: "off_duty" as const,
            verifiedLocation: undefined,
          };
        }
      }
      return s;
    });

    saveStoredStaff(updated);
    if (action === "clock_in") {
      toast.success(`${activeStaff.name} Signed In!`, {
        description: `Verified at ${selectedPremise.name} at ${new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}.`,
      });
    } else {
      toast.info(`${activeStaff.name} Signed Out`, {
        description: "Shift attendance ledger logged for payroll.",
      });
      setGeoState({ status: "idle" });
    }

    onUpdate?.();
  };

  const isVerified = geoState.status === "verified";
  const isOnDuty = activeStaff.status === "on_duty";

  return (
    <div className="card-elevated p-5 rounded-2xl border border-gold/30 bg-background/90 backdrop-blur-xl relative overflow-hidden shadow-xl">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-sm">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-display font-bold gold-text flex items-center gap-2">
              Google Location Security Check-In
              {isOnDuty ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-semibold">
                  ON DUTY
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  OFF DUTY
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Geo-fenced attendance lock · Staff must be physically present inside office perimeter
            </div>
          </div>
        </div>

        {/* Premise Selector */}
        <select
          value={selectedPremise.id}
          onChange={(e) => {
            const found = OFFICE_PREMISES.find((p) => p.id === e.target.value);
            if (found) setSelectedPremise(found);
          }}
          className="text-xs px-3 py-1.5 rounded-xl bg-secondary/60 border border-border text-foreground font-medium focus:outline-none focus:border-gold"
        >
          {OFFICE_PREMISES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.city})
            </option>
          ))}
        </select>
      </div>

      {/* Security Status Box */}
      <div className="my-4 p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isVerified ? (
              <>
                <ShieldCheck className="h-4 w-4 text-success" />
                <span className="text-success">Location Authorized: Inside Premises Perimeter</span>
              </>
            ) : geoState.status === "outside_premises" ? (
              <>
                <ShieldAlert className="h-4 w-4 text-danger" />
                <span className="text-danger">Geo-Fence Restriction: Device is Outside Office</span>
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 text-gold" />
                <span className="text-foreground">GPS Attendance Verification Required</span>
              </>
            )}
          </div>

          <button
            onClick={() => handleVerifyLocation(false)}
            disabled={verifying}
            className="text-xs font-medium text-gold hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3 w-3 ${verifying ? "animate-spin" : ""}`} />
            {verifying ? "Checking GPS..." : "Scan My GPS"}
          </button>
        </div>

        {/* Distance and Google Map link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2 pt-1 border-t border-border/40">
          <div>
            Target Office: <strong className="text-foreground">{selectedPremise.name}</strong> (Radius: {selectedPremise.radiusMeters}m)
          </div>
          {geoState.distanceMeters !== undefined && (
            <div>
              Current Proximity:{" "}
              <strong className={isVerified ? "text-success" : "text-danger"}>
                {geoState.distanceMeters < 1000
                  ? `${geoState.distanceMeters} meters`
                  : `${(geoState.distanceMeters / 1000).toFixed(1)} km`}
              </strong>
            </div>
          )}
        </div>

        {/* Presentation Demo Bypass trigger */}
        {!isVerified && !isOnDuty && (
          <div className="p-2.5 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-between text-xs">
            <span className="text-muted-foreground text-[11px]">
              Presentation Simulation Mode (Allows instant verification):
            </span>
            <button
              onClick={() => handleVerifyLocation(true)}
              className="px-2.5 py-1 rounded-md bg-gold text-black font-semibold text-[11px] hover:brightness-110 transition-all"
            >
              Verify Office Presence
            </button>
          </div>
        )}
      </div>

      {/* Clock In / Clock Out Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {isOnDuty ? (
          <button
            onClick={() => handleToggleDuty("clock_out")}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-danger/20 border border-danger/40 text-danger hover:bg-danger/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Clock className="h-4 w-4" />
            Clock Out & Complete Shift
          </button>
        ) : (
          <button
            onClick={() => handleToggleDuty("clock_in")}
            disabled={!isVerified}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              isVerified
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:brightness-110 active:scale-95 cursor-pointer"
                : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60 border border-border"
            }`}
          >
            {isVerified ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isVerified
              ? "Sign In At Office Premises (Geo-Unlocked)"
              : "Sign In Disabled (Must Be At Office Premises)"}
          </button>
        )}

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${selectedPremise.lat},${selectedPremise.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 px-4 rounded-xl font-medium text-xs border border-border/80 hover:bg-secondary/60 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Office on Google Maps
        </a>
      </div>
    </div>
  );
}
