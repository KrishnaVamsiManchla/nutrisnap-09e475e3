import { useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Target, UserCircle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onCameraPress?: () => void;
}

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/progress", label: "Progress", icon: TrendingUp },
  { path: "/goals", label: "Daily Goals", icon: Target },
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
            className="absolute -top-5 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-150 active:scale-90"
            style={{ backgroundColor: "hsl(var(--foreground))" }}
            aria-label="AI Camera"
          >
            <Camera className="h-6 w-6 text-background" strokeWidth={1.5} />
          </button>
        )}

        {/* Nav Bar */}
        <nav
          className="flex items-center justify-around rounded-3xl px-2 py-1.5"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 -1px 12px rgba(0,0,0,0.06)",
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
                  "flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 transition-all duration-200 active:scale-95",
                  isActive ? "bg-foreground/8" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground/70"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                  fill={isActive ? "currentColor" : "none"}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted-foreground/70"
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
