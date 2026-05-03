import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, CreditCard, Bell } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Payments = () => {
  const navigate = useNavigate();
  return (
    <TrainerLayout
      title="Payments"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-4">
        <Card className="card-premium p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">This month</p>
          <p className="mt-1 text-3xl font-semibold text-foreground">₹0</p>
          <p className="text-xs text-muted-foreground">No payments yet</p>
        </Card>
        <Card className="card-premium p-6 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="mt-3 text-sm font-medium text-foreground">Payments coming soon</p>
          <p className="text-xs text-muted-foreground">
            Collect subscriptions and one-time fees from clients.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button disabled>Set up payouts</Button>
            <Link to="/trainer/payments/reminder">
              <Button variant="outline" className="w-full gap-2">
                <Bell className="h-4 w-4" /> Send Payment Reminder
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </TrainerLayout>
  );
};

export default Payments;
