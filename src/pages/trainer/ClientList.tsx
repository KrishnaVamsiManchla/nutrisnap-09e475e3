import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ChevronRight, User, Megaphone } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ClientRow {
  id: string;
  client_name: string;
  client_email: string | null;
  goal: string | null;
  status: string;
}

const ClientList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("trainer_clients")
      .select("id, client_name, client_email, goal, status")
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClients((data ?? []) as ClientRow[]);
        setLoading(false);
      });
  }, [user]);

  return (
    <TrainerLayout
      title="Clients"
      right={
        <div className="flex items-center gap-1">
          <Link to="/trainer/broadcast">
            <Button size="sm" variant="ghost" className="gap-1">
              <Megaphone className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/trainer/clients/new">
            <Button size="sm" variant="ghost" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </Link>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : clients.length === 0 ? (
        <Card className="card-premium p-8 text-center">
          <User className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">No clients yet</p>
          <p className="text-xs text-muted-foreground">Add your first client to get started</p>
          <Link to="/trainer/clients/new">
            <Button className="mt-4">Add Client</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Card
              key={c.id}
              onClick={() => navigate(`/trainer/clients/${c.id}`)}
              className="card-premium flex cursor-pointer items-center justify-between p-4 press-scale"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-semibold text-primary">
                    {c.client_name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{c.client_name}</p>
                  <p className="text-xs text-muted-foreground">{c.goal || c.status}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Card>
          ))}
        </div>
      )}
    </TrainerLayout>
  );
};

export default ClientList;
