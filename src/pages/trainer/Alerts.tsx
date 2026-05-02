import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Alert { id: string; title: string; description: string; ts: string; }

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("trainer_clients")
        .select("id, client_name, status, created_at")
        .eq("trainer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setAlerts(
        (data ?? []).map((c: any) => ({
          id: c.id,
          title: `${c.client_name} added`,
          description: `Status: ${c.status}`,
          ts: new Date(c.created_at).toLocaleString(),
        }))
      );
    })();
  }, [user]);

  return (
    <TrainerLayout
      title="Alerts"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      {alerts.length === 0 ? (
        <Card className="card-premium p-8 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">No alerts</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Card key={a.id} className="card-premium flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">{a.ts}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </TrainerLayout>
  );
};

export default Alerts;
