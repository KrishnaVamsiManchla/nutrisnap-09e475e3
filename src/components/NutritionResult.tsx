import { Flame, Beef, Wheat, Droplets, Leaf, CandyCane, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface NutritionData {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  serving_size: string;
}

interface NutritionResultProps {
  data: NutritionData;
  onSave: (mealType: string) => void;
  onDiscard: () => void;
  saving: boolean;
}

const NutritionResult = ({ data, onSave, onDiscard, saving }: NutritionResultProps) => {
  const [mealType, setMealType] = useState("lunch");

  const macros = [
    { label: "Calories", value: data.calories, unit: "kcal", icon: Flame, color: "text-orange-500" },
    { label: "Protein", value: data.protein_g, unit: "g", icon: Beef, color: "text-red-500" },
    { label: "Carbs", value: data.carbs_g, unit: "g", icon: Wheat, color: "text-amber-500" },
    { label: "Fat", value: data.fat_g, unit: "g", icon: Droplets, color: "text-blue-500" },
    { label: "Fiber", value: data.fiber_g, unit: "g", icon: Leaf, color: "text-green-500" },
    { label: "Sugar", value: data.sugar_g, unit: "g", icon: CandyCane, color: "text-pink-500" },
    { label: "Sodium", value: data.sodium_mg, unit: "mg", icon: Zap, color: "text-yellow-500" },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-lg">{data.food_name}</h3>
          {data.serving_size && (
            <p className="text-sm text-muted-foreground">{data.serving_size}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {macros.map((m) => (
            <div key={m.label} className="flex items-center gap-2 rounded-xl bg-background p-2.5">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="font-semibold text-sm">
                  {typeof m.value === "number" ? Math.round(m.value) : m.value} {m.unit}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Select value={mealType} onValueChange={setMealType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
            <SelectItem value="lunch">☀️ Lunch</SelectItem>
            <SelectItem value="dinner">🌙 Dinner</SelectItem>
            <SelectItem value="snack">🍿 Snack</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={onDiscard} variant="outline" className="flex-1">
            Discard
          </Button>
          <Button onClick={() => onSave(mealType)} disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionResult;
