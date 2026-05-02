import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, CreditCard, LogOut, Repeat, Bell, Megaphone } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const TrainerProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: "/trainer/pricing", label: "Pricing & Plan", icon: CreditCard },
    { to: "/trainer/payments", label: "Payments", icon: CreditCard },
    { to: "/trainer/broadcast", label: "Broadcast Message", icon: Megaphone },
    { to: "/trainer/alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <TrainerLayout title="Profile">
      <div className="space-y-4">
        <Card className="card-premium p-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-semibold text-primary">
              {(user?.email ?? "T").slice(0, 1).toUpperCase()}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">{user?.email}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Trainer</p>
        </Card>

        <Card className="card-premium divide-y divide-border/60">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center justify-between px-4 py-3.5 press-scale">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
            </Link>
          ))}
        </Card>

        <Card className="card-premium divide-y divide-border/60">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-between px-4 py-3.5 press-scale"
          >
            <div className="flex items-center gap-3">
              <Repeat className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium text-foreground">Switch to NutriSnap</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
          </button>
        </Card>

        <Button variant="outline" className="w-full gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </TrainerLayout>
  );
};

export default TrainerProfile;
