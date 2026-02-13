import { useState, useEffect } from "react";
import { Calculator } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProfileData {
  age: number;
  gender: "male" | "female";
  height_cm: number;
  weight_kg: number;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cut" | "maintain" | "bulk";
}

interface CalorieCalculatorProps {
  profile: ProfileData | null;
  onSave: (profile: ProfileData, tdee: number) => void;
  saving?: boolean;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very Active (2× daily)",
};

const GOAL_LABELS: Record<string, string> = {
  cut: "Cut (lose fat)",
  maintain: "Maintain weight",
  bulk: "Bulk (gain muscle)",
};

function calcBMR(gender: string, weight: number, height: number, age: number) {
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calcTDEE(bmr: number, activity: string, goal: string) {
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activity] || 1.2);
  if (goal === "cut") return Math.round(tdee - 400);
  if (goal === "bulk") return Math.round(tdee + 300);
  return Math.round(tdee);
}

const CalorieCalculator = ({ profile, onSave, saving }: CalorieCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileData>({
    age: 25,
    gender: "male",
    height_cm: 175,
    weight_kg: 70,
    activity_level: "moderate",
    goal: "maintain",
  });

  useEffect(() => {
    if (profile) setDraft(profile);
  }, [profile]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && profile) setDraft(profile);
    setOpen(isOpen);
  };

  const bmr = calcBMR(draft.gender, draft.weight_kg, draft.height_cm, draft.age);
  const rawTDEE = bmr * (ACTIVITY_MULTIPLIERS[draft.activity_level] || 1.2);
  const adjustedTDEE = calcTDEE(bmr, draft.activity_level, draft.goal);

  const handleSave = () => {
    onSave(draft, adjustedTDEE);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Calculator className="h-3.5 w-3.5" />
          Smart Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalized Calorie Calculator</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={draft.gender}
              onValueChange={(v) => setDraft({ ...draft, gender: v as "male" | "female" })}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input
                type="number"
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={draft.height_cm}
                onChange={(e) => setDraft({ ...draft, height_cm: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={draft.weight_kg}
                onChange={(e) => setDraft({ ...draft, weight_kg: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-1.5">
            <Label>Activity Level</Label>
            <Select
              value={draft.activity_level}
              onValueChange={(v) => setDraft({ ...draft, activity_level: v as ProfileData["activity_level"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <Label>Goal</Label>
            <Select
              value={draft.goal}
              onValueChange={(v) => setDraft({ ...draft, goal: v as ProfileData["goal"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Preview */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">BMR</span>
              <span className="font-medium">{Math.round(bmr)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TDEE</span>
              <span className="font-medium">{Math.round(rawTDEE)} kcal</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="font-medium">
                {draft.goal === "cut" ? "Target (−400)" : draft.goal === "bulk" ? "Target (+300)" : "Target"}
              </span>
              <span className="font-bold text-primary">{adjustedTDEE} kcal</span>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Apply to Daily Goals"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalorieCalculator;
