import { MessageCircle, AlertTriangle, TrendingUp, ThumbsUp } from "lucide-react";

interface FoodEntry {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
  meal_type: string;
}

interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SmartFeedbackProps {
  entries: FoodEntry[];
  goals: Goals;
  waterMl: number;
  waterGoalMl: number;
}

interface Tip {
  icon: typeof MessageCircle;
  text: string;
  type: "warning" | "info" | "success";
}

const SmartFeedback = ({ entries, goals, waterMl, waterGoalMl }: SmartFeedbackProps) => {
  if (entries.length === 0) return null;

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories),
      protein: acc.protein + Number(e.protein_g),
      carbs: acc.carbs + Number(e.carbs_g),
      fat: acc.fat + Number(e.fat_g),
      sugar: acc.sugar + Number(e.sugar_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 }
  );

  const tips: Tip[] = [];

  const proteinPct = totals.protein / goals.protein;
  if (proteinPct < 0.5 && entries.length >= 2) {
    tips.push({ icon: AlertTriangle, text: "You're low on protein today. Try adding chicken, eggs, or Greek yogurt.", type: "warning" });
  } else if (proteinPct >= 1) {
    tips.push({ icon: ThumbsUp, text: "Great protein intake today! 💪", type: "success" });
  }

  if (totals.sugar > 50) {
    tips.push({ icon: AlertTriangle, text: `High sugar intake detected (${Math.round(totals.sugar)}g). Watch out for hidden sugars.`, type: "warning" });
  }

  const mealCalories: Record<string, number> = {};
  entries.forEach((e) => {
    mealCalories[e.meal_type] = (mealCalories[e.meal_type] || 0) + Number(e.calories);
  });

  const heaviestMeal = Object.entries(mealCalories).sort((a, b) => b[1] - a[1])[0];
  if (heaviestMeal && totals.calories > 0) {
    const mealPct = Math.round((heaviestMeal[1] / totals.calories) * 100);
    if (mealPct >= 55 && Object.keys(mealCalories).length > 1) {
      const mealName = heaviestMeal[0].charAt(0).toUpperCase() + heaviestMeal[0].slice(1);
      tips.push({ icon: TrendingUp, text: `Your ${mealName.toLowerCase()} is ${mealPct}% of total calories. Try spreading meals more evenly.`, type: "info" });
    }
  }

  const overBy = Math.round(totals.calories - goals.calories);
  if (overBy >= 300) {
    tips.push({ icon: TrendingUp, text: `You're ${overBy} kcal above target — a lighter meal tomorrow keeps the weekly average on track. 📊`, type: "info" });
  } else if (totals.calories >= goals.calories * 0.9 && totals.calories <= goals.calories * 1.05) {
    tips.push({ icon: ThumbsUp, text: "You're right on track with your calorie goal! 🎯", type: "success" });
  }

  if (totals.fat > goals.fat * 1.2) {
    tips.push({ icon: AlertTriangle, text: "Fat intake is above target. Opt for leaner options.", type: "warning" });
  }

  if (waterMl < waterGoalMl * 0.4 && entries.length >= 2) {
    tips.push({ icon: MessageCircle, text: "Don't forget to drink water! You're behind on hydration. 💧", type: "info" });
  }

  if (tips.length === 0) return null;

  const typeStyles: Record<string, string> = {
    warning: "bg-warning/5 text-foreground",
    info: "bg-primary/5 text-foreground",
    success: "bg-success/5 text-foreground",
  };

  const iconStyles: Record<string, string> = {
    warning: "text-warning",
    info: "text-primary",
    success: "text-success",
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coach Tips</span>
      </div>
      {tips.slice(0, 3).map((tip, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed animate-fade-in ${typeStyles[tip.type]}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <tip.icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconStyles[tip.type]}`} strokeWidth={1.5} />
          <span>{tip.text}</span>
        </div>
      ))}
    </div>
  );
};

export default SmartFeedback;
