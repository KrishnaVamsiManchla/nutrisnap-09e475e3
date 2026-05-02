import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const AddClient = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ client_name: "", client_email: "", client_phone: "", goal: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.client_name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("trainer_clients").insert({
      trainer_id: user.id,
      ...form,
    });
    setSaving(false);
    if (error) {
      toast.error("Could not add client");
      return;
    }
    toast.success("Client added");
    navigate("/trainer/clients");
  };

  return (
    <TrainerLayout
      title="Add Client"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input
              required
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.client_phone}
              onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Goal</Label>
            <Input
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="Fat loss, Build muscle…"
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : "Add Client"}
          </Button>
        </form>
      </Card>
    </TrainerLayout>
  );
};

export default AddClient;
