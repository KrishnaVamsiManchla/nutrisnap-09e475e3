import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Megaphone } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Broadcast = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("trainer_clients")
      .select("id", { count: "exact", head: true })
      .eq("trainer_id", user.id)
      .then(({ count }) => setCount(count ?? 0));
  }, [user]);

  const send = async () => {
    if (!user || !text.trim()) return;
    setSending(true);
    const { data: clients } = await supabase
      .from("trainer_clients")
      .select("id")
      .eq("trainer_id", user.id);
    const rows = (clients ?? []).map((c: any) => ({
      trainer_id: user.id,
      trainer_client_id: c.id,
      sender: "trainer",
      body: text.trim(),
      is_broadcast: true,
    }));
    if (rows.length) await supabase.from("trainer_messages").insert(rows);
    setSending(false);
    toast.success(`Sent to ${rows.length} client${rows.length === 1 ? "" : "s"}`);
    navigate(-1);
  };

  return (
    <TrainerLayout
      title="Broadcast"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Megaphone className="h-4 w-4 text-primary" />
          Send a message to all {count} client{count === 1 ? "" : "s"}
        </div>
        <Textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reminder: log your meals today!"
        />
        <Button
          className="mt-4 w-full"
          disabled={!text.trim() || sending || count === 0}
          onClick={send}
        >
          {sending ? "Sending…" : "Send Broadcast"}
        </Button>
      </Card>
    </TrainerLayout>
  );
};

export default Broadcast;
