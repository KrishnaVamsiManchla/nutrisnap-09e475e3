import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { LogOut, Trash2, User, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (little/no exercise)",
  light: "Light (1–3 days/week)",
  moderate: "Moderate (3–5 days/week)",
  active: "Active (6–7 days/week)",
  very_active: "Very Active (2× daily)",
};

interface ProfileForm {
  name: string;
  age: number;
  gender: "male" | "female";
  height_cm: number;
  weight_kg: number;
  goal_weight_kg: number;
  activity_level: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

const DEFAULT_FORM: ProfileForm = {
  name: "",
  age: 25,
  gender: "male",
  height_cm: 175,
  weight_kg: 70,
  goal_weight_kg: 65,
  activity_level: "moderate",
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
      });
    }
    setLoaded(true);
  }, [user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

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
      };
      const { data: existing } = await supabase.from("user_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("user_profiles").update(row).eq("user_id", user.id);
      } else {
        await supabase.from("user_profiles").insert({ user_id: user.id, ...row });
      }
      toast({ title: "Profile saved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
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
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Profile</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28">
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

        {/* Invite Friends */}
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <button className="flex w-full items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Invite Friends</p>
              <p className="text-xs text-muted-foreground">Share NutriSnap with friends</p>
            </div>
          </button>
        </section>

        {/* Personal Details */}
        <section className="rounded-2xl bg-card p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Personal Details</h2>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Gender</Label>
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
        </section>

        <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-2xl text-sm font-medium shadow-sm">
          {saving ? "Saving…" : "Save Profile"}
        </Button>

        {/* Account Actions */}
        <section className="rounded-2xl bg-card p-5 space-y-3 shadow-sm">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</h2>
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

      <BottomNav />
    </div>
  );
};

export default Profile;
