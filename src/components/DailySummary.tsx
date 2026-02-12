import { Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DailySummaryProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals?: { calories: number; protein: number; carbs: number; fat: number };
}

const DailySummary = ({ calories, protein, carbs, fat, goals }: DailySummaryProps) => {
  const g = goals || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  const items = [
    { label: "Calories", value: calories, goal: g.calories, unit: "kcal", icon: Flame, color: "bg-orange-500" },
    { label: "Protein", value: protein, goal: g.protein, unit: "g", icon: Beef, color: "bg-red-500" },
    { label: "Carbs", value: carbs, goal: g.carbs, unit: "g", icon: Wheat, color: "bg-amber-500" },
    { label: "Fat", value: fat, goal: g.fat, unit: "g", icon: Droplets, color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.value / item.goal) * 100));
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.round(item.value)} / {item.goal} {item.unit}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      })}
    </div>
  );
};

export default DailySummary;
