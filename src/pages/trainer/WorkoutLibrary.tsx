import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Dumbbell, Clock, ChevronRight } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Workout {
  id: string;
  title: string;
  description: string | null;
  duration_min: number | null;
  difficulty: string | null;
}

const WorkoutLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", duration_min: 30, difficulty: "beginner" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("workouts")
      .select("id, title, description, duration_min, difficulty")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false });
    setWorkouts((data ?? []) as Workout[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    const { error } = await supabase.from("workouts").insert({
      trainer_id: user.id,
      title: form.title,
      description: form.description,
      duration_min: form.duration_min,
      difficulty: form.difficulty,
      exercises: [],
    });
    if (error) {
      toast.error("Could not save workout");
      return;
    }
    toast.success("Workout added");
    setOpen(false);
    setForm({ title: "", description: "", duration_min: 30, difficulty: "beginner" });
    load();
  };

  return (
    <TrainerLayout
      title="Workouts"
      right={
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm" variant="ghost" className="gap-1">
              <Plus className="h-4 w-4" /> New
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>New Workout</SheetTitle>
            </SheetHeader>
            <form onSubmit={create} className="mt-4 space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Upper body strength"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={form.duration_min}
                    onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <select
                    className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </SheetContent>
        </Sheet>
      }
    >
      {workouts.length === 0 ? (
        <Card className="card-premium p-8 text-center">
          <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">No workouts yet</p>
          <p className="text-xs text-muted-foreground">Build your first workout</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <Card
              key={w.id}
              className="card-premium flex items-center justify-between p-4 press-scale cursor-pointer"
              onClick={() => navigate(`/trainer/workouts/assign?workout=${w.id}`)}
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{w.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {w.duration_min} min
                  </span>
                  <span className="capitalize">{w.difficulty}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Card>
          ))}
          <Link to="/trainer/workouts/assign">
            <Button variant="outline" className="mt-3 w-full">Assign Workout</Button>
          </Link>
        </div>
      )}
    </TrainerLayout>
  );
};

export default WorkoutLibrary;
