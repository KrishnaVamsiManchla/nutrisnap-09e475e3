import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Dumbbell, Bell, CreditCard, Megaphone, ArrowRight } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clients: 0, workouts: 0, assignments: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: clients }, { count: workouts }, { count: assignments }] = await Promise.all([
        supabase.from("trainer_clients").select("*", { count: "exact", head: true }).eq("trainer_id", user.id),
        supabase.from("workouts").select("*", { count: "exact", head: true }).eq("trainer_id", user.id),
        supabase.from("workout_assignments").select("*", { count: "exact", head: true }).eq("trainer_id", user.id),
      ]);
      setStats({ clients: clients ?? 0, workouts: workouts ?? 0, assignments: assignments ?? 0 });
    })();
  }, [user]);

  const quickLinks = [
    { to: "/trainer/broadcast", label: "Broadcast", icon: Megaphone, color: "text-primary" },
    { to: "/trainer/payments", label: "Payments", icon: CreditCard, color: "text-success" },
    { to: "/trainer/alerts", label: "Alerts", icon: Bell, color: "text-warning" },
  ];

  return (
    <TrainerLayout title="Trainer">
      <div className="space-y-5">
        <Card className="card-premium p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Welcome back</p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">Coach Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage your clients & programs</p>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Link to="/trainer/clients">
            <Card className="card-premium p-4 press-scale">
              <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <p className="mt-3 text-2xl font-semibold">{stats.clients}</p>
              <p className="text-xs text-muted-foreground">Clients</p>
            </Card>
          </Link>
          <Link to="/trainer/workouts">
            <Card className="card-premium p-4 press-scale">
              <Dumbbell className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <p className="mt-3 text-2xl font-semibold">{stats.workouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </Card>
          </Link>
          <Card className="card-premium p-4">
            <Bell className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <p className="mt-3 text-2xl font-semibold">{stats.assignments}</p>
            <p className="text-xs text-muted-foreground">Assigned</p>
          </Card>
        </div>

        <Card className="card-premium divide-y divide-border/60">
          {quickLinks.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to} className="flex items-center justify-between px-4 py-3.5 press-scale">
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>
          ))}
        </Card>

        <Link to="/trainer/clients/new">
          <Button className="w-full" size="lg">+ Add New Client</Button>
        </Link>
      </div>
    </TrainerLayout>
  );
};

export default TrainerDashboard;
