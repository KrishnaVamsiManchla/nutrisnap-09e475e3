import { useState, useEffect, useCallback } from "react";
import { Heart, Zap, Smile, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CheckinData {
  hunger: number;
  energy: number;
  mood: number;
}

const METRICS = [
  { key: "hunger" as const, label: "Hunger", icon: Heart, color: "text-destructive", activeColor: "bg-destructive" },
  { key: "energy" as const, label: "Energy", icon: Zap, color: "text-warning", activeColor: "bg-warning" },
  { key: "mood" as const, label: "Mood", icon: Smile, color: "text-success", activeColor: "bg-success" },
];

const DailyCheckin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CheckinData>({ hunger: 3, energy: 3, mood: 3 });
  const [saved, setSaved] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const loadCheckin = useCallback(async () => {
    if (!user) return;
    const { data: row } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checked_at", today)
      .maybeSingle();
    if (row) {
      setData({ hunger: (row as any).hunger, energy: (row as any).energy, mood: (row as any).mood });
      setHasExisting(true);
      setSaved(true);
    }
  }, [user, today]);

  useEffect(() => { loadCheckin(); }, [loadCheckin]);

  const saveCheckin = async () => {
    if (!user) return;
    try {
      if (hasExisting) {
        await supabase
          .from("daily_checkins")
          .update({ hunger: data.hunger, energy: data.energy, mood: data.mood })
          .eq("user_id", user.id)
          .eq("checked_at", today);
      } else {
        await supabase.from("daily_checkins").insert({
          user_id: user.id,
          hunger: data.hunger,
          energy: data.energy,
          mood: data.mood,
          checked_at: today,
        });
        setHasExisting(true);
      }
      setSaved(true);
      toast({ title: "Check-in saved! ✓" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateMetric = (key: keyof CheckinData, value: number) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="card-premium space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Check-in</h3>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full animate-fade-in-scale">
            <Check className="h-2.5 w-2.5" />
            Saved
          </span>
        )}
      </div>

      <div className="space-y-3">
        {METRICS.map((m) => {
          const Icon = m.icon;
          const value = data[m.key];
          return (
            <div key={m.key} className="flex items-center gap-3">
              <Icon className={`h-4 w-4 ${m.color} shrink-0`} strokeWidth={1.5} />
              <span className="text-sm text-foreground w-14 shrink-0 font-medium">{m.label}</span>
              <div className="flex gap-1.5 flex-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => updateMetric(m.key, n)}
                    className={`h-8 flex-1 rounded-xl text-xs font-semibold transition-all duration-200 press-scale ${
                      n <= value
                        ? `${m.activeColor} text-white shadow-sm`
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!saved && (
        <button
          onClick={saveCheckin}
          className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-all press-scale shadow-card"
        >
          Save Check-in
        </button>
      )}
    </div>
  );
};

export default DailyCheckin;
