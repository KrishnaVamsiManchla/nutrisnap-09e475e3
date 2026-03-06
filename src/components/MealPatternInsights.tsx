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

  const lateNightDays = dailyData.filter((d) =>
    d.entries.some((e) => new Date(e.created_at).getHours() >= 21)
  );
  if (lateNightDays.length >= 2) {
    const lateCalories = lateNightDays.reduce((sum, d) => {
      return sum + d.entries.filter((e) => new Date(e.created_at).getHours() >= 21).reduce((s, e) => s + e.calories, 0);
    }, 0);
    const avgLate = Math.round(lateCalories / lateNightDays.length);
    insights.push({ icon: Moon, text: `Late-night eating on ${lateNightDays.length} days (~${avgLate} kcal avg after 9PM).`, type: "warning" });
  }

  const weekends = dailyData.filter((d) => { const day = new Date(d.date).getDay(); return day === 0 || day === 6; });
  const weekdays = dailyData.filter((d) => { const day = new Date(d.date).getDay(); return day > 0 && day < 6; });
  if (weekends.length >= 2 && weekdays.length >= 3) {
    const avgWeekend = weekends.reduce((s, d) => s + d.calories, 0) / weekends.length;
    const avgWeekday = weekdays.reduce((s, d) => s + d.calories, 0) / weekdays.length;
    if (avgWeekend > avgWeekday * 1.2) {
      insights.push({ icon: Calendar, text: `Weekend calories are ${Math.round(((avgWeekend / avgWeekday) - 1) * 100)}% higher than weekdays.`, type: "info" });
    }
  }

  const lowProteinDays = dailyData.filter((d) => d.protein < proteinGoal * 0.7);
  if (lowProteinDays.length >= 2) {
    insights.push({ icon: AlertTriangle, text: `${lowProteinDays.length} days with low protein (<70% of goal).`, type: "warning" });
  }

  if (insights.length === 0) return null;

  return (
    <section className="card-premium space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Brain className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meal Patterns</h2>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed animate-fade-in ${
                insight.type === "warning" ? "bg-warning/5 text-foreground" : "bg-primary/5 text-foreground"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${insight.type === "warning" ? "text-warning" : "text-primary"}`} strokeWidth={1.5} />
              <span>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MealPatternInsights;
