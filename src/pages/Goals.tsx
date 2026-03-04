import { useState, useEffect, useCallback } from "react";
import { Target, Sparkles, Clock, TrendingDown, TrendingUp, Minus, Droplets, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

type GoalType = "cut" | "maintain" | "bulk";

interface Goals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  water_ml: number;
}

interface ProfileData {
  age: number;
  gender: "male" | "female";
  height_cm: number;
  weight_kg: number;
  goal_weight_kg: number;
  activity_level: string;
  goal: GoalType;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_OPTIONS: { value: GoalType; label: string; icon: typeof TrendingDown }[] = [
  { value: "cut", label: "Fat Loss", icon: TrendingDown },
  { value: "maintain", label: "Maintain", icon: Minus },
  { value: "bulk", label: "Build Muscle", icon: TrendingUp },
];

function calcBMR(gender: string, weight: number, height: number, age: number) {
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calcTDEE(bmr: number, activityLevel: string) {
  return bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2);
}

function calcGoalCalories(tdee: number, goal: GoalType) {
  if (goal === "cut") return Math.round(tdee - 400);
  if (goal === "bulk") return Math.round(tdee + 300);
  return Math.round(tdee);
}

function calcAutoMacros(calories: number, weightKg: number, goal: GoalType) {
  let proteinPerKg = 1.8;
  if (goal === "cut") proteinPerKg = 2.0;
  else if (goal === "maintain") proteinPerKg = 1.6;

  let proteinG = Math.round(weightKg * proteinPerKg);
  proteinG = Math.max(proteinG, Math.round(weightKg * 0.8));

  let fatCals = calories * 0.25;
  if (fatCals < calories * 0.2) fatCals = calories * 0.2;
  const fatG = Math.round(fatCals / 9);

  const proteinCals = proteinG * 4;
  const remainingCals = Math.max(0, calories - proteinCals - fatCals);
  const carbsG = Math.round(remainingCals / 4);

  return { protein_g: proteinG, carbs_g: carbsG, fat_g: fatG };
}

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, water_ml: 2500 });
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("maintain");
  const [autoBalance, setAutoBalance] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Editable draft values
  const [draftCalories, setDraftCalories] = useState("");
  const [draftProtein, setDraftProtein] = useState("");
  const [draftCarbs, setDraftCarbs] = useState("");
  const [draftFat, setDraftFat] = useState("");
  const [draftWater, setDraftWater] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    const [profileRes, goalsRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_goals").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

    if (profileRes.data) {
      const p: ProfileData = {
        age: profileRes.data.age ?? 25,
        gender: (profileRes.data.gender as "male" | "female") ?? "male",
        height_cm: Number(profileRes.data.height_cm) || 175,
        weight_kg: Number(profileRes.data.weight_kg) || 70,
        goal_weight_kg: Number(profileRes.data.goal_weight_kg) || 65,
        activity_level: profileRes.data.activity_level ?? "moderate",
        goal: (profileRes.data.goal as GoalType) ?? "maintain",
      };
      setProfile(p);
      setSelectedGoal(p.goal);
    }

    if (goalsRes.data) {
      const g: Goals = {
        calories: goalsRes.data.calories,
        protein_g: goalsRes.data.protein_g,
        carbs_g: goalsRes.data.carbs_g,
        fat_g: goalsRes.data.fat_g,
        water_ml: goalsRes.data.water_ml,
      };
      setGoals(g);
      setDraftCalories(String(g.calories));
      setDraftProtein(String(g.protein_g));
      setDraftCarbs(String(g.carbs_g));
      setDraftFat(String(g.fat_g));
      setDraftWater(String(g.water_ml));
    }

    setLoaded(true);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Recalculate when goal type changes
  useEffect(() => {
    if (!profile || !loaded) return;
    const bmr = calcBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
    const tdee = calcTDEE(bmr, profile.activity_level);
    const newCalories = calcGoalCalories(tdee, selectedGoal);
    setDraftCalories(String(newCalories));

    if (autoBalance) {
      const macros = calcAutoMacros(newCalories, profile.weight_kg, selectedGoal);
      setDraftProtein(String(macros.protein_g));
      setDraftCarbs(String(macros.carbs_g));
      setDraftFat(String(macros.fat_g));
    }
  }, [selectedGoal, profile, loaded, autoBalance]);

  // Recalculate macros when calories change (auto-balance ON)
  useEffect(() => {
    if (!autoBalance || !profile || !loaded) return;
    const cal = Number(draftCalories);
    if (cal <= 0) return;
    const macros = calcAutoMacros(cal, profile.weight_kg, selectedGoal);
    setDraftProtein(String(macros.protein_g));
    setDraftCarbs(String(macros.carbs_g));
    setDraftFat(String(macros.fat_g));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCalories, autoBalance]);

  const handleMacroChange = (field: "protein" | "carbs" | "fat", value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    if (field === "protein") setDraftProtein(value);
    else if (field === "carbs") setDraftCarbs(value);
    else setDraftFat(value);
    if (autoBalance) setAutoBalance(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const newGoals: Goals = {
        calories: Number(draftCalories) || 2000,
        protein_g: Number(draftProtein) || 150,
        carbs_g: Number(draftCarbs) || 250,
        fat_g: Number(draftFat) || 65,
        water_ml: Number(draftWater) || 2500,
      };

      const { data: existing } = await supabase.from("user_goals").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("user_goals").update(newGoals).eq("user_id", user.id);
      } else {
        await supabase.from("user_goals").insert({ user_id: user.id, ...newGoals });
      }

      // Update goal type in profile
      await supabase.from("user_profiles").update({ goal: selectedGoal }).eq("user_id", user.id);

      setGoals(newGoals);
      toast({ title: "Goals saved!", description: `Daily target: ${newGoals.calories} kcal` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // TDEE info
  const bmr = profile ? calcBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age) : 0;
  const tdee = profile ? calcTDEE(bmr, profile.activity_level) : 0;

  // Timeline prediction
  const getTimeline = () => {
    if (!profile) return null;
    const currentWeight = profile.weight_kg;
    const goalWeight = profile.goal_weight_kg;
    const weeklyDeficit = (tdee - Number(draftCalories)) * 7;

    if (selectedGoal === "cut") {
      const weeklyFatLossKg = weeklyDeficit / 7700;
      if (weeklyFatLossKg <= 0) return "Increase your calorie deficit to lose weight.";
      const weightToLose = currentWeight - goalWeight;
      if (weightToLose <= 0) return "You're already at or below your goal weight!";
      const weeks = weightToLose / weeklyFatLossKg;
      const low = Math.floor(weeks);
      const high = Math.ceil(weeks * 1.2);
      return `Estimated time to goal: ${low}–${high} weeks`;
    }
    if (selectedGoal === "bulk") {
      const weightToGain = goalWeight - currentWeight;
      if (weightToGain <= 0) return "You're already at or above your goal weight!";
      const months = weightToGain / 0.25;
      return `Estimated time to goal: ${Math.round(months)} months (conservative)`;
    }
    return "Maintaining current weight target.";
  };

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Daily Goals</h1>
          <div className="flex items-center gap-1.5">
            {autoBalance && profile ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />
                Auto-balanced
              </span>
            ) : (
              <span className="text-[10px] font-medium text-muted-foreground/50">Manual mode</span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28">
        {/* Goal Type Selector — Segmented Control */}
        <section className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Goal</Label>
          <div className="flex rounded-2xl bg-muted/50 p-1 gap-1">
            {GOAL_OPTIONS.map((opt) => {
              const isActive = selectedGoal === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedGoal(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* TDEE Breakdown */}
        {profile && (
          <section className="rounded-2xl bg-card p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Energy Calculation</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BMR</span>
                <span className="font-medium">{Math.round(bmr)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TDEE</span>
                <span className="font-medium">{Math.round(tdee)} kcal</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1">
                <span className="text-muted-foreground">
                  {selectedGoal === "cut" ? "Deficit" : selectedGoal === "bulk" ? "Surplus" : "Adjustment"}
                </span>
                <span className="font-medium text-primary">
                  {selectedGoal === "cut" ? "−400" : selectedGoal === "bulk" ? "+300" : "±0"} kcal
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Calories */}
        <section className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calories</Label>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 2500"
              value={draftCalories}
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
                setDraftCalories(v);
              }}
              className="h-14 text-2xl font-medium pr-16 rounded-2xl bg-card border-border/60 shadow-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60 pointer-events-none">
              kcal
            </span>
          </div>
        </section>

        <div className="h-px bg-border/60" />

        {/* Macros */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Macros</Label>
          </div>

          {profile && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] text-foreground/80">Auto-balance macros</span>
              <Switch checked={autoBalance} onCheckedChange={setAutoBalance} />
            </div>
          )}

          <div className="space-y-3">
            {[
              { label: "Protein", value: draftProtein, onChange: (v: string) => handleMacroChange("protein", v), unit: "g" },
              { label: "Carbs", value: draftCarbs, onChange: (v: string) => handleMacroChange("carbs", v), unit: "g" },
              { label: "Fat", value: draftFat, onChange: (v: string) => handleMacroChange("fat", v), unit: "g" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-16 shrink-0">{f.label}</span>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="h-10 pr-10 rounded-xl bg-card border-border/60 text-right text-sm shadow-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            {autoBalance && profile ? "Macros adjust automatically when calories or goal change." : "Manually set your macro targets."}
          </p>
        </section>

        <div className="h-px bg-border/60" />

        {/* Hydration */}
        <section className="space-y-3">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} />
            Hydration
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground w-16 shrink-0">Water</span>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="decimal"
                value={draftWater}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
                  setDraftWater(v);
                }}
                className="h-10 pr-10 rounded-xl bg-card border-border/60 text-right text-sm shadow-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                ml
              </span>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/60" />

        {/* Goal Timeline Prediction */}
        {profile && (
          <section className="rounded-2xl bg-primary/5 p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timeline</span>
            </div>
            <p className="text-sm font-medium text-foreground">{getTimeline()}</p>
            {selectedGoal !== "maintain" && (
              <p className="text-[11px] text-muted-foreground/60">
                {profile.weight_kg} kg → {profile.goal_weight_kg} kg
              </p>
            )}
          </section>
        )}

        {!profile && (
          <div className="rounded-2xl bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">Set up your profile to get personalized targets.</p>
          </div>
        )}

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-sm font-medium bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/80 shadow-sm"
        >
          {saving ? "Saving…" : "Save Goals"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Goals;
