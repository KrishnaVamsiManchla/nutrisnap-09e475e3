import { Trophy } from "lucide-react";

interface ConsistencyScoreProps {
  trackingDays: number;
  totalDays: number;
  proteinHitDays: number;
  calorieHitDays: number;
}

const ConsistencyScore = ({ trackingDays, totalDays, proteinHitDays, calorieHitDays }: ConsistencyScoreProps) => {
  const days = Math.max(totalDays, 1);
  const trackingPct = Math.round((trackingDays / days) * 100);
  const proteinPct = Math.round((proteinHitDays / days) * 100);
  const caloriePct = Math.round((calorieHitDays / days) * 100);
  const overall = Math.round((trackingPct + proteinPct + caloriePct) / 3);

  const metrics = [
    { label: "Tracking", pct: trackingPct, color: "bg-primary" },
    { label: "Protein", pct: proteinPct, color: "bg-emerald-500" },
    { label: "Calories", pct: caloriePct, color: "bg-amber-500" },
  ];

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Consistency Score</h2>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{overall}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Overall bar */}
      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${overall}%` }}
        />
      </div>

      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16 shrink-0">{m.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color} transition-all duration-700`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground w-8 text-right">{m.pct}%</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60">
        Based on the last {totalDays} days. Hit = within 10% of target.
      </p>
    </section>
  );
};

export default ConsistencyScore;
