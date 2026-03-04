import { useState, useRef, useCallback, useEffect } from "react";
import { Settings2, X, Droplets, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

interface GoalsEditorProps {
  goals: Goals;
  onSave: (goals: Goals) => void;
  saving?: boolean;
  suggestedCalories?: number;
  weightKg?: number;
  goal?: "cut" | "maintain" | "bulk";
}

type DraftValues = Record<keyof Goals, string>;

const MACRO_FIELDS: { key: keyof Goals; label: string; unit: string; placeholder: string }[] = [
  { key: "protein_g", label: "Protein", unit: "g", placeholder: "e.g. 140" },
  { key: "carbs_g", label: "Carbs", unit: "g", placeholder: "e.g. 250" },
  { key: "fat_g", label: "Fat", unit: "g", placeholder: "e.g. 65" },
];

const VALIDATION_LABELS: Record<keyof Goals, string> = {
  calories: "calorie target",
  protein_g: "protein target",
  carbs_g: "carbs target",
  fat_g: "fat target",
  water_ml: "water target",
};

function toDraftStrings(g: Goals): DraftValues {
  return {
    calories: String(g.calories),
    protein_g: String(g.protein_g),
    carbs_g: String(g.carbs_g),
    fat_g: String(g.fat_g),
    water_ml: String(g.water_ml),
  };
}

function calcAutoMacros(calories: number, weightKg: number, goal: string) {
  // Protein: g/kg based on goal
  let proteinPerKg = 1.8;
  if (goal === "cut") proteinPerKg = 2.0;
  else if (goal === "maintain") proteinPerKg = 1.6;
  // else bulk = 1.8

  let proteinG = Math.round(weightKg * proteinPerKg);
  // Minimum: 0.8g/kg
  proteinG = Math.max(proteinG, Math.round(weightKg * 0.8));

  // Fat: 25% of calories, minimum 20%
  let fatCals = calories * 0.25;
  if (fatCals < calories * 0.2) fatCals = calories * 0.2;
  const fatG = Math.round(fatCals / 9);

  // Carbs: remaining
  const proteinCals = proteinG * 4;
  const remainingCals = Math.max(0, calories - proteinCals - fatCals);
  const carbsG = Math.round(remainingCals / 4);

  return { protein_g: proteinG, carbs_g: carbsG, fat_g: fatG };
}

const ALL_KEYS: (keyof Goals)[] = ["calories", "protein_g", "carbs_g", "fat_g", "water_ml"];

const GoalsEditor = ({ goals, onSave, saving, suggestedCalories, weightKg, goal: userGoal }: GoalsEditorProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftValues>(() => toDraftStrings(goals));
  const [errors, setErrors] = useState<Partial<Record<keyof Goals, string>>>({});
  const [focusedField, setFocusedField] = useState<keyof Goals | null>(null);
  const [autoBalance, setAutoBalance] = useState(true);
  const inputRefs = useRef<Partial<Record<keyof Goals, HTMLInputElement | null>>>({});

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(toDraftStrings(goals));
      setErrors({});
      setFocusedField(null);
      setAutoBalance(true);
    }
    setOpen(isOpen);
  };

  const hasChanges = ALL_KEYS.some((k) => draft[k] !== String(goals[k]));

  // Re-run auto-balance whenever calories, weightKg, or goal change (while toggle is ON)
  useEffect(() => {
    if (!autoBalance || !weightKg || !open) return;
    const calNum = Number(draft.calories);
    if (calNum <= 0) return;
    const macros = calcAutoMacros(calNum, weightKg, userGoal || "maintain");
    setDraft((prev) => ({
      ...prev,
      protein_g: String(macros.protein_g),
      carbs_g: String(macros.carbs_g),
      fat_g: String(macros.fat_g),
    }));
    // Only react to these specific dependencies — draft.calories is included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.calories, weightKg, userGoal, autoBalance, open]);

  const handleSave = () => {
    const newErrors: Partial<Record<keyof Goals, string>> = {};
    for (const key of ALL_KEYS) {
      if (!draft[key].trim()) {
        newErrors[key] = `Please enter a ${VALIDATION_LABELS[key]}.`;
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      calories: Number(draft.calories),
      protein_g: Number(draft.protein_g),
      carbs_g: Number(draft.carbs_g),
      fat_g: Number(draft.fat_g),
      water_ml: Number(draft.water_ml),
    });
    setOpen(false);
  };

  const updateField = (key: keyof Goals, value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));

    // If calories changed and auto-balance is on, recalculate macros
    if (key === "calories" && autoBalance && weightKg) {
      const calNum = Number(value);
      if (calNum > 0) {
        const macros = calcAutoMacros(calNum, weightKg, userGoal || "maintain");
        setDraft((prev) => ({
          ...prev,
          [key]: value,
          protein_g: String(macros.protein_g),
          carbs_g: String(macros.carbs_g),
          fat_g: String(macros.fat_g),
        }));
      }
    }

    // If user manually edits a macro field, disable auto-balance
    if ((key === "protein_g" || key === "carbs_g" || key === "fat_g") && autoBalance) {
      setAutoBalance(false);
    }
  };

  const handleToggleAutoBalance = (checked: boolean) => {
    setAutoBalance(checked);
    if (checked && draft.calories && weightKg) {
      applyAutoBalance(draft.calories);
    }
  };

  const clearField = (key: keyof Goals) => {
    setDraft((prev) => ({ ...prev, [key]: "" }));
    if ((key === "protein_g" || key === "carbs_g" || key === "fat_g") && autoBalance) {
      setAutoBalance(false);
    }
    inputRefs.current[key]?.focus();
  };

  const ClearButton = ({ field }: { field: keyof Goals }) => {
    if (focusedField !== field || !draft[field]) return null;
    return (
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => clearField(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    );
  };

  const FieldError = ({ field }: { field: keyof Goals }) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[11px] text-destructive/70 pl-0.5 animate-fade-in">{errors[field]}</p>
    );
  };

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-lg rounded-t-3xl bg-card/95 backdrop-blur-xl">
        <div className="px-6 pb-8 pt-2">
          {/* Handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

          <DrawerHeader className="p-0 mb-6">
            <DrawerTitle className="text-xl font-semibold text-foreground">Daily Goals</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-7">
            {/* Section 1: Calories — Primary */}
            <section className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Calories
              </Label>
              <div className="relative">
                <Input
                  ref={(el) => { inputRefs.current.calories = el; }}
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 2500"
                  value={draft.calories}
                  onChange={(e) => updateField("calories", e.target.value)}
                  onFocus={() => setFocusedField("calories")}
                  onBlur={() => setFocusedField(null)}
                  className={`h-14 text-2xl font-medium pr-16 rounded-2xl bg-background border-border/60 transition-colors ${
                    errors.calories ? "border-destructive/50 focus-visible:ring-destructive/30" : ""
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60 pointer-events-none">
                  kcal
                </span>
                <ClearButton field="calories" />
              </div>
              <FieldError field="calories" />
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                Your total daily energy target.
              </p>
              {suggestedCalories && suggestedCalories !== Number(draft.calories) && (
                <button
                  type="button"
                  onClick={() => updateField("calories", String(suggestedCalories))}
                  className="text-[12px] text-primary/80 hover:text-primary transition-colors"
                >
                  Suggested: {suggestedCalories} kcal based on activity level
                </button>
              )}
            </section>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Section 2: Macros */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Macros
                </Label>
                {/* Auto-balance status tag */}
                {weightKg ? (
                  autoBalance ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-2.5 w-2.5" />
                      Auto-balanced
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground/50">
                      Manual mode
                    </span>
                  )
                ) : null}
              </div>

              {/* Auto-balance toggle */}
              {weightKg ? (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[13px] text-foreground/80">Auto-balance macros</span>
                  <Switch
                    checked={autoBalance}
                    onCheckedChange={handleToggleAutoBalance}
                  />
                </div>
              ) : null}

              <div className="space-y-3">
                {MACRO_FIELDS.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground w-16 shrink-0">{f.label}</span>
                      <div className="relative flex-1">
                        <Input
                          ref={(el) => { inputRefs.current[f.key] = el; }}
                          type="text"
                          inputMode="decimal"
                          placeholder={f.placeholder}
                          value={draft[f.key]}
                          onChange={(e) => updateField(f.key, e.target.value)}
                          onFocus={() => setFocusedField(f.key)}
                          onBlur={() => setFocusedField(null)}
                          className={`h-10 pr-10 rounded-xl bg-background border-border/60 text-right text-sm transition-colors ${
                            errors[f.key] ? "border-destructive/50 focus-visible:ring-destructive/30" : ""
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                          {f.unit}
                        </span>
                        <ClearButton field={f.key} />
                      </div>
                    </div>
                    <FieldError field={f.key} />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/60">
                {autoBalance && weightKg
                  ? "Macros adjust automatically when calories change."
                  : "Manually set your macro targets."}
              </p>
            </section>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Section 3: Hydration */}
            <section className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} />
                Hydration
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground w-16 shrink-0">Water</span>
                <div className="relative flex-1">
                  <Input
                    ref={(el) => { inputRefs.current.water_ml = el; }}
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 2500"
                    value={draft.water_ml}
                    onChange={(e) => updateField("water_ml", e.target.value)}
                    onFocus={() => setFocusedField("water_ml")}
                    onBlur={() => setFocusedField(null)}
                    className={`h-10 pr-10 rounded-xl bg-background border-border/60 text-right text-sm transition-colors ${
                      errors.water_ml ? "border-destructive/50 focus-visible:ring-destructive/30" : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                    ml
                  </span>
                  <ClearButton field="water_ml" />
                </div>
              </div>
              <FieldError field="water_ml" />
              <p className="text-[11px] text-muted-foreground/60">
                Recommended: 2–3 litres daily.
              </p>
            </section>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="w-full h-12 rounded-2xl text-sm font-medium bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/80 shadow-sm"
            >
              {saving ? "Saving…" : "Save Goals"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GoalsEditor;
