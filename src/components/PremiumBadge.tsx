import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PremiumBadgeProps {
  isPremium: boolean;
}

const PremiumBadge = ({ isPremium }: PremiumBadgeProps) => {
  const navigate = useNavigate();

  if (isPremium) {
    return (
      <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-2 py-0.5 font-semibold hover:bg-primary/15 cursor-default">
        Premium Active
      </Badge>
    );
  }

  return (
    <button
      onClick={() => navigate("/pricing")}
      className="group relative flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 transition-all hover:bg-amber-500/20 active:scale-95"
    >
      <Crown className="h-3.5 w-3.5 animate-[pulse_3s_ease-in-out_1]" />
      <span>PRO</span>
      {/* Subtle glow — plays once */}
      <span className="pointer-events-none absolute inset-0 rounded-full animate-[ping_2s_ease-out_1] bg-amber-400/20" />
    </button>
  );
};

export default PremiumBadge;
