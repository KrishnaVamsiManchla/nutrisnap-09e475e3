import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bell } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PaymentReminder = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("Hi! Just a friendly reminder that your payment is due. Thanks!");

  const send = () => {
    toast.success("Reminder sent to clients with dues");
    navigate("/trainer/payments");
  };

  return (
    <TrainerLayout
      title="Payment Reminder"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <Card className="card-premium p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Bell className="h-4 w-4 text-warning" />
          Send a reminder to clients with pending dues.
        </div>
        <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        <Button className="mt-4 w-full" onClick={send} disabled={!text.trim()}>
          Send Reminder
        </Button>
      </Card>
    </TrainerLayout>
  );
};

export default PaymentReminder;