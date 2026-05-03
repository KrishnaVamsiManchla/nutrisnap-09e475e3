import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, MessageCircle, Dumbbell, Mail, Phone, Target, Camera, ClipboardCheck } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Client {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  goal: string | null;
  notes: string | null;
  status: string;
}

const ClientDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("trainer_clients")
      .select("*")
      .eq("id", id)
      .eq("trainer_id", user.id)
      .maybeSingle()
      .then(({ data }) => setClient(data as Client | null));
  }, [id, user]);

  return (
    <TrainerLayout
      title="Client"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      {!client ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-4">
          <Card className="card-premium p-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xl font-semibold text-primary">
                {client.client_name.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{client.client_name}</h2>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{client.status}</p>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="checkins">Check-ins</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-3">
              <Card className="card-premium divide-y divide-border/60">
                {client.goal && <Row icon={<Target className="h-4 w-4" />} label="Goal" value={client.goal} />}
                {client.client_email && <Row icon={<Mail className="h-4 w-4" />} label="Email" value={client.client_email} />}
                {client.client_phone && <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={client.client_phone} />}
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Link to={`/trainer/chat/${client.id}`}>
                  <Button variant="outline" className="w-full gap-2">
                    <MessageCircle className="h-4 w-4" /> Message
                  </Button>
                </Link>
                <Link to={`/trainer/workouts/assign?client=${client.id}`}>
                  <Button className="w-full gap-2">
                    <Dumbbell className="h-4 w-4" /> Assign
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="mt-4 space-y-3">
              <Card className="card-premium p-4 text-sm text-muted-foreground">
                Progress data from the client app appears here.
              </Card>
              <Link to={`/trainer/clients/${client.id}/photos`}>
                <Button variant="outline" className="w-full gap-2">
                  <Camera className="h-4 w-4" /> Progress Photos
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="checkins" className="mt-4 space-y-3">
              <Card className="card-premium p-4 text-sm text-muted-foreground">
                No check-ins yet.
              </Card>
              <Link to={`/trainer/clients/${client.id}/checkin`}>
                <Button className="w-full gap-2">
                  <ClipboardCheck className="h-4 w-4" /> Weekly Check-in
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card className="card-premium p-4">
                <p className="text-sm text-foreground">{client.notes || "No notes yet."}</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </TrainerLayout>
  );
};

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 px-4 py-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
    <span className="truncate text-sm font-medium text-foreground">{value}</span>
  </div>
);

export default ClientDetail;
