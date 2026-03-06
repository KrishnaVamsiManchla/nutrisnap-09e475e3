import { Brain, Moon, Calendar, AlertTriangle } from "lucide-react";

interface DayData {
  date: string;
  calories: number;
  protein: number;
  entries: { meal_type: string; calories: number; created_at: string }[];
}

interface MealPatternInsightsProps {
  dailyData: DayData[];
  calorieGoal: number;
  proteinGoal: number;
}

interface Insight {
  icon: typeof Moon;
  text: string;
  type: "warning" | "info";
}

const MealPatternInsights = ({ dailyData, calorieGoal, proteinGoal }: MealPatternInsightsProps) => {
  if (dailyData.length < 3) return null;

  const insights: Insight[] = [];

  // Late night eating (after 9PM)
  const lateNightDays = dailyData.filter((d) =>
    d.entries.some((e) => {
      const h = new Date(e.created_at).getHours();
      return h >= 21;
    })
  );
  if (lateNightDays.length >= 2) {
    const lateCalories = lateNightDays.reduce((sum, d) => {
      return sum + d.entries.filter((e) => new Date(e.created_at).getHours() >= 21).reduce((s, e) => s + e.calories, 0);
    }, 0);
    const avgLate = Math.round(lateCalories / lateNightDays.length);
    insights.push({
      icon: Moon,
      text: `Late-night eating detected on ${lateNightDays.length} days (~${avgLate} kcal avg after 9PM).`,
      type: "warning",
    });
  }

  // Weekend calorie spikes
  const weekends = dailyData.filter((d) => {
    const day = new Date(d.date).getDay();
    return day === 0 || day === 6;
  });
  const weekdays = dailyData.filter((d) => {
    const day = new Date(d.date).getDay();
    return day > 0 && day < 6;
  });
  if (weekends.length >= 2 && weekdays.length >= 3) {
    const avgWeekend = weekends.reduce((s, d) => s + d.calories, 0) / weekends.length;
    const avgWeekday = weekdays.reduce((s, d) => s + d.calories, 0) / weekdays.length;
    if (avgWeekend > avgWeekday * 1.2) {
      insights.push({
        icon: Calendar,
        text: `Weekend calories are ${Math.round(((avgWeekend / avgWeekday) - 1) * 100)}% higher than weekdays.`,
        type: "info",
      });
    }
  }

  // Low protein days
  const lowProteinDays = dailyData.filter((d) => d.protein < proteinGoal * 0.7);
  if (lowProteinDays.length >= 2) {
    insights.push({
      icon: AlertTriangle,
      text: `${lowProteinDays.length} days with low protein (<70% of goal). Prioritize protein-rich meals.`,
      type: "warning",
    });
  }

  if (insights.length === 0) return null;

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meal Patterns</h2>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
                insight.type === "warning"
                  ? "bg-amber-500/5 text-amber-700 dark:text-amber-400"
                  : "bg-primary/5 text-primary"
              }`}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MealPatternInsights;
