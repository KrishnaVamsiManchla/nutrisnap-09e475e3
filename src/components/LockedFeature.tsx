import { Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LockedFeatureProps {
  children: React.ReactNode;
  isPremium: boolean;
  featureName?: string;
}

const LockedFeature = ({ children, isPremium, featureName }: LockedFeatureProps) => {
  const navigate = useNavigate();

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content preview */}
      <div className="pointer-events-none select-none blur-[6px] opacity-60">
        {children}
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm rounded-2xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        {featureName && (
          <p className="text-sm font-semibold text-foreground">{featureName}</p>
        )}
        <Button
          size="sm"
          className="rounded-xl gap-1.5 h-9 text-xs font-semibold"
          onClick={() => navigate("/pricing")}
        >
          <Crown className="h-3.5 w-3.5" />
          Unlock Premium
        </Button>
      </div>
    </div>
  );
};

export default LockedFeature;
