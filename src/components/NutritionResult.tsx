import { Flame, Beef, Wheat, Droplets, Leaf, CandyCane, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [edited, setEdited] = useState({
    calories: Math.round(data.calories),
    protein_g: Math.round(data.protein_g),
    carbs_g: Math.round(data.carbs_g),
    fat_g: Math.round(data.fat_g),
  });

  const updateField = (field: keyof typeof edited, value: string) => {
    const num = parseInt(value) || 0;
    setEdited((prev) => ({ ...prev, [field]: num }));
  };

  const macroItems = [
    { label: "Protein", field: "protein_g" as const, unit: "g", icon: Beef, color: "hsl(var(--health-red))" },
    { label: "Carbs", field: "carbs_g" as const, unit: "g", icon: Wheat, color: "hsl(var(--health-orange))" },
    { label: "Fat", field: "fat_g" as const, unit: "g", icon: Droplets, color: "hsl(var(--health-blue))" },
  ];

  const detailItems = [
    { label: "Fiber", value: Math.round(data.fiber_g), unit: "g", icon: Leaf },
    { label: "Sugar", value: Math.round(data.sugar_g), unit: "g", icon: CandyCane },
    { label: "Sodium", value: Math.round(data.sodium_mg), unit: "mg", icon: Zap },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Food name + serving */}
      <div className="text-center">
        <h3 className="text-lg font-bold">{data.food_name}</h3>
        {data.serving_size && (
          <p className="text-sm text-muted-foreground mt-0.5">{data.serving_size}</p>
        )}
      </div>

      {/* Editable calorie ring-like display */}
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-primary/5 border border-primary/10 p-5">
        <Flame className="h-6 w-6 text-primary" />
        <div className="flex items-baseline gap-1">
          <Input
            type="number"
            value={edited.calories}
            onChange={(e) => updateField("calories", e.target.value)}
            className="w-24 text-center text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
          />
          <span className="text-sm text-muted-foreground font-medium">kcal</span>
        </div>
      </div>

      {/* Editable macro cards */}
      <div className="grid grid-cols-3 gap-2">
        {macroItems.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1 rounded-2xl bg-muted/50 p-3">
            <m.icon className="h-4 w-4" style={{ color: m.color }} />
            <div className="flex items-baseline gap-0.5">
              <Input
                type="number"
                value={edited[m.field]}
                onChange={(e) => updateField(m.field, e.target.value)}
                className="w-12 text-center text-sm font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
              />
              <span className="text-xs text-muted-foreground">{m.unit}</span>
            </div>
            <span className="text-xs text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Detail row */}
      <div className="flex justify-between rounded-2xl bg-muted/30 px-4 py-3">
        {detailItems.map((d) => (
          <div key={d.label} className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <span className="text-sm font-semibold">{d.value}{d.unit}</span>
          </div>
        ))}
      </div>

      {/* Meal type select */}
      <Select value={mealType} onValueChange={setMealType}>
        <SelectTrigger className="rounded-xl">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
          <SelectItem value="lunch">☀️ Lunch</SelectItem>
          <SelectItem value="dinner">🌙 Dinner</SelectItem>
          <SelectItem value="snack">🍿 Snack</SelectItem>
        </SelectContent>
      </Select>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5">
        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estimates may vary. Adjust portions and values above if needed for accuracy.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onDiscard} variant="outline" className="flex-1 rounded-xl">
          Discard
        </Button>
        <Button
          onClick={() => {
            // Merge edited values back before saving
            Object.assign(data, edited);
            onSave(mealType);
          }}
          disabled={saving}
          className="flex-1 rounded-xl"
        >
          {saving ? "Saving…" : "Confirm & Add"}
        </Button>
      </div>
    </div>
  );
};

export default NutritionResult;
