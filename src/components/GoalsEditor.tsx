import { useState } from "react";
import { Settings2 } from "lucide-react";
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

const GoalsEditor = ({ goals, onSave, saving }: GoalsEditorProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Goals>(goals);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setDraft(goals);
    setOpen(isOpen);
  };

  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };

  const fields: { key: keyof Goals; label: string; unit: string }[] = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein_g", label: "Protein", unit: "g" },
    { key: "carbs_g", label: "Carbs", unit: "g" },
    { key: "fat_g", label: "Fat", unit: "g" },
    { key: "water_ml", label: "Water", unit: "ml" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Daily Goals</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label} ({f.unit})</Label>
              <Input
                type="number"
                value={draft[f.key]}
                onChange={(e) =>
                  setDraft({ ...draft, [f.key]: Number(e.target.value) || 0 })
                }
              />
            </div>
          ))}
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Save Goals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalsEditor;
