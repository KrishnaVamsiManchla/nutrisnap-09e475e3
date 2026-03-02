import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
  meal_type: string;
  created_at: string;
}

interface MealLogProps {
  entries: FoodEntry[];
  onDelete: (id: string) => void;
}

const mealMeta: Record<string, { emoji: string; label: string }> = {
  breakfast: { emoji: "🌅", label: "Breakfast" },
  lunch: { emoji: "☀️", label: "Lunch" },
  dinner: { emoji: "🌙", label: "Dinner" },
  snack: { emoji: "🍿", label: "Snacks" },
};

const MealLog = ({ entries, onDelete }: MealLogProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (entries.length === 0) {
    return (
      <div className="py-10 text-center">
        <Flame className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">No meals logged yet</p>
        <p className="text-xs text-muted-foreground/60">Use the buttons above to add your first meal</p>
      </div>
    );
  }

  const grouped = entries.reduce((acc, entry) => {
    const key = entry.meal_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const toggleEntry = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
        const items = grouped[meal];
        if (!items?.length) return null;
        const meta = mealMeta[meal];
        const mealCals = items.reduce((s, e) => s + Number(e.calories), 0);

        return (
          <div key={meal}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <span>{meta.emoji}</span>
                {meta.label}
              </h4>
              <span className="text-xs text-muted-foreground font-medium">{Math.round(mealCals)} kcal</span>
            </div>
            <div className="space-y-1.5">
              {items.map((entry) => {
                const isOpen = expanded[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl bg-card overflow-hidden transition-all shadow-sm"
                  >
                    <button
                      onClick={() => toggleEntry(entry.id)}
                      className="w-full flex items-center justify-between px-3.5 py-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{entry.food_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Math.round(entry.calories)} kcal
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3 animate-fade-in">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="rounded-lg bg-muted/50 p-2 text-center">
                            <p className="text-xs text-muted-foreground">Protein</p>
                            <p className="text-sm font-semibold">{Math.round(entry.protein_g)}g</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2 text-center">
                            <p className="text-xs text-muted-foreground">Carbs</p>
                            <p className="text-sm font-semibold">{Math.round(entry.carbs_g)}g</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2 text-center">
                            <p className="text-xs text-muted-foreground">Fat</p>
                            <p className="text-sm font-semibold">{Math.round(entry.fat_g)}g</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MealLog;
