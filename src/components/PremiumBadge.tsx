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
      <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-2.5 py-0.5 font-semibold hover:bg-primary/10 cursor-default rounded-full">
        Premium Active
      </Badge>
    );
  }

  return (
    <button
      onClick={() => navigate("/pricing")}
      className="group relative flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-bold text-primary transition-all hover:bg-primary/15 press-scale"
    >
      <Crown className="h-3.5 w-3.5" strokeWidth={1.5} />
      <span>PRO</span>
    </button>
  );
};

export default PremiumBadge;
