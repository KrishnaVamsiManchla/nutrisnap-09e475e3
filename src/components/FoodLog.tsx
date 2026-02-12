import { Trash2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: string;
  created_at: string;
}

interface FoodLogProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

const mealEmoji: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍿",
};

const FoodLog = ({ entries, onDelete }: FoodLogProps) => {
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Flame className="mx-auto mb-2 h-8 w-8 opacity-30" />
        <p className="text-sm">No entries yet today</p>
        <p className="text-xs">Snap a photo or type what you ate</p>
      </div>
    );
  }

  const grouped = entries.reduce((acc, entry) => {
    const key = entry.meal_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  return (
    <div className="space-y-4">
      {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
        const items = grouped[meal];
        if (!items?.length) return null;
        return (
          <div key={meal}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {mealEmoji[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </h4>
            <div className="space-y-1.5">
              {items.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{entry.food_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(entry.protein_g)}p · {Math.round(entry.carbs_g)}c · {Math.round(entry.fat_g)}f
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {Math.round(entry.calories)} kcal
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FoodLog;
