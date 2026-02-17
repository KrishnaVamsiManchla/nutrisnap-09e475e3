import { useState } from "react";
import { X, Camera, TrendingUp, CalendarDays, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type NudgeType = "photo-logging" | "weekly-insights" | "full-history";

const NUDGE_CONFIG: Record<NudgeType, { icon: typeof Camera; title: string; message: string; cta: string }> = {
  "photo-logging": {
    icon: Camera,
    title: "Save time with AI photo logging",
    message: "You've been busy logging today! Snap a photo and let AI do the work — it's faster and just as accurate.",
    cta: "See Premium",
  },
  "weekly-insights": {
    icon: TrendingUp,
    title: "Get deeper weekly insights",
    message: "7 days strong! 🔥 Premium unlocks pattern detection, overeating trends, and personalized coaching based on your data.",
    cta: "Unlock Insights",
  },
  "full-history": {
    icon: CalendarDays,
    title: "Unlock full tracking history",
    message: "Free plan includes 7 days of history. Go Premium to access all your past data and spot long-term trends.",
    cta: "View Plans",
  },
};

interface UpgradeNudgeProps {
  type: NudgeType;
  onDismiss?: () => void;
}

const UpgradeNudge = ({ type, onDismiss }: UpgradeNudgeProps) => {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const config = NUDGE_CONFIG[type];
  const Icon = config.icon;

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-tight">{config.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{config.message}</p>
        </div>
      </div>
      <Button
        onClick={() => navigate("/pricing")}
        size="sm"
        className="w-full rounded-xl gap-1.5 h-9 text-xs font-semibold"
      >
        <Crown className="h-3.5 w-3.5" />
        {config.cta}
      </Button>
    </div>
  );
};

export default UpgradeNudge;
