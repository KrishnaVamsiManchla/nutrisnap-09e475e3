import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AssignWorkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [clients, setClients] = useState<{ id: string; client_name: string }[]>([]);
  const [workouts, setWorkouts] = useState<{ id: string; title: string }[]>([]);
  const [clientId, setClientId] = useState(params.get("client") ?? "");
  const [workoutId, setWorkoutId] = useState(params.get("workout") ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [c, w] = await Promise.all([
        supabase.from("trainer_clients").select("id, client_name").eq("trainer_id", user.id),
        supabase.from("workouts").select("id, title").eq("trainer_id", user.id),
      ]);
      setClients((c.data ?? []) as any);
      setWorkouts((w.data ?? []) as any);
    })();
  }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clientId || !workoutId) return;
    setSaving(true);
    const { error } = await supabase.from("workout_assignments").insert({
      trainer_id: user.id,
      trainer_client_id: clientId,
      workout_id: workoutId,
      scheduled_for: date,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not assign");
      return;
    }
    toast.success("Workout assigned");
    navigate("/trainer/workouts");
  };

  return (
    <TrainerLayout
      title="Assign Workout"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Client</Label>
            <select
              className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.client_name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Workout</Label>
            <select
              className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={workoutId}
              onChange={(e) => setWorkoutId(e.target.value)}
              required
            >
              <option value="">Select workout…</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Assigning…" : "Assign"}
          </Button>
        </form>
      </Card>
    </TrainerLayout>
  );
};

export default AssignWorkout;
