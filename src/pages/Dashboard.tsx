import { useState, useEffect, useCallback } from "react";
import { Flame, LogOut, Camera, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FoodCamera from "@/components/FoodCamera";
import ManualEntry from "@/components/ManualEntry";
import NutritionResult from "@/components/NutritionResult";
import DailySummary from "@/components/DailySummary";
import FoodLog from "@/components/FoodLog";
import WaterTracker from "@/components/WaterTracker";
import GoalsEditor from "@/components/GoalsEditor";
import CalorieCalculator from "@/components/CalorieCalculator";

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
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cut" | "maintain" | "bulk";
}

interface WaterEntry {
  id: string;
  amount_ml: number;
  created_at: string;
}

const DEFAULT_GOALS: Goals = { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65, water_ml: 2500 };

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [savingGoals, setSavingGoals] = useState(false);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const todayStart = useCallback(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const loadEntries = useCallback(async () => {
    const { data } = await supabase
      .from("food_entries")
      .select("*")
      .gte("created_at", todayStart())
      .order("created_at", { ascending: false });
    if (data) setEntries(data as FoodEntry[]);
  }, [todayStart]);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setGoals({
        calories: data.calories,
        protein_g: data.protein_g,
        carbs_g: data.carbs_g,
        fat_g: data.fat_g,
        water_ml: data.water_ml,
      });
    }
  }, [user]);

  const loadWater = useCallback(async () => {
    const { data } = await supabase
      .from("water_entries")
      .select("*")
      .gte("created_at", todayStart())
      .order("created_at", { ascending: false });
    if (data) setWaterEntries(data as WaterEntry[]);
  }, [todayStart]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setProfile({
        age: data.age ?? 25,
        gender: (data.gender as "male" | "female") ?? "male",
        height_cm: Number(data.height_cm) || 175,
        weight_kg: Number(data.weight_kg) || 70,
        activity_level: (data.activity_level as ProfileData["activity_level"]) ?? "moderate",
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

  const saveGoals = async (newGoals: Goals) => {
    if (!user) return;
    setSavingGoals(true);
    try {
      const { data: existing } = await supabase
        .from("user_goals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from("user_goals").update(newGoals).eq("user_id", user.id);
      } else {
        await supabase.from("user_goals").insert({ user_id: user.id, ...newGoals });
      }
      setGoals(newGoals);
      toast({ title: "Goals saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingGoals(false);
    }
  };

  const saveProfile = async (newProfile: ProfileData, tdee: number) => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const profileRow = {
        age: newProfile.age,
        gender: newProfile.gender,
        height_cm: newProfile.height_cm,
        weight_kg: newProfile.weight_kg,
        activity_level: newProfile.activity_level,
        goal: newProfile.goal,
      };

      if (existing) {
        await supabase.from("user_profiles").update(profileRow).eq("user_id", user.id);
      } else {
        await supabase.from("user_profiles").insert({ user_id: user.id, ...profileRow });
      }
      setProfile(newProfile);

      // Auto-update calorie goal from TDEE
      const newGoals = { ...goals, calories: tdee };
      await saveGoals(newGoals);

      toast({ title: "Profile saved!", description: `Daily target set to ${tdee} kcal` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

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

  const saveEntry = async (mealType: string) => {
    if (!result || !user) return;
    setSaving(true);
    try {
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
      });
      if (error) throw error;
      toast({ title: "Saved!", description: `${result.food_name} added to your log.` });
      setResult(null);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">NutriSnap</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4 pb-8">
        {/* Daily Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's Progress</CardTitle>
              <div className="flex items-center gap-1">
                <CalorieCalculator profile={profile} onSave={saveProfile} saving={savingProfile} />
                <GoalsEditor goals={goals} onSave={saveGoals} saving={savingGoals} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <DailySummary
              {...totals}
              goals={{ calories: goals.calories, protein: goals.protein_g, carbs: goals.carbs_g, fat: goals.fat_g }}
            />
            <WaterTracker
              currentMl={totalWaterMl}
              goalMl={goals.water_ml}
              onAdd={addWater}
              onRemove={removeLastWater}
            />
          </CardContent>
        </Card>

        {/* Add Food */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Food</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <NutritionResult
                data={result}
                onSave={saveEntry}
                onDiscard={() => setResult(null)}
                saving={saving}
              />
            ) : (
              <Tabs defaultValue="camera" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="camera" className="flex-1 gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    Photo
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex-1 gap-1.5">
                    <Keyboard className="h-3.5 w-3.5" />
                    Type
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="camera">
                  <FoodCamera onResult={setResult} />
                </TabsContent>
                <TabsContent value="manual">
                  <ManualEntry onResult={setResult} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Food Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today's Log</CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLog entries={entries} onDelete={deleteEntry} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
