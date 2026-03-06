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
      <div className="py-12 text-center">
        <Flame className="mx-auto mb-3 h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm font-medium text-muted-foreground">No meals logged yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Use the buttons above to add your first meal</p>
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
    <div className="space-y-5">
      {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
        const items = grouped[meal];
        if (!items?.length) return null;
        const meta = mealMeta[meal];
        const mealCals = items.reduce((s, e) => s + Number(e.calories), 0);

        return (
          <div key={meal}>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <span>{meta.emoji}</span>
                {meta.label}
              </h4>
              <span className="text-xs text-muted-foreground font-medium">{Math.round(mealCals)} kcal</span>
            </div>
            <div className="space-y-2">
              {items.map((entry) => {
                const isOpen = expanded[entry.id];
                return (
                  <div
                    key={entry.id}
                    className="card-premium overflow-hidden p-0"
                  >
                    <button
                      onClick={() => toggleEntry(entry.id)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left press-scale"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate text-foreground">{entry.food_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Math.round(entry.calories)} kcal
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 animate-fade-in">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            { label: "Protein", value: entry.protein_g },
                            { label: "Carbs", value: entry.carbs_g },
                            { label: "Fat", value: entry.fat_g },
                          ].map((m) => (
                            <div key={m.label} className="rounded-xl bg-muted/40 p-2.5 text-center">
                              <p className="text-[10px] text-muted-foreground mb-0.5">{m.label}</p>
                              <p className="text-sm font-semibold text-foreground">{Math.round(m.value)}g</p>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive hover:bg-destructive/8 rounded-xl"
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
