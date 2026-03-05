import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface GoalSummaryCardProps {
  goal: "cut" | "maintain" | "bulk";
  currentWeight: number;
  targetWeight: number;
  weeklyDeficitKcal: number;
  tdee: number;
  calories: number;
}

const GOAL_LABELS: Record<string, string> = {
  cut: "Fat Loss",
  maintain: "Maintain",
  bulk: "Build Muscle",
};

const GOAL_ICONS: Record<string, typeof TrendingDown> = {
  cut: TrendingDown,
  maintain: Minus,
  bulk: TrendingUp,
};

const GoalSummaryCard = ({ goal, currentWeight, targetWeight, weeklyDeficitKcal, tdee, calories }: GoalSummaryCardProps) => {
  const Icon = GOAL_ICONS[goal] || Minus;

  const getEta = () => {
    if (goal === "cut") {
      const weeklyDeficit = (tdee - calories) * 7;
      const weeklyFatLossKg = weeklyDeficit / 7700;
      if (weeklyFatLossKg <= 0) return null;
      const weightToLose = currentWeight - targetWeight;
      if (weightToLose <= 0) return "At goal weight";
      const weeks = weightToLose / weeklyFatLossKg;
      const low = Math.floor(weeks);
      const high = Math.ceil(weeks * 1.2);
      return `${low}–${high} weeks`;
    }
    if (goal === "bulk") {
      const weightToGain = targetWeight - currentWeight;
      if (weightToGain <= 0) return "At goal weight";
      const months = weightToGain / 0.25;
      return `~${Math.round(months)} months`;
    }
    return null;
  };

  const eta = getEta();

  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal Summary</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">Goal</p>
          <p className="font-medium text-foreground">{GOAL_LABELS[goal]}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Current</p>
          <p className="font-medium text-foreground">{currentWeight} kg</p>
        </div>
        {goal !== "maintain" && (
          <div>
            <p className="text-muted-foreground text-xs">Target</p>
            <p className="font-medium text-foreground">{targetWeight} kg</p>
          </div>
        )}
        {eta && (
          <div>
            <p className="text-muted-foreground text-xs">ETA</p>
            <p className="font-medium text-primary">{eta}</p>
          </div>
        )}
        {goal === "maintain" && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Maintaining current weight target.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalSummaryCard;
