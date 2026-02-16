import { useState, useEffect } from "react";
import { Target, TrendingDown, TrendingUp, AlertTriangle, Clock, Flame, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const WeightProjection = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    currentWeight: number;
    goalWeight: number;
    avgDailyCalories: number;
    maintenanceCalories: number;
    deficit: number;
    weeklyChange: number;
    weeksToGoal: number;
    direction: "cut" | "bulk" | "maintain";
    isAggressive: boolean;
    daysLogged: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [profileRes, goalsRes, foodRes] = await Promise.all([
        supabase.from("user_profiles").select("weight_kg, goal_weight_kg, goal, age, gender, height_cm, activity_level").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_goals").select("calories").eq("user_id", user.id).maybeSingle(),
        supabase.from("food_entries").select("calories, created_at").gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      ]);

      const profile = profileRes.data;
      const goals = goalsRes.data;
      const foods = foodRes.data || [];

      if (!profile?.weight_kg || !goals?.calories) return;

      // Group by day to get average
      const daySet = new Set<string>();
      let totalCals = 0;
      foods.forEach((e: any) => {
        const day = new Date(e.created_at).toDateString();
        daySet.add(day);
        totalCals += Number(e.calories);
      });

      const daysLogged = daySet.size || 1;
      const avgDailyCalories = Math.round(totalCals / daysLogged);
      const maintenanceCalories = goals.calories; // TDEE-based target from their calculator
      const currentWeight = Number(profile.weight_kg);
      const goalWeight = profile.goal_weight_kg ? Number(profile.goal_weight_kg) : currentWeight;
      const goal = (profile.goal as string) || "maintain";

      const deficit = avgDailyCalories - maintenanceCalories; // negative = deficit, positive = surplus
      // 1 kg fat ≈ 7700 kcal
      const weeklyChange = (deficit * 7) / 7700; // kg per week
      const weightToChange = goalWeight - currentWeight;
      const weeksToGoal = weeklyChange !== 0 ? Math.abs(weightToChange / weeklyChange) : Infinity;

      const direction: "cut" | "bulk" | "maintain" = goal === "cut" ? "cut" : goal === "bulk" ? "bulk" : "maintain";

      // Aggressive = more than ~1kg/week loss or deficit > 1000 kcal
      const isAggressive = direction === "cut" && deficit < -1000;

      setData({ currentWeight, goalWeight, avgDailyCalories, maintenanceCalories, deficit, weeklyChange, weeksToGoal, direction, isAggressive, daysLogged });
    };

    load();
  }, [user]);

  if (!data) return null;

  const { currentWeight, goalWeight, avgDailyCalories, maintenanceCalories, deficit, weeklyChange, weeksToGoal, direction, isAggressive, daysLogged } = data;

  const atGoal = Math.abs(currentWeight - goalWeight) < 0.5;
  const deficitAbs = Math.abs(deficit);
  const weeklyChangeAbs = Math.abs(weeklyChange);

  const formatWeeks = (w: number) => {
    if (!isFinite(w) || w > 200) return "a long time";
    if (w < 1) return "less than a week";
    const months = Math.floor(w / 4.3);
    const remWeeks = Math.round(w % 4.3);
    if (months === 0) return `~${Math.round(w)} week${Math.round(w) !== 1 ? "s" : ""}`;
    if (remWeeks === 0) return `~${months} month${months !== 1 ? "s" : ""}`;
    return `~${months} month${months !== 1 ? "s" : ""} ${remWeeks} week${remWeeks !== 1 ? "s" : ""}`;
  };

  return (
    <section className="rounded-2xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Weight Projection</h2>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Scale className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Current</span>
          </div>
          <p className="text-lg font-bold">{currentWeight} kg</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Goal</span>
          </div>
          <p className="text-lg font-bold">{goalWeight} kg</p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg Intake</span>
          </div>
          <p className="text-lg font-bold">{avgDailyCalories}</p>
          <p className="text-[10px] text-muted-foreground">kcal/day ({daysLogged}d avg)</p>
        </div>
        <div className={`rounded-xl p-3 ${deficit < 0 ? "bg-green-500/10" : deficit > 0 ? "bg-orange-500/10" : "bg-muted/40"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            {deficit <= 0 ? <TrendingDown className="h-3.5 w-3.5 text-green-600 dark:text-green-400" /> : <TrendingUp className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />}
            <span className="text-xs text-muted-foreground">{deficit <= 0 ? "Deficit" : "Surplus"}</span>
          </div>
          <p className={`text-lg font-bold ${deficit < 0 ? "text-green-700 dark:text-green-400" : deficit > 0 ? "text-orange-700 dark:text-orange-400" : ""}`}>
            {deficitAbs} kcal
          </p>
          <p className="text-[10px] text-muted-foreground">per day</p>
        </div>
      </div>

      {/* Projection text */}
      <div className="rounded-xl bg-muted/30 px-4 py-3 space-y-2">
        {atGoal ? (
          <p className="text-sm text-muted-foreground">
            🎉 <strong className="text-foreground">You're at your goal weight!</strong> Keep maintaining your current habits.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              At your current pace, you're {deficit < 0 ? "losing" : "gaining"}{" "}
              <strong className="text-foreground">~{weeklyChangeAbs.toFixed(2)} kg/week</strong>.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              Estimated time to goal: <strong className="text-foreground">{formatWeeks(weeksToGoal)}</strong>
            </p>
            {direction === "cut" && deficit >= 0 && (
              <p className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-1.5 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                You're currently eating at or above maintenance. Reduce intake slightly to start losing weight.
              </p>
            )}
            {direction === "bulk" && deficit <= 0 && (
              <p className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-1.5 mt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                You're eating below maintenance. Increase intake to support muscle gain.
              </p>
            )}
          </>
        )}

        {isAggressive && (
          <p className="text-sm text-orange-700 dark:text-orange-400 flex items-start gap-1.5 mt-1">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Your deficit is over 1,000 kcal/day — that's quite aggressive. A 500–750 kcal deficit is healthier and more sustainable long-term.
          </p>
        )}
      </div>
    </section>
  );
};

export default WeightProjection;
