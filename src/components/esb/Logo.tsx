export function EsbLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[oklch(0.86_0.14_88)] to-[oklch(0.5_0.13_295)] opacity-90" />
        <div className="absolute inset-[3px] rounded-md bg-card flex items-center justify-center">
          <span className="gold-text text-[11px] font-black tracking-tighter">E</span>
        </div>
      </div>
      <span className="font-display text-lg font-semibold tracking-tight">
        <span className="gold-text">ESB</span>
        <span className="text-foreground/70 font-normal ml-1.5 text-sm">Brand</span>
      </span>
    </div>
  );
}
