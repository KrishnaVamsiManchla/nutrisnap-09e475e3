import { useState } from "react";
import { ArrowLeft, Check, Lock, Camera, Brain, TrendingUp, BarChart3, CalendarDays, Award, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const FREE_FEATURES = [
  "Manual food logging",
  "Calorie tracking",
  "Daily macro summary",
  "Weight tracking",
  "7-day history view",
  "Basic daily AI insight",
];

const PREMIUM_FEATURES = [
  { icon: Camera, label: "AI photo food recognition" },
  { icon: Brain, label: "Advanced weekly analysis" },
  { icon: TrendingUp, label: "Weight prediction engine" },
  { icon: Sparkles, label: "Smart coaching insights" },
  { icon: CalendarDays, label: "Unlimited history access" },
  { icon: Award, label: "Weekly Health Score" },
  { icon: BarChart3, label: "Priority feature updates" },
];

const COMPARISON = [
  { feature: "Manual food logging", free: true, premium: true },
  { feature: "Calorie & macro tracking", free: true, premium: true },
  { feature: "Weight tracking", free: true, premium: true },
  { feature: "7-day history", free: true, premium: true },
  { feature: "Basic daily AI insight", free: true, premium: true },
  { feature: "AI photo food scan", free: false, premium: true },
  { feature: "Advanced weekly analysis", free: false, premium: true },
  { feature: "Weight prediction", free: false, premium: true },
  { feature: "Smart coaching", free: false, premium: true },
  { feature: "Unlimited history", free: false, premium: true },
  { feature: "Weekly Health Score", free: false, premium: true },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [email, setEmail] = useState("");
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpgrade = () => {
    setShowEarlyAccess(true);
  };

  const handleSubmitEmail = () => {
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: "You're on the list! 🎉", description: "We'll notify you when Premium launches." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-lg font-bold">Plans</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 pb-10 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Crown className="h-3.5 w-3.5" />
            Upgrade Your Health Journey
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Choose Your Plan</h2>
          <p className="text-sm text-muted-foreground">Unlock powerful AI coaching to reach your goals faster.</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-1 rounded-full bg-secondary p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${billing === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${billing === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
          >
            Yearly
            <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-1.5 py-0 hover:bg-primary/15">Save 40%</Badge>
          </button>
        </div>

        {/* Plan Cards */}
        <div className="space-y-4">
          {/* Free Plan */}
          <div className="rounded-2xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Free</h3>
                <p className="text-xs text-muted-foreground">Great for getting started</p>
              </div>
              <Badge variant="outline" className="text-xs">Current Plan</Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">₹0</span>
              <span className="text-sm text-muted-foreground">/ forever</span>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-5 space-y-4 shadow-lg shadow-primary/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground border-0 shadow-md px-3 py-0.5 text-xs">
                ✨ Recommended
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="font-bold text-lg">Premium</h3>
                <p className="text-xs text-muted-foreground">Full AI-powered coaching</p>
              </div>
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-1">
              {billing === "yearly" ? (
                <>
                  <span className="text-3xl font-bold">₹999</span>
                  <span className="text-sm text-muted-foreground">/ year</span>
                  <span className="ml-2 text-xs text-muted-foreground line-through">₹1,788</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">₹149</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </>
              )}
            </div>
            {billing === "yearly" && (
              <p className="text-xs text-primary font-medium">That's just ₹83/month — less than a coffee ☕</p>
            )}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Everything in Free, plus:</p>
              {PREMIUM_FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <Icon className="h-4 w-4 text-primary shrink-0" />
                  {label}
                </div>
              ))}
            </div>
            <Button onClick={handleUpgrade} className="w-full h-12 rounded-2xl text-base font-semibold gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </div>

        {/* Early Access Modal */}
        {showEarlyAccess && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {!submitted ? (
              <>
                <div className="text-center space-y-1">
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-bold text-lg">Payments coming soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Join the early access list and be the first to unlock Premium.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button onClick={handleSubmitEmail} className="rounded-xl shrink-0 px-5">
                    Join
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 py-2">
                <div className="text-3xl">🎉</div>
                <h3 className="font-bold text-lg">You're on the list!</h3>
                <p className="text-sm text-muted-foreground">We'll email you as soon as Premium launches.</p>
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide text-center">Feature Comparison</h3>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_60px] text-xs font-semibold text-muted-foreground border-b px-4 py-3">
              <span>Feature</span>
              <span className="text-center">Free</span>
              <span className="text-center text-primary">Pro</span>
            </div>
            {COMPARISON.map(({ feature, free, premium }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-[1fr_60px_60px] text-sm px-4 py-2.5 ${i < COMPARISON.length - 1 ? "border-b" : ""}`}
              >
                <span className="text-foreground">{feature}</span>
                <span className="flex justify-center">
                  {free ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                </span>
                <span className="flex justify-center">
                  <Check className="h-4 w-4 text-primary" />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground px-6">
          You can cancel anytime. No questions asked. Your free features will always remain available.
        </p>
      </main>
    </div>
  );
};

export default Pricing;
