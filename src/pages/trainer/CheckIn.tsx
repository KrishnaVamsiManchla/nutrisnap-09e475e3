import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const CheckIn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState("3");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Weekly check-in saved");
    navigate(`/trainer/clients/${id}`);
  };

  return (
    <TrainerLayout
      title="Weekly Check-in"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium p-5">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div>
            <Label>Mood (1-5)</Label>
            <Input type="number" min={1} max={5} value={mood} onChange={(e) => setMood(e.target.value)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Save Check-in</Button>
        </form>
      </Card>
    </TrainerLayout>
  );
};

export default CheckIn;