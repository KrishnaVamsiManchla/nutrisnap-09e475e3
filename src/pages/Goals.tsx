import { useState, useEffect, useCallback } from "react";
import { Target, Sparkles, Clock, TrendingDown, TrendingUp, Minus, Droplets, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
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
  const proteinPerKg = goal === "cut" ? 2.0 : goal === "bulk" ? 1.8 : 1.6;
  const proteinG = Math.max(Math.round(weightKg * proteinPerKg), Math.round(weightKg * 0.8));
  const fatCals = Math.max(calories * 0.25, calories * 0.2);
  const fatG = Math.round(fatCals / 9);
  const carbsG = Math.round(Math.max(0, calories - proteinG * 4 - fatCals) / 4);
  return { protein_g: proteinG, carbs_g: carbsG, fat_g: fatG };
}

const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType>("maintain");
  const [manualMode, setManualMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
      setDraftCalories(String(goalsRes.data.calories));
      setDraftProtein(String(goalsRes.data.protein_g));
      setDraftCarbs(String(goalsRes.data.carbs_g));
      setDraftFat(String(goalsRes.data.fat_g));
      setDraftWater(String(goalsRes.data.water_ml));
    }

    setLoaded(true);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!profile || !loaded || manualMode) return;
    const bmr = calcBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age);
    const tdee = calcTDEE(bmr, profile.activity_level);
    const newCalories = calcGoalCalories(tdee, selectedGoal);
    setDraftCalories(String(newCalories));
    const macros = calcAutoMacros(newCalories, profile.weight_kg, selectedGoal);
    setDraftProtein(String(macros.protein_g));
    setDraftCarbs(String(macros.carbs_g));
    setDraftFat(String(macros.fat_g));
  }, [selectedGoal, profile, loaded, manualMode]);

  useEffect(() => {
    if (manualMode || !profile || !loaded) return;
    const cal = Number(draftCalories);
    if (cal <= 0) return;
    const macros = calcAutoMacros(cal, profile.weight_kg, selectedGoal);
    setDraftProtein(String(macros.protein_g));
    setDraftCarbs(String(macros.carbs_g));
    setDraftFat(String(macros.fat_g));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftCalories, manualMode]);

  const handleMacroChange = (field: "protein" | "carbs" | "fat", value: string) => {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    if (field === "protein") setDraftProtein(value);
    else if (field === "carbs") setDraftCarbs(value);
    else setDraftFat(value);
    if (!manualMode) setManualMode(true);
  };

  const resetToAutoBalance = () => {
    setManualMode(false);
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

      await supabase.from("user_profiles").update({ goal: selectedGoal }).eq("user_id", user.id);

      toast({ title: "Goals saved!", description: `Daily target: ${newGoals.calories} kcal` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const bmr = profile ? calcBMR(profile.gender, profile.weight_kg, profile.height_cm, profile.age) : 0;
  const tdee = profile ? calcTDEE(bmr, profile.activity_level) : 0;

  const getTimeline = () => {
    if (!profile) return null;
    if (selectedGoal === "cut") {
      const weeklyDeficit = (tdee - Number(draftCalories)) * 7;
      const weeklyFatLossKg = weeklyDeficit / 7700;
      if (weeklyFatLossKg <= 0) return "Increase your calorie deficit to lose weight.";
      const weightToLose = profile.weight_kg - profile.goal_weight_kg;
      if (weightToLose <= 0) return "You're already at or below your goal weight!";
      const weeks = weightToLose / weeklyFatLossKg;
      return `${Math.floor(weeks)}–${Math.ceil(weeks * 1.2)} weeks`;
    }
    if (selectedGoal === "bulk") {
      const weightToGain = profile.goal_weight_kg - profile.weight_kg;
      if (weightToGain <= 0) return "You're already at or above your goal weight!";
      return `~${Math.round(weightToGain / 0.25)} months (conservative)`;
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
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight text-foreground">Daily Goals</h1>
          <div className="flex items-center gap-1.5">
            {!manualMode && profile ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/8 px-2.5 py-0.5 rounded-full">
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
        {/* Goal Type Selector */}
        <section className="space-y-3 animate-fade-in">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goal</Label>
          <div className="flex rounded-2xl bg-muted/40 p-1 gap-1">
            {GOAL_OPTIONS.map((opt) => {
              const isActive = selectedGoal === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => { setSelectedGoal(opt.value); setManualMode(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-all duration-200 press-scale ${
                    isActive ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground/80"
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
          <section className="card-premium space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60">
                <Target className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Energy Calculation</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BMR</span>
                <span className="font-semibold">{Math.round(bmr)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TDEE</span>
                <span className="font-semibold">{Math.round(tdee)} kcal</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="text-muted-foreground">
                  {selectedGoal === "cut" ? "Deficit" : selectedGoal === "bulk" ? "Surplus" : "Adjustment"}
                </span>
                <span className="font-semibold text-primary">
                  {selectedGoal === "cut" ? "−400" : selectedGoal === "bulk" ? "+300" : "±0"} kcal
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Calories */}
        <section className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calories</Label>
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
              className="h-14 text-2xl font-semibold pr-16 rounded-2xl bg-card border-border/40 shadow-card"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50 pointer-events-none">
              kcal
            </span>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        {/* Macros */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Macros</Label>
            {manualMode && (
              <button
                onClick={resetToAutoBalance}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors press-scale"
              >
                <RotateCcw className="h-3 w-3" />
                Reset to auto-balance
              </button>
            )}
          </div>

          <div className="space-y-3">
            {[
              { label: "Protein", value: draftProtein, onChange: (v: string) => handleMacroChange("protein", v), unit: "g", hint: profile ? `${selectedGoal === "cut" ? "2.0" : selectedGoal === "bulk" ? "1.8" : "1.6"}g/kg` : "" },
              { label: "Carbs", value: draftCarbs, onChange: (v: string) => handleMacroChange("carbs", v), unit: "g", hint: "remainder" },
              { label: "Fat", value: draftFat, onChange: (v: string) => handleMacroChange("fat", v), unit: "g", hint: "25% cals" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-16 shrink-0">
                  <span className="text-sm font-medium text-foreground">{f.label}</span>
                  {!manualMode && f.hint && (
                    <span className="block text-[9px] text-muted-foreground/50">{f.hint}</span>
                  )}
                </div>
                <div className="relative flex-1">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="h-11 pr-10 rounded-xl bg-card border-border/40 text-right text-sm font-medium shadow-card"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/50">
            {!manualMode && profile ? "Macros adjust automatically when calories or goal change." : "Manually set your macro targets."}
          </p>
        </section>

        <div className="h-px bg-border/40" />

        {/* Hydration */}
        <section className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" strokeWidth={1.5} />
            Hydration
          </Label>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground w-16 shrink-0">Water</span>
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
                className="h-11 pr-10 rounded-xl bg-card border-border/40 text-right text-sm font-medium shadow-card"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 pointer-events-none">
                ml
              </span>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/40" />

        {/* Goal Timeline */}
        {profile && (
          <section className="card-premium space-y-3" style={{ background: "hsl(var(--primary) / 0.04)" }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{getTimeline()}</p>
            {selectedGoal !== "maintain" && (
              <p className="text-[11px] text-muted-foreground/60">
                {profile.weight_kg} kg → {profile.goal_weight_kg} kg
              </p>
            )}
          </section>
        )}

        {!profile && (
          <div className="card-premium text-center">
            <p className="text-sm text-muted-foreground">Set up your profile to get personalized targets.</p>
          </div>
        )}

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 rounded-2xl text-sm font-semibold shadow-card press-scale"
        >
          {saving ? "Saving…" : "Save Goals"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default Goals;
