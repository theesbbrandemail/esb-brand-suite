type Bar = { label: string; gold: number; violet: number };

export function DualBarChart({ data, height = 140 }: { data: Bar[]; height?: number }) {
  const max = Math.max(...data.flatMap((d) => [d.gold, d.violet]));
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex items-end justify-center gap-1 h-full">
            <div
              className="w-2.5 rounded-t-sm bg-gradient-to-t from-[oklch(0.55_0.13_70)] to-[oklch(0.86_0.14_88)]"
              style={{ height: `${(d.gold / max) * 100}%` }}
            />
            <div
              className="w-2.5 rounded-t-sm bg-gradient-to-t from-[oklch(0.4_0.15_285)] to-[oklch(0.7_0.18_295)] opacity-80"
              style={{ height: `${(d.violet / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

export function LineSpark({ points, height = 80 }: { points: number[]; height?: number }) {
  const w = 300;
  const h = height;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - ((p - min) / range) * (h - 10) - 5] as const);
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.13 82)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.82 0.13 82)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#goldArea)" />
      <path d={path} fill="none" stroke="oklch(0.86 0.14 82)" strokeWidth="2" />
      {coords.map(([x, y], i) => (
        i === Math.floor(points.length / 2) ? (
          <circle key={i} cx={x} cy={y} r="4" fill="oklch(0.95 0.05 88)" stroke="oklch(0.82 0.13 82)" strokeWidth="2" />
        ) : null
      ))}
    </svg>
  );
}
