import { useState } from "react";
import { Lightbulb, Loader2, ArrowDown, Beef } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  emoji: string;
  tag: "lower-cal" | "high-protein";
  why: string;
}

interface MealSuggestionsProps {
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const MealSuggestions = ({ foodName, calories, proteinG, carbsG, fatG }: MealSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("meal-suggestions", {
        body: { food_name: foodName, calories, protein_g: proteinG, carbs_g: carbsG, fat_g: fatG },
      });
      if (error) throw error;
      if (data?.suggestions) setSuggestions(data.suggestions);
    } catch {
      // Silently fail — suggestions are non-critical
    } finally {
      setLoading(false);
    }
  };

  if (suggestions) {
    return (
      <div className="space-y-2 animate-fade-in">
        <div className="flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Swap Ideas
          </span>
        </div>
        {suggestions.map((s, i) => {
          const saved = calories - s.calories;
          return (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border bg-muted/20 px-3 py-2.5"
            >
              <span className="text-lg mt-0.5">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  {s.tag === "lower-cal" && saved > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                      <ArrowDown className="h-2.5 w-2.5" />
                      {saved} kcal
                    </span>
                  )}
                  {s.tag === "high-protein" && (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                      <Beef className="h-2.5 w-2.5" />
                      {s.protein_g}g protein
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.why}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {s.calories} kcal · P:{s.protein_g}g · C:{s.carbs_g}g · F:{s.fat_g}g
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full gap-1.5 text-xs text-muted-foreground"
      onClick={fetchSuggestions}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Lightbulb className="h-3 w-3" />
      )}
      {loading ? "Finding alternatives…" : "See healthier swap ideas"}
    </Button>
  );
};

export default MealSuggestions;
