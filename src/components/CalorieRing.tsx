interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

const CalorieRing = ({ consumed, target, size = 180 }: CalorieRingProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / target, 1.5);
  const offset = circumference - pct * circumference;
  const isOver = consumed > target;
  const remaining = Math.max(0, target - consumed);
  const gradientId = isOver ? "ring-grad-over" : "ring-grad";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(217 91% 72%)" />
            </linearGradient>
            <linearGradient id="ring-grad-over" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="100%" stopColor="hsl(0 72% 60%)" />
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
            opacity={0.6}
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
          <span className="text-4xl font-semibold tracking-tight text-foreground">{Math.round(consumed)}</span>
          <span className="text-xs text-muted-foreground mt-0.5">of {target} kcal</span>
        </div>
      </div>
      <p className={`text-sm font-medium ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
        {isOver
          ? `${Math.round(consumed - target)} kcal over`
          : `${Math.round(remaining)} kcal remaining`}
      </p>
    </div>
  );
};

export default CalorieRing;
