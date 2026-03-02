interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

const CalorieRing = ({ consumed, target, size = 170 }: CalorieRingProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / target, 1.5);
  const offset = circumference - pct * circumference;
  const isOver = consumed > target;
  const remaining = Math.max(0, target - consumed);
  const gradientId = isOver ? "ring-grad-over" : "ring-grad";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--health-blue) / 0.6)" />
            </linearGradient>
            <linearGradient id="ring-grad-over" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--health-red))" />
              <stop offset="100%" stopColor="hsl(var(--health-red) / 0.6)" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={Math.max(0, offset)}
            className="calorie-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-medium tracking-tight">{Math.round(consumed)}</span>
          <span className="text-xs text-muted-foreground">of {target} kcal</span>
        </div>
      </div>
      <p className={`text-sm font-normal ${isOver ? "text-[hsl(var(--health-red))]" : "text-muted-foreground"}`}>
        {isOver
          ? `${Math.round(consumed - target)} kcal over`
          : `${Math.round(remaining)} kcal remaining`}
      </p>
    </div>
  );
};

export default CalorieRing;
