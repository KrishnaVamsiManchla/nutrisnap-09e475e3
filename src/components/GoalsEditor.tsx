import { useState, useRef } from "react";
import { Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
}

const FIELDS: { key: keyof Goals; label: string; unit: string; placeholder: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal", placeholder: "e.g. 2500" },
  { key: "protein_g", label: "Protein", unit: "g", placeholder: "e.g. 140" },
  { key: "carbs_g", label: "Carbs", unit: "g", placeholder: "e.g. 250" },
  { key: "fat_g", label: "Fat", unit: "g", placeholder: "e.g. 65" },
  { key: "water_ml", label: "Water", unit: "ml", placeholder: "e.g. 2500" },
];

type DraftValues = Record<keyof Goals, string>;

const GoalsEditor = ({ goals, onSave, saving }: GoalsEditorProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftValues>(() => toDraftStrings(goals));
  const [errors, setErrors] = useState<Partial<Record<keyof Goals, string>>>({});
  const [focusedField, setFocusedField] = useState<keyof Goals | null>(null);
  const inputRefs = useRef<Partial<Record<keyof Goals, HTMLInputElement | null>>>({});

  function toDraftStrings(g: Goals): DraftValues {
    return {
      calories: String(g.calories),
      protein_g: String(g.protein_g),
      carbs_g: String(g.carbs_g),
      fat_g: String(g.fat_g),
      water_ml: String(g.water_ml),
    };
  }

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraft(toDraftStrings(goals));
      setErrors({});
      setFocusedField(null);
    }
    setOpen(isOpen);
  };

  const hasChanges = FIELDS.some((f) => draft[f.key] !== String(goals[f.key]));

  const handleSave = () => {
    const newErrors: Partial<Record<keyof Goals, string>> = {};
    const LABELS: Record<keyof Goals, string> = {
      calories: "calorie target",
      protein_g: "protein target",
      carbs_g: "carbs target",
      fat_g: "fat target",
      water_ml: "water target",
    };

    for (const f of FIELDS) {
      const val = draft[f.key].trim();
      if (!val) {
        newErrors[f.key] = `Please enter a ${LABELS[f.key]}.`;
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
    // Allow empty or numeric input only
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const clearField = (key: keyof Goals) => {
    setDraft((prev) => ({ ...prev, [key]: "" }));
    inputRefs.current[key]?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings2 className="h-4 w-4" strokeWidth={1.5} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Daily Goals</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-1">
          {FIELDS.map((f) => {
            const isFocused = focusedField === f.key;
            const hasValue = draft[f.key] !== "";
            const error = errors[f.key];

            return (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground font-medium">
                  {f.label} <span className="text-muted-foreground/60">({f.unit})</span>
                </Label>
                <div className="relative">
                  <Input
                    ref={(el) => { inputRefs.current[f.key] = el; }}
                    type="text"
                    inputMode="decimal"
                    placeholder={f.placeholder}
                    value={draft[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    onFocus={() => setFocusedField(f.key)}
                    onBlur={() => setFocusedField(null)}
                    className={`pr-9 rounded-xl transition-colors ${
                      error ? "border-destructive/50 focus-visible:ring-destructive/30" : ""
                    }`}
                  />
                  {isFocused && hasValue && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => clearField(f.key)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
                {error && (
                  <p className="text-[11px] text-destructive/70 pl-0.5 animate-fade-in">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
          <Button
            onClick={handleSave}
            className="w-full h-11 rounded-xl text-sm font-medium"
            disabled={saving || !hasChanges}
          >
            {saving ? "Saving…" : "Save Goals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalsEditor;
