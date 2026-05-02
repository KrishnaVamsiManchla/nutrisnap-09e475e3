import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import TrainerLayout from "@/components/trainer/TrainerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tiers = [
  { name: "Starter", price: "Free", clients: "Up to 3 clients", features: ["Workout library", "Client chat"] },
  { name: "Pro", price: "₹999/mo", clients: "Up to 25 clients", features: ["Everything in Starter", "Broadcasts", "Analytics"], highlight: true },
  { name: "Studio", price: "₹2,499/mo", clients: "Unlimited clients", features: ["Everything in Pro", "Payments", "Team accounts"] },
];

const TrainerPricing = () => {
  const navigate = useNavigate();
  return (
    <TrainerLayout
      title="Pricing"
      right={
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      }
    >
      <div className="space-y-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`card-premium p-5 ${t.highlight ? "ring-2 ring-primary" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-foreground">{t.name}</h3>
              <span className="text-base font-semibold text-primary">{t.price}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t.clients}</p>
            <ul className="mt-3 space-y-1.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-success" /> {f}
                </li>
              ))}
            </ul>
            <Button className="mt-4 w-full" variant={t.highlight ? "default" : "outline"}>
              {t.price === "Free" ? "Current plan" : "Upgrade"}
            </Button>
          </Card>
        ))}
      </div>
    </TrainerLayout>
  );
};

export default TrainerPricing;
