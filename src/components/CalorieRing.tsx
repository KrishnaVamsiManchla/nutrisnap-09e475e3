interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
}

const CalorieRing = ({ consumed, target, size = 160 }: CalorieRingProps) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / target, 1.5);
  const offset = circumference - pct * circumference;
  const isOver = consumed > target;

  const remaining = Math.max(0, target - consumed);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
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
            stroke={isOver ? "hsl(var(--health-red))" : "hsl(var(--health-green))"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={Math.max(0, offset)}
            className="calorie-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight">{Math.round(consumed)}</span>
          <span className="text-xs text-muted-foreground font-medium">of {target} kcal</span>
        </div>
      </div>
      <p className={`text-sm font-medium ${isOver ? "text-[hsl(var(--health-red))]" : "text-muted-foreground"}`}>
        {isOver
          ? `${Math.round(consumed - target)} kcal over`
          : `${Math.round(remaining)} kcal remaining`}
      </p>
    </div>
  );
};

export default CalorieRing;
