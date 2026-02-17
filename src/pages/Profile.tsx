import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, LogOut, Trash2, User, Flame, Beef, Crown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  cut: "Fat Loss",
  maintain: "Maintain",
  bulk: "Muscle Gain",
};

function calcBMR(gender: string, weight: number, height: number, age: number) {
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

interface ProfileForm {
  name: string;
  age: number;
  gender: "male" | "female";
  height_cm: number;
  weight_kg: number;
  goal_weight_kg: number;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "cut" | "maintain" | "bulk";
}

const DEFAULT_FORM: ProfileForm = {
  name: "",
  age: 25,
  gender: "male",
  height_cm: 175,
  weight_kg: 70,
  goal_weight_kg: 65,
  activity_level: "moderate",
  goal: "maintain",
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      setForm({
        name: (data as any).name ?? "",
        age: data.age ?? 25,
        gender: (data.gender as "male" | "female") ?? "male",
        height_cm: Number(data.height_cm) || 175,
        weight_kg: Number(data.weight_kg) || 70,
        goal_weight_kg: Number((data as any).goal_weight_kg) || 65,
        activity_level: (data.activity_level as ProfileForm["activity_level"]) ?? "moderate",
        goal: (data.goal as ProfileForm["goal"]) ?? "maintain",
      });
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const bmr = calcBMR(form.gender, form.weight_kg, form.height_cm, form.age);
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[form.activity_level] || 1.2);
  const calorieTarget =
    form.goal === "cut" ? Math.round(tdee - 400) : form.goal === "bulk" ? Math.round(tdee + 300) : Math.round(tdee);
  const proteinTarget = Math.round(form.weight_kg * 2);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const row = {
        name: form.name,
        age: form.age,
        gender: form.gender,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        goal_weight_kg: form.goal_weight_kg,
        activity_level: form.activity_level,
        goal: form.goal,
      };
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) {
        await supabase.from("user_profiles").update(row).eq("user_id", user.id);
      } else {
        await supabase.from("user_profiles").insert({ user_id: user.id, ...row });
      }

      // Also update goals
      const goals = { calories: calorieTarget, protein_g: proteinTarget };
      const { data: existingGoals } = await supabase
        .from("user_goals")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (existingGoals) {
        await supabase.from("user_goals").update(goals).eq("user_id", user.id);
      } else {
        await supabase.from("user_goals").insert({ user_id: user.id, ...goals });
      }

      toast({ title: "Profile saved!", description: `Daily target: ${calorieTarget} kcal` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Sign out - actual account deletion would need a backend function
    toast({ title: "Account deletion requested", description: "You've been signed out. Contact support to complete deletion." });
    await signOut();
  };

  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-bold">Profile</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-10">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <Input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="max-w-[200px] text-center border-0 bg-transparent text-lg font-semibold focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Body Stats */}
        <section className="rounded-2xl border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Body Stats</h2>

          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup
              value={form.gender}
              onValueChange={(v) => update("gender", v as "male" | "female")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="p-male" />
                <Label htmlFor="p-male" className="font-normal cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="p-female" />
                <Label htmlFor="p-female" className="font-normal cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Age</Label>
              <Input type="number" value={form.age} onChange={(e) => update("age", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Height (cm)</Label>
              <Input type="number" value={form.height_cm} onChange={(e) => update("height_cm", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Current Weight (kg)</Label>
              <Input type="number" value={form.weight_kg} onChange={(e) => update("weight_kg", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Goal Weight (kg)</Label>
              <Input type="number" value={form.goal_weight_kg} onChange={(e) => update("goal_weight_kg", Number(e.target.value) || 0)} />
            </div>
          </div>
        </section>

        {/* Activity & Goals */}
        <section className="rounded-2xl border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Activity & Goal</h2>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Activity Level</Label>
            <Select value={form.activity_level} onValueChange={(v) => update("activity_level", v as ProfileForm["activity_level"])}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Goal Type</Label>
            <Select value={form.goal} onValueChange={(v) => update("goal", v as ProfileForm["goal"])}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Calculated Targets */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Targets</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-background p-3">
              <Flame className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Daily Calories</p>
                <p className="text-lg font-bold">{calorieTarget}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-background p-3">
              <Beef className="h-5 w-5 shrink-0" style={{ color: "hsl(var(--health-red))" }} />
              <div>
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="text-lg font-bold">{proteinTarget}g</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground space-y-0.5">
            <div className="flex justify-between"><span>BMR</span><span className="font-medium">{Math.round(bmr)} kcal</span></div>
            <div className="flex justify-between"><span>TDEE</span><span className="font-medium">{Math.round(tdee)} kcal</span></div>
            <div className="flex justify-between"><span>Adjustment</span><span className="font-medium">{form.goal === "cut" ? "−400" : form.goal === "bulk" ? "+300" : "0"} kcal</span></div>
          </div>
        </section>

        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-2xl text-base">
          {saving ? "Saving…" : "Save Profile"}
        </Button>

        {/* Subscription */}
        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscription</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Plan</span>
              <Badge variant="outline" className="text-xs">Free</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-between gap-2"
            onClick={() => navigate("/pricing")}
          >
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              View Plans
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </section>

        {/* Account Actions */}
        <section className="rounded-2xl border bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h2>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={async () => { await signOut(); navigate("/auth"); }}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </main>
    </div>
  );
};

export default Profile;
