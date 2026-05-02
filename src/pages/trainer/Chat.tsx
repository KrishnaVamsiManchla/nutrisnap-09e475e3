import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Send } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Msg { id: string; sender: string; body: string; created_at: string; }

const Chat = () => {
  const { clientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("Client");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !clientId) return;
    (async () => {
      const [c, m] = await Promise.all([
        supabase.from("trainer_clients").select("client_name").eq("id", clientId).maybeSingle(),
        supabase
          .from("trainer_messages")
          .select("id, sender, body, created_at")
          .eq("trainer_id", user.id)
          .eq("trainer_client_id", clientId)
          .order("created_at", { ascending: true }),
      ]);
      if (c.data) setName((c.data as any).client_name);
      setMsgs((m.data ?? []) as Msg[]);
    })();
  }, [user, clientId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clientId || !text.trim()) return;
    const body = text.trim();
    setText("");
    const { data } = await supabase
      .from("trainer_messages")
      .insert({ trainer_id: user.id, trainer_client_id: clientId, sender: "trainer", body })
      .select()
      .single();
    if (data) setMsgs((m) => [...m, data as Msg]);
  };

  return (
    <TrainerLayout
      title={name}
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-2 pb-24">
        {msgs.length === 0 && (
          <Card className="card-premium p-6 text-center text-sm text-muted-foreground">
            Start the conversation with {name}.
          </Card>
        )}
        {msgs.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
              m.sender === "trainer"
                ? "ml-auto bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground"
            )}
          >
            {m.body}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={send}
        className="fixed bottom-24 left-0 right-0 z-40 mx-auto flex max-w-lg items-center gap-2 px-5"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </TrainerLayout>
  );
};

export default Chat;
