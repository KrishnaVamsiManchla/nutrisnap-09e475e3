import { useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Target, UserCircle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onCameraPress?: () => void;
}

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/progress", label: "Progress", icon: TrendingUp },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/profile", label: "Profile", icon: UserCircle },
];

const BottomNav = ({ onCameraPress }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto w-full max-w-lg px-4 pb-2">
        {/* FAB Camera Button */}
        {onCameraPress && (
          <button
            onClick={onCameraPress}
            className="absolute -top-5 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-elevated press-scale"
            style={{ backgroundColor: "hsl(var(--foreground))" }}
            aria-label="AI Camera"
          >
            <Camera className="h-6 w-6 text-background" strokeWidth={1.5} />
          </button>
        )}

        {/* Nav Bar */}
        <nav
          className="flex items-center justify-around rounded-[22px] px-2 py-1.5"
          style={{
            backgroundColor: "hsl(var(--card) / 0.88)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "var(--shadow-nav)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 transition-all duration-200 press-scale",
                  isActive ? "bg-primary/10" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default BottomNav;
