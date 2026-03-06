import { useState, useEffect, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Plus, Scale, Flame, Beef, TrendingUp, Trophy, Pencil, Trash2 } from "lucide-react";
import ConsistencyScore from "@/components/ConsistencyScore";
import MealPatternInsights from "@/components/MealPatternInsights";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format, subDays, parseISO, startOfDay, isAfter, isBefore } from "date-fns";
import WeeklyAnalysis from "@/components/WeeklyAnalysis";
import WeightProjection from "@/components/WeightProjection";
import LockedFeature from "@/components/LockedFeature";

interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string;
}

interface DailyCalories {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
interface RawFoodEntry {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  created_at: string;
  meal_type: string;
}

const Progress = () => {
  const isPremium = false;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [dailyData, setDailyData] = useState<DailyCalories[]>([]);
  const [rawEntries, setRawEntries] = useState<RawFoodEntry[]>([]);
  const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
  const [streak, setStreak] = useState(0);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState(format(new Date(), "yyyy-MM-dd"));
  const [saving, setSaving] = useState(false);

  const loadWeightLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: true });
    if (data) setWeightLogs(data as WeightLog[]);
  }, [user]);

  const loadDailyData = useCallback(async () => {
    if (!user) return;
    const since = subDays(new Date(), 30).toISOString();
    const { data } = await supabase
      .from("food_entries")
      .select("calories, protein_g, carbs_g, fat_g, created_at, meal_type")
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    if (!data) return;
    setRawEntries(data as RawFoodEntry[]);

    const grouped: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    data.forEach((e: any) => {
      const day = format(new Date(e.created_at), "yyyy-MM-dd");
      if (!grouped[day]) grouped[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      grouped[day].calories += Number(e.calories);
      grouped[day].protein += Number(e.protein_g);
      grouped[day].carbs += Number(e.carbs_g);
      grouped[day].fat += Number(e.fat_g);
    });

    const result: DailyCalories[] = Object.entries(grouped)
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setDailyData(result);

    const loggedDates = new Set(Object.keys(grouped));
    let s = 0;
    let d = startOfDay(new Date());
    if (!loggedDates.has(format(d, "yyyy-MM-dd"))) {
      d = subDays(d, 1);
    }
    while (loggedDates.has(format(d, "yyyy-MM-dd"))) {
      s++;
      d = subDays(d, 1);
    }
    setStreak(s);
  }, [user]);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_goals").select("calories, protein_g").eq("user_id", user.id).maybeSingle();
    if (data) setGoals({ calories: data.calories, protein: data.protein_g });
  }, [user]);

  useEffect(() => {
    loadWeightLogs();
    loadDailyData();
    loadGoals();
  }, [loadWeightLogs, loadDailyData, loadGoals]);

  const saveWeight = async () => {
    if (!user || !weightInput) return;
    setSaving(true);
    try {
      if (editingLog) {
        await supabase
          .from("weight_logs")
          .update({ weight_kg: Number(weightInput), logged_at: dateInput })
          .eq("id", editingLog.id);
      } else {
        const { error } = await supabase.from("weight_logs").insert({
          user_id: user.id,
          weight_kg: Number(weightInput),
          logged_at: dateInput,
        });
        if (error) {
          if (error.code === "23505") {
            toast({ title: "Entry exists", description: "A weight log for this date already exists.", variant: "destructive" });
            setSaving(false);
            return;
          }
          throw error;
        }
      }
      toast({ title: editingLog ? "Updated!" : "Weight logged!" });
      setShowAddWeight(false);
      setEditingLog(null);
      setWeightInput("");
      setDateInput(format(new Date(), "yyyy-MM-dd"));
      loadWeightLogs();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteWeight = async (id: string) => {
    await supabase.from("weight_logs").delete().eq("id", id);
    loadWeightLogs();
  };

  const openEdit = (log: WeightLog) => {
    setEditingLog(log);
    setWeightInput(String(log.weight_kg));
    setDateInput(log.logged_at);
    setShowAddWeight(true);
  };

  const weightChartData = weightLogs.map((w) => ({
    date: format(parseISO(w.logged_at), "MMM d"),
    weight: Number(w.weight_kg),
  }));

  const calAvgData = dailyData.map((d, i) => {
    const windowStart = Math.max(0, i - 6);
    const window = dailyData.slice(windowStart, i + 1);
    const avg = Math.round(window.reduce((s, v) => s + v.calories, 0) / window.length);
    return { date: format(parseISO(d.date), "MMM d"), avg, actual: Math.round(d.calories) };
  });

  const weeklyMacros = (() => {
    const weeks: { label: string; protein: number; carbs: number; fat: number; count: number }[] = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = subDays(new Date(), w * 7);
      const weekStart = subDays(weekEnd, 6);
      const label = `${format(weekStart, "MMM d")}–${format(weekEnd, "d")}`;
      const entries = dailyData.filter((d) => {
        const dt = parseISO(d.date);
        return !isBefore(dt, startOfDay(weekStart)) && !isAfter(dt, startOfDay(weekEnd));
      });
      const count = entries.length || 1;
      weeks.push({
        label,
        protein: Math.round(entries.reduce((s, e) => s + e.protein, 0) / count),
        carbs: Math.round(entries.reduce((s, e) => s + e.carbs, 0) / count),
        fat: Math.round(entries.reduce((s, e) => s + e.fat, 0) / count),
        count: entries.length,
      });
    }
    return weeks;
  })();

  const last7 = dailyData.slice(-7);
  const avgCalories = last7.length ? Math.round(last7.reduce((s, d) => s + d.calories, 0) / last7.length) : 0;
  const avgProtein = last7.length ? Math.round(last7.reduce((s, d) => s + d.protein, 0) / last7.length) : 0;

  const chartTooltipStyle = {
    contentStyle: {
      borderRadius: 16,
      border: "1px solid hsl(var(--border) / 0.5)",
      background: "hsl(var(--card))",
      boxShadow: "var(--shadow-elevated)",
      padding: "8px 12px",
      fontSize: 13,
    },
    labelStyle: { fontWeight: 600 },
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl" style={{ borderBottom: "1px solid hsl(var(--border) / 0.5)" }}>
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-sm font-medium press-scale">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back
          </button>
          <h1 className="text-lg font-bold">Progress</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-28">
        {/* Streak */}
        <div className="card-premium flex items-center gap-4 animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Trophy className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{streak} day{streak !== 1 ? "s" : ""}</p>
            <p className="text-sm text-muted-foreground">Logging streak</p>
          </div>
        </div>

        {/* Weight Graph */}
        <section className="card-premium space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight Progress</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs rounded-xl border-border/60 press-scale"
              onClick={() => {
                setEditingLog(null);
                setWeightInput("");
                setDateInput(format(new Date(), "yyyy-MM-dd"));
                setShowAddWeight(true);
              }}
            >
              <Plus className="h-3 w-3" />
              Log Weight
            </Button>
          </div>

          {weightChartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.5)" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.5)" width={40} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
              <Scale className="h-8 w-8 mb-3 opacity-30" />
              <p>Log at least 2 weights to see your trend</p>
            </div>
          )}

          {weightLogs.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {[...weightLogs].reverse().slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-3.5 py-2.5 text-sm">
                  <span className="text-muted-foreground">{format(parseISO(log.logged_at), "MMM d, yyyy")}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold">{Number(log.weight_kg)} kg</span>
                    <button onClick={() => openEdit(log)} className="text-muted-foreground hover:text-foreground press-scale">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteWeight(log.id)} className="text-muted-foreground hover:text-destructive press-scale">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Calorie Trend */}
        <section className="card-premium space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calorie Trend (7-Day Avg)</h2>
          {calAvgData.length > 2 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={calAvgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.5)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.5)" width={45} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} name="7-day avg" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth={1} strokeDasharray="4 4" name="Daily" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
              <Flame className="h-8 w-8 mb-3 opacity-30" />
              <p>Log a few days of food to see trends</p>
            </div>
          )}
        </section>

        {/* Macro Trends */}
        <section className="card-premium space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Macro Averages</h2>
          {weeklyMacros.some((w) => w.count > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyMacros}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.5)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.5)" width={35} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="protein" fill="hsl(var(--health-red) / 0.7)" radius={[6, 6, 0, 0]} name="Protein" />
                <Bar dataKey="carbs" fill="hsl(var(--health-orange) / 0.7)" radius={[6, 6, 0, 0]} name="Carbs" />
                <Bar dataKey="fat" fill="hsl(var(--health-blue) / 0.7)" radius={[6, 6, 0, 0]} name="Fat" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
              <TrendingUp className="h-8 w-8 mb-3 opacity-30" />
              <p>No data yet for macro trends</p>
            </div>
          )}
        </section>

        {/* Weight Projection */}
        <LockedFeature isPremium={isPremium} featureName="Weight Prediction">
          <WeightProjection />
        </LockedFeature>

        {/* AI Weekly Analysis */}
        <LockedFeature isPremium={isPremium} featureName="Weekly Analysis">
          <WeeklyAnalysis />
        </LockedFeature>

        {/* Weekly Summary */}
        <section className="card-premium space-y-4" style={{ background: "hsl(var(--primary) / 0.04)" }}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Flame className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Avg Calories</p>
                <p className="text-lg font-bold">{avgCalories}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-card p-3.5 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(var(--health-red) / 0.1)" }}>
                <Beef className="h-5 w-5" style={{ color: "hsl(var(--health-red))" }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-medium">Avg Protein</p>
                <p className="text-lg font-bold">{avgProtein}g</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card px-4 py-3.5 text-sm text-muted-foreground leading-relaxed shadow-card">
            {last7.length >= 3 ? (
              avgCalories > 0 && avgProtein > 0 ? (
                <p>
                  📊 Over the last {last7.length} days, you averaged <span className="font-semibold text-foreground">{avgCalories} kcal</span> and{" "}
                  <span className="font-semibold text-foreground">{avgProtein}g protein</span> daily.
                  {avgProtein < 100 ? " Consider increasing protein-rich foods." : " Great protein intake!"}
                  {streak >= 7 ? " 🔥 Amazing streak!" : streak >= 3 ? " 💪 Nice streak!" : ""}
                </p>
              ) : (
                <p>Keep logging your meals to unlock weekly insights!</p>
              )
            ) : (
              <p>📝 Log at least 3 days this week to see your summary.</p>
            )}
          </div>
        </section>

        {/* Consistency Score */}
        <ConsistencyScore
          trackingDays={dailyData.length}
          totalDays={Math.min(30, dailyData.length || 7)}
          proteinHitDays={dailyData.filter((d) => d.protein >= goals.protein * 0.9).length}
          calorieHitDays={dailyData.filter((d) => d.calories >= goals.calories * 0.9 && d.calories <= goals.calories * 1.1).length}
        />

        {/* Meal Patterns */}
        <MealPatternInsights
          dailyData={dailyData.map((d) => ({
            ...d,
            entries: rawEntries
              .filter((e) => format(new Date(e.created_at), "yyyy-MM-dd") === d.date)
              .map((e) => ({ meal_type: e.meal_type, calories: Number(e.calories), created_at: e.created_at })),
          }))}
          calorieGoal={goals.calories}
          proteinGoal={goals.protein}
        />
      </main>

      {/* Add/Edit Weight Dialog */}
      <Dialog
        open={showAddWeight}
        onOpenChange={(open) => {
          setShowAddWeight(open);
          if (!open) setEditingLog(null);
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingLog ? "Edit Weight" : "Log Weight"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-medium">Date</Label>
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
                className="rounded-xl"
              />
            </div>
            <Button onClick={saveWeight} disabled={saving || !weightInput} className="w-full rounded-xl h-11">
              {saving ? "Saving…" : editingLog ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
  );
};

export default Progress;
