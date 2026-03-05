import { useState, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DateHeader from "@/components/DateHeader";
import CalorieRing from "@/components/CalorieRing";
import MacroCards from "@/components/MacroCards";
import QuickActions from "@/components/QuickActions";
import BottomNav from "@/components/BottomNav";
import MealLog from "@/components/MealLog";
import WaterTracker from "@/components/WaterTracker";
import SmartFeedback from "@/components/SmartFeedback";
import FoodCamera from "@/components/FoodCamera";
import ManualEntry from "@/components/ManualEntry";
import VoiceEntry from "@/components/VoiceEntry";
import NutritionResult from "@/components/NutritionResult";
import PremiumBadge from "@/components/PremiumBadge";
import LockedFeature from "@/components/LockedFeature";
import GoalSummaryCard from "@/components/GoalSummaryCard";

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
  goal: "cut" | "maintain" | "bulk";
}

interface WaterEntry {
  id: string;
  amount_ml: number;
  created_at: string;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
};

const DEFAULT_GOALS: Goals = { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, water_ml: 2500 };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [showManual, setShowManual] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showVoice, setShowVoice] = useState(false);

  const isPremium = false;

  const dayStart = useCallback((d: Date) => {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }, []);

  const dayEnd = useCallback((d: Date) => {
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  }, []);

  const loadEntries = useCallback(async () => {
    const { data } = await supabase
      .from("food_entries")
      .select("*")
      .gte("created_at", dayStart(selectedDate))
      .lte("created_at", dayEnd(selectedDate))
      .order("created_at", { ascending: false });
    if (data) setEntries(data as FoodEntry[]);
  }, [selectedDate, dayStart, dayEnd]);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_goals").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setGoals({ calories: data.calories, protein_g: data.protein_g, carbs_g: data.carbs_g, fat_g: data.fat_g, water_ml: data.water_ml });
    }
  }, [user]);

  const loadWater = useCallback(async () => {
    const { data } = await supabase
      .from("water_entries")
      .select("*")
      .gte("created_at", dayStart(selectedDate))
      .lte("created_at", dayEnd(selectedDate))
      .order("created_at", { ascending: false });
    if (data) setWaterEntries(data as WaterEntry[]);
  }, [selectedDate, dayStart, dayEnd]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setProfile({
        age: data.age ?? 25,
        gender: (data.gender as "male" | "female") ?? "male",
        height_cm: Number(data.height_cm) || 175,
        weight_kg: Number(data.weight_kg) || 70,
        goal_weight_kg: Number(data.goal_weight_kg) || 65,
        activity_level: data.activity_level ?? "moderate",
        goal: (data.goal as ProfileData["goal"]) ?? "maintain",
      });
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
    loadGoals();
    loadWater();
    loadProfile();
  }, [loadEntries, loadGoals, loadWater, loadProfile]);

  const addWater = async (ml: number) => {
    if (!user) return;
    const { error } = await supabase.from("water_entries").insert({ user_id: user.id, amount_ml: ml });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      loadWater();
    }
  };

  const removeLastWater = async () => {
    if (waterEntries.length === 0) return;
    await supabase.from("water_entries").delete().eq("id", waterEntries[0].id);
    loadWater();
  };

  const handleResult = (data: NutritionData) => {
    setResult(data);
    setShowManual(false);
    setShowCamera(false);
    setShowVoice(false);
    setShowResult(true);
  };

  const saveEntry = async (mealType: string) => {
    if (!result || !user) return;
    setSaving(true);
    try {
      const entryDate = new Date(selectedDate);
      entryDate.setHours(12, 0, 0, 0);
      const { error } = await supabase.from("food_entries").insert({
        user_id: user.id,
        food_name: result.food_name,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fat_g: result.fat_g,
        fiber_g: result.fiber_g,
        sugar_g: result.sugar_g,
        sodium_mg: result.sodium_mg,
        serving_size: result.serving_size,
        meal_type: mealType,
        created_at: entryDate.toISOString(),
      });
      if (error) throw error;
      toast({ title: "Saved!", description: `${result.food_name} added.` });
      setResult(null);
      setShowResult(false);
      loadEntries();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    await supabase.from("food_entries").delete().eq("id", id);
    loadEntries();
  };

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + Number(e.calories),
      protein: acc.protein + Number(e.protein_g),
      carbs: acc.carbs + Number(e.carbs_g),
      fat: acc.fat + Number(e.fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const totalWaterMl = waterEntries.reduce((sum, e) => sum + e.amount_ml, 0);

  // TDEE for goal summary
  const tdee = profile
    ? (function () {
        const bmr = profile.gender === "male"
          ? 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
          : 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161;
        return bmr * (ACTIVITY_MULTIPLIERS[profile.activity_level] || 1.2);
      })()
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">NutriSnap</h1>
          <div className="flex items-center gap-1.5">
            <PremiumBadge isPremium={isPremium} />
            <button
              onClick={() => navigate("/settings")}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted active:scale-95"
            >
              <Settings className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-10 px-4 py-8 pb-28">
        <DateHeader date={selectedDate} onDateChange={setSelectedDate} />

        <div className="flex justify-center">
          <CalorieRing consumed={totals.calories} target={goals.calories} />
        </div>

        <MacroCards
          protein={totals.protein}
          carbs={totals.carbs}
          fat={totals.fat}
          goals={{ protein: goals.protein_g, carbs: goals.carbs_g, fat: goals.fat_g }}
        />

        {/* Goal Summary */}
        {profile && (
          <GoalSummaryCard
            goal={profile.goal}
            currentWeight={profile.weight_kg}
            targetWeight={profile.goal_weight_kg}
            weeklyDeficitKcal={(tdee - goals.calories) * 7}
            tdee={tdee}
            calories={goals.calories}
          />
        )}

        {/* Water */}
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <WaterTracker
            currentMl={totalWaterMl}
            goalMl={goals.water_ml}
            onAdd={addWater}
            onRemove={removeLastWater}
          />
        </div>

        <SmartFeedback
          entries={entries}
          goals={{ calories: goals.calories, protein: goals.protein_g, carbs: goals.carbs_g, fat: goals.fat_g }}
          waterMl={totalWaterMl}
          waterGoalMl={goals.water_ml}
        />

        <QuickActions
          onManual={() => setShowManual(true)}
          onCamera={() => setShowCamera(true)}
          onVoice={() => setShowVoice(true)}
        />

        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Meals</h3>
          <MealLog entries={entries} onDelete={deleteEntry} />
        </div>
      </main>

      {/* Dialogs */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Food</DialogTitle></DialogHeader>
          <ManualEntry onResult={handleResult} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Scan with AI</DialogTitle></DialogHeader>
          <LockedFeature isPremium={isPremium} featureName="AI Photo Tracking">
            <FoodCamera onResult={handleResult} />
          </LockedFeature>
        </DialogContent>
      </Dialog>

      <Dialog open={showVoice} onOpenChange={setShowVoice}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Voice Log</DialogTitle></DialogHeader>
          <VoiceEntry onResult={handleResult} />
        </DialogContent>
      </Dialog>

      <Dialog open={showResult} onOpenChange={(open) => { setShowResult(open); if (!open) setResult(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nutrition Info</DialogTitle></DialogHeader>
          {result && (
            <NutritionResult
              data={result}
              onSave={saveEntry}
              onDiscard={() => { setResult(null); setShowResult(false); }}
              saving={saving}
            />
          )}
        </DialogContent>
      </Dialog>

      <BottomNav onCameraPress={() => setShowCamera(true)} />
    </div>
  );
};

export default Dashboard;
